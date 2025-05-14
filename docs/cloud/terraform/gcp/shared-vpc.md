总流程：创建共享子网并供其他项目使用
第 1 步：设置 host project
bash
Copy
Edit
gcloud compute shared-vpc enable HOST_PROJECT_ID
一旦启用，该项目成为 Shared VPC Host 项目。

第 2 步：创建 VPC 网络和子网（在 host project 中）
bash
Copy
Edit
gcloud compute networks create my-vpc \
  --project=HOST_PROJECT_ID \
  --subnet-mode=custom

gcloud compute networks subnets create my-subnet \
  --project=HOST_PROJECT_ID \
  --network=my-vpc \
  --region=us-central1 \
  --range=10.10.0.0/24
这就是共享子网。host 项目下创建的所有 subnet 都是可共享的。

第 3 步：关联 service project 到 host project
bash
Copy
Edit
gcloud compute shared-vpc associated-projects add SERVICE_PROJECT_ID \
  --host-project=HOST_PROJECT_ID
这样 service project 就能使用 host project 中的子网了（如果有权限）。

第 4 步：授权 networkUser 权限（最关键的一步）
你必须给 service project 的成员授予 对 host project 中子网的 roles/compute.networkUser 权限，否则创建 VM/GKE 时会报错。

bash
Copy
Edit
# 推荐绑定到 subnet 资源（精细化权限）
gcloud compute networks subnets add-iam-policy-binding my-subnet \
  --project=HOST_PROJECT_ID \
  --region=us-central1 \
  --member="serviceAccount:my-sa@SERVICE_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.networkUser"
你也可以绑定到整个项目，但不推荐（权限太宽）：

bash
Copy
Edit
gcloud projects add-iam-policy-binding HOST_PROJECT_ID \
  --member="user:dev@example.com" \
  --role="roles/compute.networkUser"
第 5 步：在 service project 中使用共享子网部署资源
bash
Copy
Edit
gcloud compute instances create my-vm \
  --project=SERVICE_PROJECT_ID \
  --zone=us-central1-a \
  --subnet=projects/HOST_PROJECT_ID/regions/us-central1/subnetworks/my-subnet
🧠 总结：关于 subnet 是否自动共享

子网位置	是否自动共享	能否使用（条件）
host project 中	✅ 是共享的	需要关联 service project 且配置 networkUser 权限
service project 自己创建	❌ 不可共享（不能反向共享）	仅可在本项目内部使用




为了限制只有 本项目中的 VM 可以访问 GKE 的 Master API，你需要通过 VPC Service Controls 和 网络策略 结合配置。关键是要确保只有允许的 VM 在同一个项目内能够访问 GKE Master API，同时对其他未经授权的 VM 或网络拒绝访问。

这里我们分两步进行：

使用 VPC Service Controls 限制访问 GKE Master API：这一步可以通过 VPC SC 来限制，确保只有特定的网络或 IP 地址能够访问 GKE 的 Master API。

配置防火墙规则：确保 VM 只有在被授权的情况下，能够通过内网（VPC）访问 GKE Master API。

🎯 方案概述
VPC SC 会定义一个服务边界，限制哪些 IP 地址（来自特定网络或子网）能够访问 GKE Master API。

防火墙规则 确保只有来自本项目 VPC 的 VM 能访问 GKE Master API。

🔒 步骤 1：使用 VPC Service Controls 限制访问 GKE Master API
1️⃣ 创建服务边界，限制 GKE Master API 的访问
首先，创建一个 VPC Service Control 边界，确保只有本项目内的资源可以访问 GKE Master API。

hcl
Copy
Edit
resource "google_access_context_manager_service_perimeter" "gke_perimeter" {
  name         = "accessPolicies/${google_access_context_manager_access_policy.org_policy.name}/servicePerimeters/gke-master-access"
  parent       = google_access_context_manager_access_policy.org_policy.name
  title        = "Restrict access to GKE Master API"
  perimeter_type = "PERIMETER"

  status {
    restricted_services = [
      "container.googleapis.com"   # GKE Master API 服务
    ]
    resources = [
      "projects/your-project-id"  # GKE 集群所在的项目
    ]
  }
}
该配置确保只有 your-project-id 项目内的资源可以访问 GKE Master API。

