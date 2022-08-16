import {
	BrowserWindow,
	globalShortcut,
	Tray,
	app,
	Menu,
	MenuItem,
	nativeTheme,
	ipcMain,
	ipcRenderer,
	Notification,
} from 'electron'
import path from 'path'
import isDev from 'electron-is-dev'

import { initShortcut } from './shortcut'

import { initAppearance } from './appearance'
import { initConfig, systemConfig, logo, taskIcon } from './config'
import { createTaskMenu } from './taskMenu'
import { initRouter } from './router/router'
import { backup } from './modules/methods'

console.log('启动')

const ready = async () => {
	app.commandLine.appendSwitch('disable-http-cache')
	await initConfig()
	await initAppearance()

	initRouter()
	initShortcut()
	await createTaskMenu()
	await backup()
	setInterval(async () => {
		await backup()
	}, 3600 * 1000)
}
 
app.on('ready', ready)

ipcMain.on('quit', () => {
	console.log('quit')
	app.quit()
})

app.on('window-all-closed', () => {
	console.log('window-all-closed', process.platform)
	if (process.platform !== 'darwin') {
		// app.quit()
	}
})
app.on('activate', () => {
	console.log('activate')
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
// 					console.log('Electron rocks!')
// 				},
// 			},
// 		],
// 	})
// )

// Menu.setApplicationMenu(null)
