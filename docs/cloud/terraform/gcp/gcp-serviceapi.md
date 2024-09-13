```hcl
# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_project_service
resource "google_project_service" "compute" {
  project = var.gcp_project_id
  service = "compute.googleapis.com"
  
  disable_dependent_services = true
}

resource "google_project_service" "container" {
  project = var.gcp_project_id
  service = "container.googleapis.com"
  
  depends_on = [google_project_service.compute]
}

resource "google_project_service" "certificate_manager" {
  project = var.gcp_project_id
  service = "certificatemanager.googleapis.com"
  
  depends_on = [google_project_service.compute]
}
```