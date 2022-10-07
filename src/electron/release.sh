#! /bin/bash
name="meow-sticky-note-client"
port=16111
DIR=$(cd $(dirname $0) && pwd)
allowMethods=("build gicon")

build() {
  rm -rf ./el-build/linux-unpacked
  rm -rf ./el-build/*.AppImage
  pwd
  electron-builder --linux --x64
  rm -rf ./build
  # sudo apt install -y ./el-build/meow-sticky-note_1.0.1_amd64.deb
  # AppImage deb
  # run
}

gicon() {
  echo $DIR
  # electron-icon-builder --input=$DIR/logo.png --output=./ --flatten
}

run() {
  # chmod a+x ./*.AppImage
  chmod a+x ./el-build/*.AppImage
  ./el-build/*.AppImage
}

main() {
  if echo "${allowMethods[@]}" | grep -wq "$1"; then
    "$1"
  else
    echo "Invalid command: $1"
  fi
}

main "$1"

# "dmg": {
# 	"contents": [
# 		{
# 			"x": 410,
# 			"y": 150,
# 			"type": "link",
# 			"path": "/Applications"
# 		},
# 		{
# 			"x": 130,
# 			"y": 150,
# 			"type": "file"
# 		}
# 	]
# },
# "mac": {
# 	"icon": "build/icons/icon.icns"
# },
# "win": {
# 	"icon": "build/icons/icon.ico",
# 	"target": [
# 		"nsis"
# 	]
# },
# "nsis": {
# 	"installerIcon": "build/icons/icon.ico",
# 	"uninstallerIcon": "build/icons/icon.ico",
# 	"uninstallDisplayName": "卸载这个软件",
# 	"oneClick": false,
# 	"allowToChangeInstallationDirectory": true,
# 	"allowElevation": true,
# 	"createDesktopShortcut": true
# },
