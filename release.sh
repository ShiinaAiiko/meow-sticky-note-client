#! /bin/sh
name="meow-sticky-note-client"
port=15300
branch="main"
registryUrl="https://registry.npmmirror.com/"
allowMethods=("proto stop npmconfig install gitpull dockerremove start dockerlogs")

npmconfig() {
  echo "-> 配置npm config"
  npm config set @vue:registry $registryUrl
  npm config set @typescript-eslint:registry $registryUrl
  npm config set @babel:registry $registryUrl
  npm config set @next:registry $registryUrl
  npm config set @reduxjs:registry $registryUrl
}

install() {
  npmconfig
  rm -rf ./node_modules
  rm -rf ./yarn-error.log
  rm -rf ./yarn.lock
  yarn install
  yarn proto
}

gitpull() {
  echo "-> 正在拉取远程仓库"
  git reset --hard
  git pull origin $branch
}

dockerremove() {
  echo "-> 删除无用镜像"
  docker rm $(docker ps -q -f status=exited)
  docker rmi -f $(docker images | grep '<none>' | awk '{print $3}')
}

start() {
  echo "-> 正在启动「${name}」服务"
  # gitpull
  npmconfig
  dockerremove

  echo "-> 正在准备相关资源"
  # 获取npm配置
  DIR=$(cd $(dirname $0) && pwd)
  cp -r ~/.npmrc $DIR
  cp -r ~/.yarnrc $DIR

  echo "-> 准备构建Docker"
  docker build -t $name $(cat /etc/hosts | sed 's/^#.*//g' | grep '[0-9][0-9]' | tr "\t" " " | awk '{print "--add-host="$2":"$1 }' | tr '\n' ' ') . -f Dockerfile.multi
  rm $DIR/.npmrc
  rm $DIR/.yarnrc

  echo "-> 准备运行Docker"
  docker stop $name
  docker rm $name
  docker run --name=$name $(cat /etc/hosts | sed 's/^#.*//g' | grep '[0-9][0-9]' | tr "\t" " " | awk '{print "--add-host="$2":"$1 }' | tr '\n' ' ') -p $port:$port --restart=always -d $name
}

stop() {
  docker stop $name
}

proto() {
  echo "-> 准备编译Protobuf"
  yarn proto
  echo "-> 编译Protobuf成功"
}

dockerlogs() {
  docker logs -f $name
}

main() {
  if echo "${allowMethods[@]}" | grep -wq "$1"; then
    "$1"
  else
    echo "Invalid command: $1"
  fi
}

main "$1"
