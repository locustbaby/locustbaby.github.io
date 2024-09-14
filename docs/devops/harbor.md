sign for harbor internal tls
```bash
openssl genrsa -out ca.key 2048
openssl req -new -x509 -days 36500 -key ca.key -out ca.pem
openssl genrsa -out harbor.key 2048
openssl req -new -key harbor.key -out harbor.csr
openssl x509 -req -in harbor.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out harbor.pem -days 36500 -extfile ext
```
ext:
```
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName=@SubjectAlternativeName

[SubjectAlternativeName]
DNS.1=localhost
DNS.2=harbor-core
DNS.3=harbor-registry
DNS.4=harbor-jobservice
DNS.5=harbor-portal
IP.1=127.0.0.1
```

https://www.chenshaowen.com/blog/support-https-access-harbor-using-self-signed-cert.html

扩容jobservice可以增加worker数

harbor replication rule : https://goharbor.io/docs/1.10/administration/configuring-replication/create-replication-rules/


harbor镜像保留策略：push/pull 30个，pull 360days

good tools for sync image：skopeo,regclient

jenkins job设计，保证发布的app有image

```groovy
pipeline {
    agent {
        kubernetes {
            inheritFrom 'host-network'
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: skopeo
  namespace: jenkins
spec:
  containers:
  - name: skopeo
    image: quay.io/skopeo/stable:v1.15.2
    command:
    - cat
    tty: true

'''
            defaultContainer 'skopeo'
        }
    }
    parameters {
        string(
            description: 'docker image opensource ',
            name: 'src',
            defaultValue: 'dockerhub'
        )
        string(
            description: 'dest image ',
            name: 'dest',
            defaultValue: 'localharbor'
        )
    }
    stages {
        stage('Sync Docker Image') {
            steps {
                script {
                    // Define a map of destination repos and their corresponding credentials
                    def credentialsMap = [
                        "local.harbor.com" : "harbor-local"
                    ]

                    // Extract the destination repo from the dest parameter
                    def destRepo = dest.split('/')[0]

                    // Get the corresponding credential ID from the map
                    def credentialId = credentialsMap[destRepo]

                    if (credentialId == null) {
                        error("No credentials found for destination repository: ${destRepo}")
                    }

                    // Use the selected credentials to authenticate and sync the image
                    withCredentials([usernamePassword(credentialsId: credentialId, usernameVariable: 'CI_REGISTRY_USERNAME', passwordVariable: 'CI_REGISTRY_PASSWORD')]) {
                        sh "skopeo login ${destRepo} -u '${CI_REGISTRY_USERNAME}' -p '${CI_REGISTRY_PASSWORD}'"
                        sh """
                            skopeo copy docker://${src} docker://${dest} -a
                        """
                        sh "echo image is ${dest}"
                    }
                }
            }
        }
    }
}

```


