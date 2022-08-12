import { BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { NodeFsStorage, electronRouter } from '@nyanyajs/utils/dist/node'

import path from "path"

const cacheRootDir = '/home/shiina_aiiko/.cache'
const configRootDir = '/home/shiina_aiiko/.config'
// 'mode' | 'language'

export const logo = path.join(
	path.join(__dirname, '../../../public'),
	'logo192.png'
)

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
