案例：redpanda，databricks，starrocks，streamnative

#bootstrap权限
权限的最佳体验是databricks gcp；通过Oauth授权；aws也有类似的授权模式
aws更好的体验源于cloudfoundation

# manage 权限
权限的hold并不是好的实践，虽然技术上用户都可以撤销，但是最好下沉到用户侧

control plane 和data plane分离决定了 必须要网络通道，或者仅有权限的时候，权限也足以支撑运行，比如gcp 可以通过云接口创建k8s内的deploy等资源

大的困扰点在于
1. registry，如果使用云的registry，需要授权
2. acm，托管证书不必担心过期总是好的，但是acm需要dns验证，也就是需要交互，麻烦；而证书又是和域名绑定的
3. 创建cloud resource主体
4. privatelink 是安全的，但不是方便的；比如aws 的endpoint必须要有service才行，也需要交互步骤
5. cloudflare tunnel/ngrok的模式比较方便，且都有开源，相比较tunnel更灵活
