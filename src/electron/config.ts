import {
	BrowserWindow,
	nativeImage,
	Tray,
	ipcMain,
	nativeTheme,
} from 'electron'
import { NodeFsStorage, electronRouter } from '@nyanyajs/utils/dist/node'

import path from 'path'
import isDev from 'electron-is-dev'
import * as nyanyalog from 'nyanyajs-log'

nyanyalog.config({
	format: {
		function: {
			fullFunctionChain: false,
		},
		prefixTemplate: '[{{Timer}}] [{{Type}}] [{{File}}]@{{Name}}',
	},
})

// 自动获取本机目录
export let userHome = process.env.HOME || process.env.USERPROFILE
const cacheRootDir = userHome + '/.cache'
const configRootDir = userHome + '/.config'
// 'mode' | 'language'

// export const taskIcon = path.join(
// 	path.join(__dirname, '../../../public'),
// 	'logo-white-bg.png'
// )
nyanyalog.info('isDev', isDev)
nyanyalog.info('__dirname', __dirname)
// const { exec } = require('child_process')
// // 输出当前目录（不一定是代码所在的目录）下的文件和文件夹
// exec('ls', (err: any, stdout: any, stderr: any) => {
// 	if (err) {
// 		console.log(err)
// 		return
// 	}
// 	console.log(`stdout: ${stdout}`)
// 	console.log(`stderr: ${stderr}`)
// })
// exec('cd .. && ls', (err: any, stdout: any, stderr: any) => {
// 	if (err) {
// 		console.log(err)
// 		return
// 	}
// 	console.log(`stdout: ${stdout}`)
// 	console.log(`stderr: ${stderr}`)
// })

let staticPath = isDev ? '../../../public' : '../../../build'

export const taskIcon = path.join(
	path.join(__dirname, staticPath),
	'logo-neko.png'
)
// export const taskIcon2 = path.join(
// 	path.join(__dirname, staticPath),
// 	'logo-neko2.png'
// )
export const taskWhiteIcon = path.join(
	path.join(__dirname, staticPath),
	'logo-neko-white.png'
)
export const logoCircleIcon1024 = nativeImage
	.createFromPath(
		path.join(path.join(__dirname, staticPath), '/icons/1024x1024.png')
	)
  export const logoCircleIcon256 = nativeImage
    .createFromPath(
      path.join(path.join(__dirname, staticPath), '/icons/256x256.png')
    )
export const logoCircleIcon128 = nativeImage.createFromPath(
	path.join(path.join(__dirname, staticPath), '/icons/logo-circle-128.png')
)
export const logoCircleIcon64 = nativeImage.createFromPath(
	path.join(path.join(__dirname, staticPath), '/icons/logo-circle-64.png')
)
export const logoCircleIcon32 = nativeImage.createFromPath(
	path.join(path.join(__dirname, staticPath), '/icons/logo-circle-32.png')
)
export const logoCircleIcon16 = nativeImage.createFromPath(
	path.join(path.join(__dirname, staticPath), '/icons/logo-circle-16.png')
)
export const logoCircleIcon512 = nativeImage.createFromPath(
	path.join(path.join(__dirname, staticPath), '/logo512.png')
)
export const logoWhiteBg = path.join(
	path.join(__dirname, staticPath),
	'logo-white-bg.png'
)
export const logoWhiteBg2 = path.join(
	path.join(__dirname, staticPath),
	'logo-white-bg2.png'
)
export const logo = path.join(path.join(__dirname, staticPath), 'logo192.png')

export const systemConfig = new NodeFsStorage<any>({
	label: 'systemConfig',
	cacheRootDir: configRootDir + '/meow-sticky-note/s',
	// encryption: {
	// 	enable: false,
	// 	key: 'meow-sticky-note',
	// },
})
export const notes = new NodeFsStorage<any>({
	label: 'notes',
	cacheRootDir: cacheRootDir + '/meow-sticky-note/u',
})
export const global = new NodeFsStorage<any>({
	label: 'global',
	cacheRootDir: cacheRootDir + '/meow-sticky-note/u',
})
export const initConfig = async () => {
	NodeFsStorage.baseRootDir = cacheRootDir + "'/meow-sticky-note/u'"

	await systemConfig.getAndSet('language', (v) => {
		return v ? v : 'en-US'
	})
	await systemConfig.getAndSet('mode', (v) => {
		return v ? v : 'system'
	})
	// const userConfig = new NodeFsStorage<string, any>({
	// 	baseLabel: 'userConfig',
	// 	cacheRootDir: configRootDir + '/meow-sticky-note/u',
	// 	encryption: {
	// 		enable: false,
	// 		key: 'meow-sticky-note',
	// 	},
	// })
	// console.log(userConfig)

	// userConfig.set('language', 'zh-CN')

	electronRouter(ipcMain)
}
