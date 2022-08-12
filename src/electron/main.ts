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
import {
	windows,
	openMainWindows,
	openQuickReviewWindows,
	createWindow,
} from './windows'

import { initAppearance } from './appearance'
import { initConfig, logo } from './config'
import { initRouter } from './router/router'

console.log('启动')

const ready = async () => {
	app.commandLine.appendSwitch('disable-http-cache')
	await initConfig()
	await initAppearance()

	initRouter()
	initShortcut()
	//系统托盘右键菜单
	const trayMenuTemplate = [
		{
			label: 'Open Meow Sticky Note',
			click() {
				openMainWindows()
			},
		},
		{
			label: 'Quick review',
			click() {
				openQuickReviewWindows()
			},
		},
		{
			label: 'Clear cache',
			accelerator: 'CmdOrCtrl+Shift+Delete',
			click: (item: any, focusedWindow: any) => {
				if (focusedWindow) {
					const clearObj = {
						storages: [
							'appcache',
							'filesystem',
							// 'indexdb',
							'localstorage',
							'shadercache',
							'websql',
							'serviceworkers',
							'cachestorage',
						],
					}
					focusedWindow.webContents.session.clearStorageData(clearObj)
				}
			},
		},
		{
			label: 'Quit',
			click() {
				//ipc.send('close-main-window');
				app.quit()
			},
		},
	]

	//系统托盘图标目录
	// console.log(1, iconDir)
	// console.log(
	// 	2,
	// 	'/home/shiina_aiiko/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/meow-sticky-note/client/public/favicon.ico'
	// )
	const appTray = new Tray(logo)
	// console.log(appTray)
	// console.log(iconDir)
	//图标的上下文菜单
	const contextMenu = Menu.buildFromTemplate(trayMenuTemplate)

	//设置此托盘图标的悬停提示内容
	appTray.setToolTip('This is my application.')

	//设置此图标的上下文菜单
	appTray.setContextMenu(contextMenu)
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
