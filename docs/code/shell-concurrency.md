# Concurrency and lock in bash

## flock

```bash
# flock 无法自控并发，文件🔒 为单锁
单锁 https://my.oschina.net/leejun2005/blog/108656
https://blog.lujun9972.win/blog/2019/02/15/linux-shell-flock%E6%96%87%E4%BB%B6%E9%94%81%E7%9A%84%E7%94%A8%E6%B3%95%E5%8F%8A%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9/index.html
# 单锁
exec 3<>/tmp/lock
flock -n 3
[[ $? -eq 1 ]] && exit
date


# 并发抢占单锁
#!/bin/bash
function com() {
    echo $(($(cat $1)+1)) >$1
    sleep 1
    echo $(($(cat $1)-1)) >$1
}
function te() {
    if [[ -s $1 ]];then
        if [[ $(cat $1) -lt 3 ]];then
            com $1
        else
            echo "$$ locked" && flock 9 && com $1 && echo "$$ unclock"
        fi
    else
        echo 0 >$1 && te $1
    fi
} 9<>$1
te $@
```

## mkfifo 管道是天然的队列，自控并发实现
```bash
#!/bin/bash
trap "rm -f AAA" EXIT
function run() {
now=$(date +%s)
read -u 7
sleep 4 # do
echo "success"
echo $(($(date +%s)-$now))
echo 1>&7
}
if [[ -p AAA ]];then
    exec 7<>AAA
    run
else
    tmp=/tmp/lock
		echo -e "[[ ! -p AAA ]] && mkfifo 2>/dev/null AAA && { echo 1 > AAA & \n echo 2 > AAA & }" >$tmp && source $tmp
		exec 7<>AAA
    run
fi
#关闭读写
exec 3	<&-   #关闭文件描述符的读
exec 3>&-   #关闭文件描述符的写

```

## 管道

```shell
#!/bin/bash

[ -e /tmp/fd1 ] || mkfifo /tmp/fd1 #创建有名管道
exec 3<>/tmp/fd1                   #创建文件描述符，以可读（<）可写（>）的方式关联管道文件，这时候文件描述符3就有了有名管道文件的所有特性
rm -rf /tmp/fd1                    #关联后的文件描述符拥有管道文件的所有特性,所以这时管道文件可以删除，我们留下文件描述符来用就可以
for ((i=1;i<=10;i++))
do
        echo >&3                   #&3代表引用文件描述符3，这条命令代表往管道里面放入了一个"令牌"，文件描述符可以使用0/1/2/225之外的其他数字，这几个已被占用
done
 
for ((i=1;i<=100;i++))
do
read -u3                           #代表从管道中读取一个令牌
{
        sleep 1  #sleep 1用来模仿执行一条命令需要花费的时间（可以用真实命令来代替）
        echo 'success'$i       
        echo >&3                   #代表我这一次命令执行到最后，把令牌放回管道
}&
done
wait
 
exec 3<&-                       #关闭文件描述符的读
exec 3>&-                       #关闭文件描述符的写
```

管道通信

mkfifo或mknod timeout


