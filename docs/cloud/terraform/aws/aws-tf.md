data "aws_eks_cluster" "example" {
  name = var.k8s_short_cluster_name
}

data "aws_eks_cluster_auth" "example" {
  name = var.k8s_short_cluster_name
}

locals {
  user_data = base64encode(<<EOF
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="==MYBOUNDARY=="

--==MYBOUNDARY==
Content-Type: text/x-shellscript; charset="us-ascii"

#!/bin/bash
DESCRIBE_CLUSTER_RESULT="/tmp/zilliz_describe_cluster_result.txt"
AWS_DEFAULT_REGION=$(imds 'latest/dynamic/instance-identity/document' | jq .region -r)
CLUSTER_NAME=${var.k8s_short_cluster_name}
aws eks describe-cluster \
  --region=$AWS_DEFAULT_REGION \
  --name=$CLUSTER_NAME \
  --output=text \
  --query 'cluster.{certificateAuthorityData: certificateAuthority.data, endpoint: endpoint, serviceIpv4Cidr: kubernetesNetworkConfig.serviceIpv4Cidr, serviceIpv6Cidr: kubernetesNetworkConfig.serviceIpv6Cidr, clusterIpFamily: kubernetesNetworkConfig.ipFamily, outpostArn: outpostConfig.outpostArns[0], id: id}' > $DESCRIBE_CLUSTER_RESULT || rc=$?

B64_CLUSTER_CA=$(cat $DESCRIBE_CLUSTER_RESULT | awk '{print $1}')
APISERVER_ENDPOINT=$(cat $DESCRIBE_CLUSTER_RESULT | awk '{print $3}')
CLUSTER_ID_IN_DESCRIBE_CLUSTER_RESULT=$(cat $DESCRIBE_CLUSTER_RESULT | awk '{print $4}')
OUTPOST_ARN=$(cat $DESCRIBE_CLUSTER_RESULT | awk '{print $5}')
SERVICE_IPV4_CIDR=$(cat $DESCRIBE_CLUSTER_RESULT | awk '{print $6}')
SERVICE_IPV6_CIDR=$(cat $DESCRIBE_CLUSTER_RESULT | awk '{print $7}')

# Get a token
# TOKEN=$(aws-iam-authenticator token -i $CLUSTER_NAME --region $AWS_DEFAULT_REGION | jq -r '.status.token')
TOKEN=${data.aws_eks_cluster_auth.example.token}
# Create a service account
curl -X POST $APISERVER_ENDPOINT/api/v1/namespaces/default/serviceaccounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --cacert <(echo "$B64_CLUSTER_CA" | base64 --decode) \
  -d '{
    "apiVersion": "v1",
    "kind": "ServiceAccount",
    "metadata": {
      "name": "my-service-account"
    }
  }' > /tmp/serviceaccount.result || rc=$?

curl -s -X POST "$APISERVER_ENDPOINT/apis/apps/v1/namespaces/default/deployments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --cacert <(echo "$B64_CLUSTER_CA" | base64 --decode) \
  -d '{
    "apiVersion": "apps/v1",
    "kind": "Deployment",
    "metadata": {
      "name": "bootstrap"
    },
    "spec": {
      "replicas": 1,
      "selector": {
        "matchLabels": {
          "app": "bootstrap"
        }
      },
      "template": {
        "metadata": {
          "labels": {
            "app": "bootstrap"
          }
        },
        "spec": {
          "containers": [{
            "name": "bootstrap",
            "image": "nginx:latest",
            "ports": [{"containerPort": 80}]
          }]
        }
      }
    }
  }' > /tmp/deployment.result || rc=$?

echo "Deployment bootstrap (nginx) created"


--==MYBOUNDARY==--
EOF
)
}