helm.tf
```hcl
resource "helm_release" "sample_app" {
  name       = "sample_app"
  chart      = "./sample_app"
  version    = "1.0.0"
  
  values = [
    file("${path.module}/sample_app/values.yaml")
  ]
}
```

providers.tf
```hcl
# https://registry.terraform.io/providers/hashicorp/helm/latest/docs#credentials-config
provider "helm" {
  kubernetes {
    host                   = "https://${google_container_cluster.gke_cluster.endpoint}"
    cluster_ca_certificate = base64decode(google_container_cluster.gke_cluster.master_auth[0].cluster_ca_certificate)
    token                  = data.google_client_config.default.access_token

  }
}
```