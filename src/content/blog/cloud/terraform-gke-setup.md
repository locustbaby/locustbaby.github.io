---
title: "Terraform GKE Setup: From Zero to Production"
date: "2025-03-01"
category: "cloud"
excerpt: "A practical guide to provisioning GKE clusters with Terraform, covering networking, node pools, and security hardening."
tags: ["terraform", "gke", "gcp", "kubernetes"]
---

## Overview

Setting up a production-ready GKE cluster with Terraform requires more than just a `google_container_cluster` resource. This post walks through the full setup including VPC, subnet, node pools, and security configurations.

## VPC and Networking

Before creating the cluster, we need a properly configured VPC with secondary ranges for pods and services.

```hcl
resource "google_compute_network" "main" {
  name                    = "main-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "gke" {
  name          = "gke-subnet"
  ip_cidr_range = "10.0.0.0/20"
  network       = google_compute_network.main.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.4.0.0/14"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.8.0.0/20"
  }
}
```

## Cluster Configuration

The cluster itself should use private nodes, workload identity, and a release channel for automatic upgrades.

```hcl
resource "google_container_cluster" "primary" {
  name     = "primary-cluster"
  location = "us-central1"
  network  = google_compute_network.main.id
  subnetwork = google_compute_subnetwork.gke.id

  private_cluster_config {
    enable_private_nodes    = true
    master_ipv4_cidr_block = "172.16.0.0/28"
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  release_channel {
    channel = "REGULAR"
  }

  remove_default_node_pool = true
  initial_node_count       = 1
}
```

## What's Next

In the next post, we'll cover setting up monitoring with Prometheus and Grafana on this cluster.
