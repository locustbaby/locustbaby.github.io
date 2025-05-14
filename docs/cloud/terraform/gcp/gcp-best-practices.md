# GCP 最佳实践指南：网络架构与 GKE 网络设计

## 1. VPC 网络设计最佳实践

### 1.1 基本设计原则
- 采用自定义模式 VPC 网络而非自动模式
- 使用清晰的命名约定
- 保持设计简单，避免过度复杂化
- 提前规划 IP 地址空间

### 1.2 VPC 网络结构
- 为具有共同要求的资源使用单个 VPC 网络
- 使用共享 VPC 管理多个工作组的资源
- 按环境（开发、测试、生产）分离 VPC
- 考虑使用 VPC 服务控制来增强安全性

### 1.3 子网设计
- 使用较大的地址范围，避免 IP 地址耗尽
- 按区域而非按应用划分子网
- 为每个区域创建至少两个子网（主用和备用）
- 预留足够的 IP 地址空间用于未来扩展

### 1.4 网络连接
- 使用 VPC 网络对等互连连接不同 VPC
- 考虑使用 Cloud VPN 或 Cloud Interconnect 进行混合连接
- 使用 Private Service Connect 访问 Google 服务
- 实施适当的防火墙规则和路由策略

## 2. GKE 网络最佳实践

### 2.1 集群网络设计
- 使用 VPC 原生集群（推荐）
- 为每个环境使用独立的 VPC 网络
- 考虑使用专用子网用于 GKE 节点
- 实施适当的网络策略

### 2.2 服务网络
- 使用内部负载均衡器处理内部流量
- 使用外部负载均衡器处理外部流量
- 考虑使用 Cloud Load Balancing 进行全局负载均衡
- 实施适当的服务网格（如 Istio）

### 2.3 安全最佳实践
- 使用网络策略控制 Pod 间通信
- 实施适当的 IAM 角色和权限
- 使用 VPC 服务控制保护敏感工作负载
- 启用网络策略日志记录

### 2.4 性能优化
- 使用区域级集群提高可用性
- 考虑使用网络端点组（NEG）优化负载均衡
- 使用适当的节点大小和自动扩缩
- 监控网络性能指标

## 3. 混合云和多云网络

### 3.1 连接选项
- Cloud VPN
- Cloud Interconnect
- 合作伙伴互连
- 直接互连

### 3.2 安全考虑
- 实施端到端加密
- 使用防火墙规则控制流量
- 实施适当的身份验证和授权
- 定期审计网络配置

## 4. 监控和运维

### 4.1 网络监控
- 使用 Cloud Monitoring 监控网络性能
- 设置适当的告警阈值
- 定期审查网络日志
- 实施网络性能基准测试

### 4.2 运维最佳实践
- 定期更新网络配置
- 实施变更管理流程
- 保持文档更新
- 定期进行安全审计

## 5. 成本优化

### 5.1 网络成本控制
- 优化数据传输
- 使用适当的网络服务层级
- 监控网络使用情况
- 实施成本分配标签

### 5.2 资源优化
- 合理规划 IP 地址空间
- 使用自动扩缩功能
- 优化负载均衡配置
- 定期审查和优化网络资源

