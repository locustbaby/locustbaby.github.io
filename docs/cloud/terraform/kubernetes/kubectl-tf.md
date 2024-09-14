providers.tf
```hcl
# https://registry.terraform.io/providers/alekc/kubectl/latest/docs
provider "kubectl" {
  host                   = "https://${google_container_cluster.gke_cluster.endpoint}"
  cluster_ca_certificate = base64decode(google_container_cluster.gke_cluster.master_auth[0].cluster_ca_certificate)
  token                  = data.google_client_config.default.access_token
  load_config_file       = false
}
```

kubectl.tf
```hcl
# archiving for future reference

data "template_file" "sample_apps" {
  template = file("${path.module}/apps_dir/cloudflared.tpl")

  vars = {
    cloudflare_token = var.cloudflare_tunnel_token
  }
}

locals {
  sample_apps_yamls = split("---", data.template_file.sample_apps.rendered)
}

resource "kubectl_manifest" "sample_apps" {
  # should be correct yaml,careful
  for_each = { for idx, yaml in local.sample_apps_yamls : idx => yaml }

  yaml_body = each.value  
}

# archiving end

```

local-exec

https://github.com/terraform-providers/terraform-provider-kubernetes/issues/141

如果有帮助，我经常使用这个工具将YAML文件转换为terraform规范。https://github.com/sl1pm4t/k2tf