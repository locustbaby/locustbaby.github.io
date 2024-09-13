1. terraform是kubectl，但是云不是k8s;所以这是半成品的k8s
2. 模块化并不像函数一样方便，terraform 的命令式执行，与其tf中通过引用module执行，不如创建多个module，使用流水线串联执行
3. ctrl C 会清空你的state！！所以state一定要有成熟的version control，保存每次变更
terraform只是云的傀儡，实际上更多的是领会云的接口设计
比如，aws 可以创建同名的acm；而gcp则不可以，这就导致在设计terraform执行时，要有良好的抽象；
    说白了，terraform state的组织要遵从cloud的资源组织层级来抽象存储

terraform tf definition + vars -> terraform state + cloud resources