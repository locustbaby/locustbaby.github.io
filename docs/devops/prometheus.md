https://blog.csdn.net/zfw_666666/article/details/126351312
https://github.com/prometheus-community/helm-charts/issues/1754
https://www.reddit.com/r/devops/comments/v34fca/enabling_basic_auth_using_kubeprometheusstack/
官方不建议在crd中定义密钥
https://github.com/prometheus-community/helm-charts/issues/2828


```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  labels:
    app.kubernetes.io/component: prometheus
    app.kubernetes.io/instance: k8s
    app.kubernetes.io/name: prometheus
    app.kubernetes.io/part-of: kube-prometheus
    app.kubernetes.io/version: 2.35.0
  name: k8s
  namespace: monitoring
spec:
  containers:
  - name: config-reloader
    args:
    - '--listen-address=:8080'
    - '--reload-url=http://{user}:{passwordd}@localhost:9090/-/reload'
    - '--config-file=/etc/prometheus/config/prometheus.yaml.gz'
    - >-
      --config-envsubst-file=/etc/prometheus/config_out/prometheus.env.yaml
    - '--watched-dir=/etc/prometheus/rules/prometheus-k8s-rulefiles-0'
  - args:
    - --web.console.templates=/etc/prometheus/consoles
    - --web.console.libraries=/etc/prometheus/console_libraries
    - --storage.tsdb.retention.time=24h
    - --config.file=/etc/prometheus/config_out/prometheus.env.yaml
    - --storage.tsdb.path=/prometheus
    - --web.enable-lifecycle
    - --web.route-prefix=/
    - --web.config.file=/etc/prometheus/secrets/{secretname}/web-config.yaml
    name: prometheus
    livenessProbe:
      httpGet:
        httpHeaders:
        - name: Authorization
          value: Basic {user:passwd|base64}
        path: /-/healthy
        port: web
        scheme: HTTP
      timeoutSeconds: 3
      periodSeconds: 5
      successThreshold: 1
      failureThreshold: 6
    readinessProbe:
      httpGet:
        httpHeaders:
        - name: Authorization
          value: Basic {user:passwd|base64}
        path: /-/ready
        port: web
        scheme: HTTP
      timeoutSeconds: 3
      periodSeconds: 5
      successThreshold: 1
      failureThreshold: 3
    startupProbe:
      httpGet:
        httpHeaders:
        - name: Authorization
          value: Basic {user:passwd|base64}
        path: /-/ready
        port: web
        scheme: HTTP
      timeoutSeconds: 3
      periodSeconds: 15
      successThreshold: 1
      failureThreshold: 60
  enableFeatures: []
  externalLabels:
    cluster: {clustername}
```