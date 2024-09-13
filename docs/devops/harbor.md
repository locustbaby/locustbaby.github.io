sign for harbor internal tls
```bash
openssl genrsa -out ca.key 2048
openssl req -new -x509 -days 36500 -key ca.key -out ca.pem
openssl genrsa -out harbor.key 2048
openssl req -new -key harbor.key -out harbor.csr
openssl x509 -req -in harbor.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out harbor.pem -days 36500 -extfile ext
```
ext:
```
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName=@SubjectAlternativeName

[SubjectAlternativeName]
DNS.1=localhost
DNS.2=harbor-core
DNS.3=harbor-registry
DNS.4=harbor-jobservice
DNS.5=harbor-portal
IP.1=127.0.0.1
```

https://www.chenshaowen.com/blog/support-https-access-harbor-using-self-signed-cert.html

扩容jobservice可以增加worker数

harbor replication rule : https://goharbor.io/docs/1.10/administration/configuring-replication/create-replication-rules/


harbor镜像保留策略：push/pull 30个，pull 360days

good tools for sync image：skopeo,regclient

jenkins job设计，保证发布的app有image

```groovy
pipeline {
    agent {
        kubernetes {
            inheritFrom 'host-network'
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: skopeo
  namespace: jenkins
spec:
  containers:
  - name: skopeo
    image: quay.io/skopeo/stable:v1.15.2
    command:
    - cat
    tty: true

'''
            defaultContainer 'skopeo'
        }
    }
    parameters {
        string(
            description: 'docker image opensource ',
            name: 'src',
            defaultValue: 'dockerhub'
        )
        string(
            description: 'dest image ',
            name: 'dest',
            defaultValue: 'localharbor'
        )
    }
    stages {
        stage('Sync Docker Image') {
            steps {
                script {
                    // Define a map of destination repos and their corresponding credentials
                    def credentialsMap = [
                        "local.harbor.com" : "harbor-local"
                    ]

                    // Extract the destination repo from the dest parameter
                    def destRepo = dest.split('/')[0]

                    // Get the corresponding credential ID from the map
                    def credentialId = credentialsMap[destRepo]

                    if (credentialId == null) {
                        error("No credentials found for destination repository: ${destRepo}")
                    }

                    // Use the selected credentials to authenticate and sync the image
                    withCredentials([usernamePassword(credentialsId: credentialId, usernameVariable: 'CI_REGISTRY_USERNAME', passwordVariable: 'CI_REGISTRY_PASSWORD')]) {
                        sh "skopeo login ${destRepo} -u '${CI_REGISTRY_USERNAME}' -p '${CI_REGISTRY_PASSWORD}'"
                        sh """
                            skopeo copy docker://${src} docker://${dest} -a
                        """
                        sh "echo image is ${dest}"
                    }
                }
            }
        }
    }
}

```