2️⃣ 配置访问级别（Access Level）
如果你想进一步限制访问，只允许特定的 IP 子网或特定的 VPC 网络来访问 GKE Master API，你可以配置 Access Level：

hcl
Copy
Edit
resource "google_access_context_manager_access_level" "vpc_access_level" {
  parent = google_access_context_manager_access_policy.org_policy.name
  title  = "Allowed VPC Access Level"

  basic {
    conditions {
      ip_subnetworks = ["10.0.0.0/16"]  # 只允许 10.0.0.0/16 VPC 的资源访问
    }
  }
}
ip_subnetworks 允许指定特定的 VPC 网络或 IP 子网进行访问。

3️⃣ 将访问级别应用到服务边界
接下来，应用 Access Level 到服务边界，确保只有符合条件的网络（比如本项目的 VPC）能够访问 GKE Master API。

hcl
Copy
Edit
resource "google_access_context_manager_service_perimeter_resource" "gke_perimeter_resource" {
  parent       = google_access_context_manager_service_perimeter.gke_perimeter.name
  resource     = "projects/your-project-id"
  access_level = google_access_context_manager_access_level.vpc_access_level.name
}
🔥 步骤 2：配置防火墙规则确保 VM 访问 GKE Master API
1️⃣ 创建防火墙规则，允许本项目中的 VM 访问 GKE Master API
通过设置防火墙规则，确保 本项目中的 VM 可以访问 GKE Master API。假设 GKE Master API 端口是 443（HTTPS）。

hcl
Copy
Edit
resource "google_compute_firewall" "allow_gke_master_access" {
  name    = "allow-gke-master-access"
  network = "projects/your-project-id/global/networks/default"  # 替换为你自己的 VPC 网络

  allow {
    protocol = "tcp"
    ports    = ["443"]  # GKE Master API 默认使用 443 端口
  }

  source_tags = ["vm-access-gke-master"]  # 只允许带有该标签的 VM 访问
}
2️⃣ 标签 VM 使其可以访问 GKE Master API
当你创建 VM 时，可以为其添加标签 vm-access-gke-master，这样只有这些 VM 能通过防火墙规则访问 GKE Master API。

hcl
Copy
Edit
resource "google_compute_instance" "gke-access-vm" {
  name         = "gke-access-vm"
  machine_type = "e2-medium"
  zone         = "us-central1-a"
  network_interface {
    network = "projects/your-project-id/global/networks/default"
    access_config {}
  }
  
  tags = ["vm-access-gke-master"]
}
3️⃣ 限制不允许其他网络或项目访问 GKE Master API
可以配置 防火墙规则 来 拒绝 其他未授权网络访问 GKE Master API。

hcl
Copy
Edit
resource "google_compute_firewall" "deny_unauthorized_access" {
  name    = "deny-unauthorized-access"
  network = "projects/your-project-id/global/networks/default"

  deny {
    protocol = "tcp"
    ports    = ["443"]  # 阻止访问 GKE Master API
  }

  source_ranges = ["0.0.0.0/0"]  # 除了已经允许的来源
  priority      = 1000  # 确保这个规则有较低的优先级
}
🔑 效果与验证
允许的 VM：只有在 vm-access-gke-master 标签下的 VM 能访问 GKE Master API。

其他 VM：没有标签或不在 VPC 服务边界内的 VM 无法访问 GKE Master API。

你可以通过 curl 或 kubectl 命令从 VM 中验证是否能够访问 GKE Master API：

bash
Copy
Edit
curl -X GET https://<gke-master-endpoint>/v3/projects/your-project-id/zones/us-central1-a/clusters
如果访问被拒绝，说明配置成功。

🎯 总结
通过结合使用 VPC Service Controls 和防火墙规则，你可以有效地控制哪些资源可以访问 GKE Master API，并确保 只有本项目的 VM 能访问。这样，你就能确保 GKE 集群的安全性，并防止来自外部网络的未经授权访问。

https://cloud.google.com/vpc-service-controls/docs/add-projects-perimeter-terraform?hl=zh-cn