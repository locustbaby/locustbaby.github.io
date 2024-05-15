# Set Up GPU Node Pool on GKE and Deploy DCGM Exporter

## Create GPU NodeGroup

```bash
gcloud container node-pools create gpu-time-sharing-highmem     --cluster=your_cluster_name     --machine-type=n1-highmem-4     --region=us-west1     --node-locations "us-west1-a"     --accelerator=type=nvidia-tesla-t4,count=1,gpu-sharing-strategy=time-sharing,max-shared-clients-per-gpu=8
```

## [install gpu on gke](https://cloud.google.com/kubernetes-engine/docs/how-to/gpus?hl=zh-cn#installing_drivers)

## helm install [dcgm-exporter](https://github.com/NVIDIA/dcgm-exporter)


```
helm repo add gpu-helm-charts \
  https://nvidia.github.io/dcgm-exporter/helm-charts
helm repo update
helm install \
    --generate-name \
    gpu-helm-charts/dcgm-exporter -n kube-system \
    -f dcgm.yaml
```

>  `-n kube-system` can fix the error: `Error creating: insufficient quota to match these scopes: [{PriorityClass In [system-node-critical system-cluster-critical]}]`

### dcgm.yaml
```
serviceMonitor:
  enabled: true

resources:
  limits:
    cpu: 100m
    # increase memory if OOM
    memory: 200Mi
  requests:
    cpu: 100m
    memory: 128Mi

securityContext:
  privileged: true

tolerations:
  - operator: Exists

affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
            - key: cloud.google.com/gke-accelerator
              operator: Exists

# can ignore below
podAnnotations:
  ad.datadoghq.com/exporter.check_names: |
          ["openmetrics"]
  ad.datadoghq.com/exporter.init_configs: |
          [{}]
  ad.datadoghq.com/exporter.instances: |
    [
      {
        "openmetrics_endpoint": "http://%%host%%:9400/metrics",
        "namespace": "nvidia-dcgm-exporter",
        "metrics": [{"*":"*"}]
      }
    ]

extraHostVolumes:
  - name: vulkan-icd-mount
    hostPath: /home/kubernetes/bin/nvidia/vulkan/icd.d
  - name: nvidia-install-dir-host
    hostPath: /home/kubernetes/bin/nvidia

extraVolumeMounts:
  - name: nvidia-install-dir-host
    mountPath: /usr/local/nvidia
    readOnly: true
  - name: vulkan-icd-mount
    mountPath: /etc/vulkan/icd.d
    readOnly: true
```

Refer: 
[Error: Failed to initialize NVML](https://github.com/NVIDIA/dcgm-exporter/issues/59)