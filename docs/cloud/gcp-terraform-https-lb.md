# Create HTTPS LB with Certificate Manager certs

```hcl
resource "google_compute_address" "client_lb_ip" {
  name = "client-lb-ip"
  region       = var.gcp_region
  subnetwork   = data.google_compute_subnetwork.client_subnet.id
  address_type = "INTERNAL"
}
```