```yaml
appVersion: 2.9.1
caSecretName: ""
cache:
  enabled: false
  expireHours: 24
core:
  affinity: {}
  artifactPullAsyncFlushDuration: null
  automountServiceAccountToken: false
  configureUserSettings: null
  extraEnvVars: []
  gdpr:
    deleteUser: false
  image:
    repository: goharbor/harbor-core
    tag: v2.9.1
  nodeSelector: {}
  podAnnotations: {}
  podLabels: {}
  priorityClassName: null
  quotaUpdateProvider: db
  replicas: 1
  revisionHistoryLimit: 10
  secret: ""
  secretName: ""
  serviceAccountName: ""
  serviceAnnotations: {}
  startupProbe:
    enabled: true
    initialDelaySeconds: 10
  tokenCert: ""
  tokenKey: ""
  tolerations: []
  topologySpreadConstraints: []
  xsrfKey: ""
database:
  external:
    coreDatabase: registry
    existingSecret: ""
    host: pg-host
    password: pgpasswd
    port: "5432"
    sslmode: disable
    username: postgres
  internal:
    affinity: {}
    automountServiceAccountToken: false
    extraEnvVars: []
    image:
      repository: goharbor/harbor-db
      tag: v2.9.1
    initContainer:
      migrator: {}
      permissions: {}
    livenessProbe:
      timeoutSeconds: 1
    nodeSelector: {}
    password: changeit
    priorityClassName: null
    readinessProbe:
      timeoutSeconds: 1
    serviceAccountName: ""
    shmSizeLimit: 512Mi
    tolerations: []
  maxIdleConns: 100
  maxOpenConns: 900
  podAnnotations: {}
  podLabels: {}
  type: external
enableMigrateHelmHook: false
existingSecretAdminPasswordKey: HARBOR_ADMIN_PASSWORD
existingSecretSecretKey: ""
exporter:
  affinity: {}
  automountServiceAccountToken: false
  cacheCleanInterval: 14400
  cacheDuration: 23
  extraEnvVars: []
  image:
    repository: goharbor/harbor-exporter
    tag: v2.9.1
  nodeSelector: {}
  podAnnotations: {}
  podLabels: {}
  priorityClassName: null
  replicas: 1
  revisionHistoryLimit: 10
  serviceAccountName: ""
  tolerations: []
  topologySpreadConstraints: []
expose:
  clusterIP:
    annotations: {}
    name: harbor
    ports:
      httpPort: 80
      httpsPort: 443
  ingress:
    annotations:
      ingress.kubernetes.io/proxy-body-size: "0"
      ingress.kubernetes.io/ssl-redirect: "true"
      nginx.ingress.kubernetes.io/proxy-body-size: "0"
      nginx.ingress.kubernetes.io/ssl-redirect: "true"
    className: alb
    controller: default
    harbor:
      annotations: {}
      labels: {}
    hosts:
      core: harbor.domain.com
    kubeVersionOverride: ""
  loadBalancer:
    IP: ""
    annotations: {}
    name: harbor
    ports:
      httpPort: 80
      httpsPort: 443
    sourceRanges: []
  nodePort:
    name: harbor
    ports:
      http:
        nodePort: 30002
        port: 80
      https:
        nodePort: 30003
        port: 443
  tls:
    auto:
      commonName: ""
    certSource: none
    enabled: true
    secret:
      secretName: ""
  type: ingress
externalURL: https://harbor.domain.com
harborAdminPassword: harborpassword
imagePullPolicy: IfNotPresent
imagePullSecrets: null
internalTLS:
  certSource: auto
  core:
    crt: ""
    key: ""
    secretName: ""
  enabled: false
  jobservice:
    crt: ""
    key: ""
    secretName: ""
  portal:
    crt: ""
    key: ""
    secretName: ""
  registry:
    crt: ""
    key: ""
    secretName: ""
  strong_ssl_ciphers: false
  trivy:
    crt: ""
    key: ""
    secretName: ""
  trustCa: ""
ipFamily:
  ipv4:
    enabled: true
  ipv6:
    enabled: false
jobservice:
  affinity: {}
  automountServiceAccountToken: false
  extraEnvVars: []
  image:
    repository: goharbor/harbor-jobservice
    tag: v2.9.1
  jobLoggers:
  - file
  loggerSweeperDuration: 14
  maxJobWorkers: 10
  nodeSelector: {}
  notification:
    webhook_job_http_client_timeout: 3
    webhook_job_max_retry: 3
  podAnnotations: {}
  podLabels: {}
  priorityClassName: null
  reaper:
    max_dangling_hours: 168
    max_update_hours: 24
  replicas: 1
  revisionHistoryLimit: 10
  secret: ""
  serviceAccountName: ""
  tolerations: []
  topologySpreadConstraints: null
logLevel: info
metrics:
  core:
    path: /metrics
    port: 8001
  enabled: true
  exporter:
    path: /metrics
    port: 8001
  jobservice:
    path: /metrics
    port: 8001
  registry:
    path: /metrics
    port: 8001
  serviceMonitor:
    additionalLabels: {}
    enabled: false
    interval: ""
    metricRelabelings: []
    relabelings: []
nginx:
  affinity: {}
  automountServiceAccountToken: false
  extraEnvVars: []
  image:
    repository: goharbor/nginx-photon
    tag: v2.9.1
  nodeSelector: {}
  podAnnotations: {}
  podLabels: {}
  priorityClassName: null
  replicas: 1
  revisionHistoryLimit: 10
  serviceAccountName: ""
  tolerations: []
  topologySpreadConstraints: []
persistence:
  enabled: true
  imageChartStorage:
    azure:
      accountkey: base64encodedaccountkey
      accountname: accountname
      container: containername
      existingSecret: ""
    disableredirect: false
    filesystem:
      rootdirectory: /storage
    gcs:
      bucket: bucketname
      encodedkey: base64-encoded-json-key-file
      existingSecret: ""
      useWorkloadIdentity: false
    oss:
      accesskeyid: oss-ak
      accesskeysecret: oss-sk
      bucket: bucket-name
      endpoint: bucket-name-endpoint
      internal: false
      region: oss-region
      secure: true
    s3:
      bucket: bucketname
      region: us-west-1
    swift:
      authurl: https://storage.myprovider.com/v3/auth
      container: containername
      password: password
      username: username
    type: oss
  persistentVolumeClaim:
    database:
      accessMode: ReadWriteOnce
      annotations: {}
      existingClaim: ""
      size: 1Gi
      storageClass: ""
      subPath: ""
    jobservice:
      jobLog:
        accessMode: ReadWriteMany
        annotations: {}
        existingClaim: harbor-jobservice
        size: 1Gi
        storageClass: '-'
        subPath: ""
    redis:
      accessMode: ReadWriteOnce
      annotations: {}
      existingClaim: ""
      size: 1Gi
      storageClass: ""
      subPath: ""
    registry:
      accessMode: ReadWriteMany
      annotations: {}
      existingClaim: harbor-registry
      size: 5Gi
      storageClass: '-'
      subPath: ""
    trivy:
      accessMode: ReadWriteOnce
      annotations: {}
      existingClaim: ""
      size: 5Gi
      storageClass: ""
      subPath: ""
  resourcePolicy: keep
portal:
  affinity: {}
  automountServiceAccountToken: false
  extraEnvVars: []
  image:
    repository: goharbor/harbor-portal
    tag: v2.9.1
  nodeSelector: {}
  podAnnotations: {}
  podLabels: {}
  priorityClassName: null
  replicas: 1
  revisionHistoryLimit: 10
  serviceAccountName: ""
  tolerations: []
  topologySpreadConstraints: []
proxy:
  components:
  - core
  - jobservice
  - trivy
  httpProxy: null
  httpsProxy: null
  noProxy: 127.0.0.1,localhost,.local,.internal
redis:
  external:
    addr: redis-host:6379
    coreDatabaseIndex: "0"
    existingSecret: ""
    jobserviceDatabaseIndex: "1"
    password: redis-password
    registryDatabaseIndex: "2"
    sentinelMasterSet: ""
    trivyAdapterIndex: "5"
    username: ""
  internal:
    affinity: {}
    automountServiceAccountToken: false
    extraEnvVars: []
    image:
      repository: goharbor/redis-photon
      tag: v2.9.1
    jobserviceDatabaseIndex: "1"
    nodeSelector: {}
    priorityClassName: null
    registryDatabaseIndex: "2"
    serviceAccountName: ""
    tolerations: []
    trivyAdapterIndex: "5"
  podAnnotations: {}
  podLabels: {}
  type: external
registry:
  affinity: {}
  automountServiceAccountToken: false
  controller:
    extraEnvVars: []
    image:
      repository: goharbor/harbor-registryctl
      tag: v2.9.1
  credentials:
    existingSecret: ""
    existingSecretKey: REGISTRY_HTTP_SECRET
    password: harbor_registry_password
    username: harbor_registry_user
  middleware:
    cloudFront:
      baseurl: example.cloudfront.net
      duration: 3000s
      ipfilteredby: none
      keypairid: KEYPAIRID
      privateKeySecret: my-secret
    enabled: false
    type: cloudFront
  nodeSelector: {}
  podAnnotations: {}
  podLabels: {}
  priorityClassName: null
  registry:
    extraEnvVars: []
    image:
      repository: goharbor/registry-photon
      tag: v2.9.1
  relativeurls: false
  replicas: 1
  revisionHistoryLimit: 10
  secret: ""
  serviceAccountName: ""
  tolerations: []
  topologySpreadConstraints: []
  upload_purging:
    age: 168h
    dryrun: false
    enabled: true
    interval: 24h
secretKey: not-a-secure-key
trace:
  enabled: false
  jaeger:
    endpoint: http://hostname:14268/api/traces
  otel:
    compression: false
    endpoint: hostname:4318
    insecure: true
    timeout: 10
    url_path: /v1/traces
  provider: jaeger
  sample_rate: 1
trivy:
  affinity: {}
  automountServiceAccountToken: false
  debugMode: false
  enabled: false
  extraEnvVars: []
  gitHubToken: ""
  ignoreUnfixed: false
  image:
    repository: goharbor/trivy-adapter-photon
    tag: v2.9.1
  insecure: false
  nodeSelector: {}
  offlineScan: false
  podAnnotations: {}
  podLabels: {}
  priorityClassName: null
  replicas: 1
  resources:
    limits:
      cpu: 1
      memory: 1Gi
    requests:
      cpu: 200m
      memory: 512Mi
  securityCheck: vuln
  serviceAccountName: ""
  severity: UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL
  skipUpdate: false
  timeout: 5m0s
  tolerations: []
  topologySpreadConstraints: []
  vulnType: os,library
updateStrategy:
  type: RollingUpdate
```