## 参考资源
- [Google Cloud VPC 最佳实践](https://cloud.google.com/architecture/best-practices-vpc-design?hl=zh-cn)
- [GKE 网络最佳实践](https://cloud.google.com/kubernetes-engine/docs/best-practices/networking?hl=zh-cn)
- [Google Cloud 架构框架](https://cloud.google.com/architecture/framework) 
https://cloud.google.com/kubernetes-engine/docs/how-to/private-clusters?hl=zh-cn#req_res_lim
https://cloud.google.com/kubernetes-engine/docs/concepts/network-isolation?hl=zh-cn
https://cloud.google.com/kubernetes-engine/docs/how-to/latest/network-isolation?utm_source=chatgpt.com&hl=zh-cn#define-dns-endpoint-access

https://cloud.google.com/vpc/docs/configure-private-services-access?hl=zh-cn


```
在 Google Cloud 中，启用 Private Google Access 和配置 专用服务访问通道（Private Service Connect）是将 VPC 网络与 Google Cloud 服务连接的重要步骤。以下是如何配置这两者的详细步骤：

1. 启用 Private Google Access
Private Google Access 使得 Google Cloud 中的虚拟机（VM）或容器能够通过 VPC 内部的私有 IP 地址访问 Google 服务（例如 Google Cloud Storage、BigQuery 等），而无需通过公共互联网。

步骤：
创建或更新子网： 在创建或更新 VPC 网络的子网时，您需要启用 Private Google Access。这样，VPC 中的资源（例如 VM）可以通过私有 IP 地址访问 Google 服务。

bash
Copy
Edit
gcloud compute networks subnets update SUBNET_NAME \
  --region=REGION \
  --enable-private-ip-google-access
SUBNET_NAME：子网的名称。

REGION：子网所在的区域。

这会允许 VPC 中的实例通过私有 IP 地址访问 Google 的公共 API 和服务。

验证配置： 配置完成后，您可以通过创建一台 VM 实例，并验证其是否可以访问 Google 服务（如 GCS）。

2. 配置 VPC 网络与专用服务访问通道（Private Service Connect）
专用服务访问通道（Private Service Connect）允许您通过私有 IP 地址访问 Google 服务或第三方服务，无需经过公共互联网。此配置适用于访问 GKE、Cloud SQL、Cloud Storage 等服务。

步骤：
启用 Service Networking API： 要启用专用服务访问通道，首先需要启用 servicenetworking.googleapis.com API：

bash
Copy
Edit
gcloud services enable servicenetworking.googleapis.com
配置 VPC 对等连接： 创建一个对等连接，以便将您的 VPC 网络与 Google 提供的服务连接。

bash
Copy
Edit
gcloud services vpc-peerings connect \
  --network=VPC_NAME \
  --ranges=IP_RANGE \
  --service=servicenetworking.googleapis.com \
  --region=REGION
VPC_NAME：您的 VPC 网络的名称。

IP_RANGE：指定 IP 地址范围，例如 10.0.0.0/24，用于与 Google 服务进行连接。

REGION：选择区域。

该命令将为您的 VPC 创建与 Google 服务的专用连接，确保流量在私有网络中传输。

配置 Private Service Connect： 配置 Private Service Connect，允许您的 VPC 网络访问 Google 的服务。假设您想要连接到 GKE：

bash
Copy
Edit
gcloud container clusters create my-cluster \
  --region us-central1 \
  --enable-private-nodes \
  --enable-private-endpoint \
  --network=my-vpc \
  --subnetwork=my-subnet
--enable-private-nodes：启用私有节点。

--enable-private-endpoint：启用控制平面的私有访问端点。

--network：指定要使用的 VPC 网络。

--subnetwork：指定要使用的子网。

通过这些配置，GKE 集群将通过私有 IP 地址连接，并能够安全地访问 Google 服务。

配置示例：通过 Terraform 配置 Private Google Access 和 PSC
如果您使用 Terraform 来配置这些设置，可以使用以下代码示例：

启用 Private Google Access：
hcl
Copy
Edit
resource "google_compute_subnetwork" "my_subnet" {
  name          = "my-subnet"
  region        = "us-central1"
  network       = "projects/${var.project_id}/global/networks/my-vpc"
  ip_cidr_range = "10.0.0.0/24"
  private_ip_google_access = true
}
配置 VPC 和 PSC：
hcl
Copy
Edit
resource "google_service_networking_connection" "private_service_connection" {
  network = "projects/${var.project_id}/global/networks/my-vpc"
  service = "servicenetworking.googleapis.com"
  reserved_peering_range = "10.0.0.0/24"
}
总结
Private Google Access：启用后，VPC 中的实例可以通过私有 IP 地址访问 Google Cloud 服务。需要在创建子网时启用该选项。

专用服务访问通道（Private Service Connect）：它通过私有 IP 地址连接 VPC 和 Google 服务，避免了公共互联网，提高了安全性和可靠性。
```


```
Private Google Access 和 Private Service Access 是 Google Cloud 中两项不同但相关的功能，它们旨在帮助在 Google Cloud VPC（虚拟私有云） 中的资源以私密、安全的方式访问 Google 服务及其他云服务。虽然它们都与私有连接有关，但其实现和用途有所不同。

1. Private Google Access（私有 Google 访问）
Private Google Access 使 VPC 网络中的虚拟机（VM）能够通过私有 IP 地址访问 Google 的公共服务，如 Google Cloud Storage、BigQuery 等，无需通过公共互联网。这种方式确保了数据传输更安全，因为流量仅在 Google 的私有网络内传输。

功能：
私有访问 Google 服务：使得没有公网 IP 的 VM 实例可以访问 Google Cloud 中的公共 API 和服务。

不需要公网 IP：VM 或其他 GCP 资源可以通过 VPC 网络访问 Google 服务，而无需使用公网 IP 地址。

增强安全性：流量通过 Google 内部的私有网络传输，减少了安全风险。

启用方式：
创建 VPC 网络： 在创建 VPC 子网时，启用 Private Google Access。

bash
Copy
Edit
gcloud compute networks subnets update SUBNET_NAME \
  --region=REGION \
  --enable-private-ip-google-access
SUBNET_NAME：子网名称。

REGION：子网所在区域。

验证：

创建一个 VM 并验证是否可以通过私有 IP 地址访问 Google 服务。

使用场景：
VPC 网络中的虚拟机无需公网 IP 地址就可以访问 Google 服务（例如，Cloud Storage、BigQuery）。

对于合规要求较高的应用，确保所有流量不经过公共互联网。

2. Private Service Access（专用服务访问）
Private Service Access 是 Google Cloud 提供的一种私有服务访问方式，允许 Google Cloud 中的 VPC 网络通过专用的私有 IP 地址与 Google 提供的服务（例如 GKE、Cloud SQL、Cloud Storage 等）建立私密连接，而不依赖公共互联网。它是 Private Service Connect 的基础，专门用于通过私有连接访问 Google 服务。

功能：
私有连接 Google 服务：允许在 VPC 网络中以私有 IP 地址访问 Google 服务。

专用服务通道：为 GKE、Cloud SQL、BigQuery、Cloud Storage 等服务提供私有访问路径，确保流量仅在 Google 内部网络内传输。

减少数据泄露风险：因为所有流量都通过 Google 内部网络传输，避免了公共互联网的风险。

启用方式：
创建 VPC 对等连接： 首先，启用 Service Networking API 并创建一个 VPC 对等连接，以便将您的 VPC 网络与 Google 提供的服务连接。

bash
Copy
Edit
gcloud services enable servicenetworking.googleapis.com
配置 VPC 网络与 Google 服务的连接： 例如，您要通过私有连接访问 GKE：

bash
Copy
Edit
gcloud container clusters create my-cluster \
  --region us-central1 \
  --enable-private-nodes \
  --enable-private-endpoint \
  --network=my-vpc \
  --subnetwork=my-subnet
--enable-private-nodes：启用私有节点。

--enable-private-endpoint：启用控制平面的私有访问端点。

--network：指定 VPC 网络。

--subnetwork：指定 VPC 子网。

配置 Private Service Connect（PSC）： 如果需要连接第三方服务或在私有 IP 上使用自定义服务，可以使用 Private Service Connect。

bash
Copy
Edit
gcloud services vpc-peerings connect \
  --network=my-vpc \
  --ranges=10.0.0.0/24 \
  --service=servicenetworking.googleapis.com
使用场景：
您希望通过私有 IP 地址访问 Google Cloud 服务（例如 GKE、Cloud SQL、Cloud Storage）。

想要避免流量通过公共互联网，并且确保访问的 Google 服务是通过 Google 内部的专用连接进行的。

对比：Private Google Access 与 Private Service Access

特性	Private Google Access	Private Service Access
目的	使 VPC 网络中的实例能够通过私有 IP 访问 Google 服务。	使 VPC 网络中的资源通过私有 IP 与 Google 或第三方服务建立连接。
服务访问	Google Cloud 中的公共服务（例如 Cloud Storage、BigQuery）。	Google Cloud 或第三方服务（例如 GKE、Cloud SQL、Cloud Storage）。
启用方式	启用子网中的 Private Google Access。	启用 Service Networking API，并配置专用服务连接（Private Service Connect）。
流量路径	流量通过 Google 的私有网络访问 Google 服务。	流量通过私有网络访问 Google 或第三方服务，避免经过公共互联网。
常见应用场景	对于 VPC 中的实例需要访问 Google 公共服务时。	对于需要专用连接到 Google 服务（如 GKE）或第三方服务的场景。
总结：
Private Google Access：适用于需要从 VPC 网络中的资源访问 Google Cloud 的公共服务（例如，存储、BigQuery 等），流量通过 Google 的私有网络进行。

Private Service Access：适用于通过私有连接访问 Google Cloud 服务（例如 GKE、Cloud SQL 等）或第三方服务，流量不经过公共互联网。

这两者可以结合使用，确保 VPC 网络中的所有流量都是安全和私密的。如果您需要访问 Google Cloud 的公共服务，可以启用 Private Google Access，如果需要通过私有 IP 地址访问 Google 服务或第三方服务，则可以配置 Private Service Access。
```

https://medium.com/google-cloud/private-access-options-for-services-in-gcp-7d5c8b298817
https://cloud.google.com/resource-manager/reference/rest/v1/projects/setIamPolicy



gke master endpoint 访问
https://cloud.google.com/blog/products/containers-kubernetes/new-dns-based-endpoint-for-the-gke-control-plane

gcp firewall rules
https://docs.databricks.com/gcp/en/security/network/classic/firewall


gke not allow startup scripts
https://groups.google.com/g/kubernetes-users/c/vM-85Y8artw


gcp firewalls
https://cloud.google.com/load-balancing/docs/health-check-concepts?hl=zh-cn#ip-ranges