import {
	BrowserWindow,
	globalShortcut,
	Tray,
	app,
	Menu,
	MenuItem,
	nativeTheme,
	ipcMain,
	protocol,
	ipcRenderer,
	Notification,
} from 'electron'
import path from 'path'
import isDev from 'electron-is-dev'
import { initConfig, systemConfig, logo, taskIcon } from './config'

import { initShortcut } from './shortcut'

import { initAppearance } from './appearance'
import { createTaskMenu } from './taskMenu'
import { initRouter } from './router/router'
import { backup } from './modules/methods'
import { openMainWindows } from './windows'
import * as nyanyalog from 'nyanyajs-log'

nyanyalog.info('启动')
// protocol.registerSchemesAsPrivileged([
//   { scheme: 'app', privileges: { secure: true, standard: true } }
// ])
const ready = async () => {
	app.commandLine.appendSwitch('disable-http-cache')
	await initConfig()
	await initAppearance()

	initRouter()
	initShortcut()
	await createTaskMenu()
	openMainWindows()
	await backup()
	setInterval(async () => {
		await backup()
	}, 3600 * 1000)
}

const isFirstInstance = app.requestSingleInstanceLock()

console.log('isFirstInstance', isFirstInstance)
if (!isFirstInstance) {
	console.log('is second instance')
	// setTimeout(() => {
	app.quit()
	// }, 30000)
} else {
	app.on('second-instance', (event, commanLine, workingDirectory) => {
		console.log('new app started', commanLine)
		openMainWindows()
	})

	app.on('ready', ready)
}

ipcMain.on('quit', () => {
	nyanyalog.info('quit')
	app.quit()
})
app.focus()
app.on('window-all-closed', () => {
	nyanyalog.info('window-all-closed', process.platform)
	if (process.platform !== 'darwin') {
		// app.quit()
	}
})
app.on('activate', () => {
	nyanyalog.info('activate')
	// if (mainWindow === null) {
	// 	createWindow()
	// }
})
// const menu = new Menu()
// menu.append(
// 	new MenuItem({
// 		label: 'Electron',
// 		submenu: [
// 			{
// 				role: 'help',
// 				accelerator:
// 					process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
// 				click: () => {
// 					nyanyalog.info('Electron rocks!')
// 				},
// 			},
// 		],
// 	})
// )

// Menu.setApplicationMenu(null)
