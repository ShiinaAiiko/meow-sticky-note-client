#! /bin/bash
name="meow-sticky-note-client"
port=16111
branch="main"
# configFilePath="config.dev.json"
configFilePath="config.test.json"
registryUrl="https://registry.npmmirror.com/"
DIR=$(cd $(dirname $0) && pwd)
allowMethods=("elgenerateicon elbuild run protos stop npmconfig install gitpull dockerremove start logs")

# npm i --registry https://registry.npmmirror.com/
# npm i @nyanyajs/utils @saki-ui/core
# "@nyanyajs/utils": "^1.0.10",
# "@saki-ui/core": "^1.0.0",
npmconfig() {
  echo "-> 配置npm config"
  # yarn config set electron_mirror https://registry.npmmirror.com/binary.html?path=electron/
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
  cp -r ../protos $DIR/protos_temp
  cp -r ./$configFilePath $DIR/config.pro.temp.json
  # 获取npm配置
  cp -r ~/.npmrc $DIR
  cp -r ~/.yarnrc $DIR

  echo "-> 准备构建Docker"
  docker build \
    -t $name \
    $(cat /etc/hosts | sed 's/^#.*//g' | grep '[0-9][0-9]' | tr "\t" " " | awk '{print "--add-host="$2":"$1 }' | tr '\n' ' ') \
    . \
    -f Dockerfile.multi
  rm $DIR/.npmrc
  rm $DIR/.yarnrc
  rm -rf $DIR/protos_temp
  rm -rf $DIR/config.pro.temp.json

  echo "-> 准备运行Docker"
  docker stop $name
  docker rm $name

  docker run \
    --name=$name \
    $(cat /etc/hosts | sed 's/^#.*//g' | grep '[0-9][0-9]' | tr "\t" " " | awk '{print "--add-host="$2":"$1 }' | tr '\n' ' ') \
    -p $port:$port \
    --restart=always \
    -d $name
}

stop() {
  docker stop $name
}

protos() {
  echo "-> 准备编译Protobuf"
  cp -r ../protos $DIR/protos_temp
  yarn protos
  rm -rf $DIR/protos_temp
  echo "-> 编译Protobuf成功"
}

logs() {
  docker logs -f $name
}

elbuild() {
  cp -r $DIR/public/logo-neko-circle-white1500.png $DIR/src/electron/logo.png
  cd ./src/electron
  yarn el:icon
  # electron-icon-builder --input=./logo.png --output=./ --flatten
  cd ../../
  cp -r $DIR/src/electron/icons $DIR/public/icons
  rm -rf $DIR/src/electron/logo.png
  rm -rf $DIR/src/electron/icons

  cp -r $DIR/$configFilePath $DIR/src/config.temp.json
  yarn build
  cp -r ./build ./src/electron/build

  cd ./src/electron

  mkdir -p ./el-build/packages
  cp -r ./el-build/*.AppImage ./el-build/packages/
  cp -r ./el-build/*.deb ./el-build/packages/
  rm -rf ./el-build/linux-unpacked
  rm -rf ./el-build/*.AppImage
  rm -rf ./el-build/*.deb
  yarn el:build
  rm -rf ./build

  cd ../../

  # sudo apt install -y ./meow-sticky-note_1.0.1_amd64.deb
  # AppImage deb
  run
}

elgenerateicon() {
  electron-icon-builder --input=./public/logo-neko-circle-white1500.png --output=public/icons --flatten
}

run() {
  # chmod a+x ./*.AppImage
  chmod a+x ./src/electron/el-build/*.AppImage
  ./src/electron/el-build/*.AppImage
}

main() {
  if echo "${allowMethods[@]}" | grep -wq "$1"; then
    "$1"
  else
    echo "Invalid command: $1"
  fi
}

main "$1"

#  "dmg": {
#  	"contents": [
#  		{
#  			"x": 410,
#  			"y": 150,
#  			"type": "link",
#  			"path": "/Applications"
#  		},
#  		{
#  			"x": 130,
#  			"y": 150,
#  			"type": "file"
#  		}
#  	]
#  },
#  "mac": {
#  	"icon": "build/icons/icon.icns"
#  },
#  "win": {
#  	"icon": "build/icons/icon.ico"
#  },
