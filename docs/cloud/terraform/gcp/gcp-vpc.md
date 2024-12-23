
```hcl
# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_network
resource "google_compute_network" "gcp_vpc" {
  name                            = var.gcp_vpc_name
  routing_mode                    = "REGIONAL"
  auto_create_subnetworks         = false
  mtu                             = 1460
  network_firewall_policy_enforcement_order = "AFTER_CLASSIC_FIREWALL"
  delete_default_routes_on_create = false

}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_subnetwork
resource "google_compute_subnetwork" "gcp_vpc_subnet" {
  name                     = var.gcp_vpc_name
  ip_cidr_range            = local.primary_subnet_cidr
  region                   = var.gcp_region
  network                  = google_compute_network.gcp_vpc.id
  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "${var.gke_cluster_name}-k8s-pod-range"
    ip_cidr_range = local.pod_subnet
  }
  secondary_ip_range {
    range_name    = "${var.gke_cluster_name}-k8s-service-range"
    ip_cidr_range = local.service_subnet
  }
}

resource "google_compute_subnetwork" "lb_subnet" {
  name                     = "${var.gke_cluster_name}-lb-subnet"
  ip_cidr_range            = local.region_lb_subnet
  region                   = var.gcp_region
  network                  = google_compute_network.gcp_vpc.id
  purpose                  = "REGIONAL_MANAGED_PROXY"
  role                     = "ACTIVE"
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_router
resource "google_compute_router" "router" {
  name    = "${var.gke_cluster_name}-router"
  region  = var.gcp_region
  network = google_compute_network.gcp_vpc.id
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_router_nat
resource "google_compute_router_nat" "nat" {
  name   = "${var.gke_cluster_name}-nat"
  router = google_compute_router.router.name
  region = var.gcp_region

  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"
  nat_ip_allocate_option             = "MANUAL_ONLY"

  subnetwork {
    name                    = google_compute_subnetwork.gcp_vpc_subnet.id
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }

  nat_ips = [google_compute_address.nat.self_link]
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_address
resource "google_compute_address" "nat" {
  name         = "${var.gke_cluster_name}-nat-address"
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"
}

resource "google_compute_address" "client_endpoint_address" {
  name         = "${var.gke_cluster_name}-client-endpoint-ip-1"
  region       = var.gcp_region
  subnetwork   = google_compute_subnetwork.gcp_vpc_subnet.id
  address_type = "INTERNAL"
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_firewall
resource "google_compute_firewall" "allow-ssh" {
  name    = "${var.gke_cluster_name}-allow-ssh"
  network = google_compute_network.gcp_vpc.name
  source_ranges = [var.gcp_vpc_cidr]

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
}


resource "google_compute_firewall" "fw-allow-health-check" {
  name    = "${var.gke_cluster_name}-fw-allow-health-check"
  network = google_compute_network.gcp_vpc.name
  direction = "INGRESS"
  # google's health check source cidr
  source_ranges = ["130.211.0.0/22", "35.191.0.0/16"]

  allow {
    protocol = "tcp"
    # your apps' ports to allow health check
    ports    = ["80"]
  }
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_firewall
resource "google_compute_firewall" "fw-allow-proxies" {
  name    = "${var.gke_cluster_name}-fw-allow-proxies"
  network = google_compute_network.gcp_vpc.name
  direction = "INGRESS"
  source_ranges = [var.gcp_vpc_cidr]
  target_tags = ["tags"]

  allow {
    protocol = "tcp"
    # ports    = ["443"]
  }
}

# todo: allow client's other vpc cidr

```