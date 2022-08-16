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
import {
	windows,
	openMainWindows,
	openQuickReviewWindows,
	createWindow,
} from './windows'
import {
	initConfig,
	logo,
	systemConfig,
	taskIcon,
	taskWhiteIcon,
} from './config'

let appTray: Tray

const contextMenu = Menu.buildFromTemplate([
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
		label: 'Icon',
		submenu: Menu.buildFromTemplate([
			{
				label: 'Pink Icon',
				click() {
					createTaskMenu('pink')
				},
			},
			{
				label: 'White Icon',
				click() {
					createTaskMenu('white')
				},
			},
		]),
	},
	// {
	// 	label: 'Clear cache',
	// 	accelerator: 'CmdOrCtrl+Shift+Delete',
	// 	click: (item: any, focusedWindow: any) => {
	// 		if (focusedWindow) {
	// 			const clearObj = {
	// 				storages: [
	// 					'appcache',
	// 					'filesystem',
	// 					// 'indexdb',
	// 					'localstorage',
	// 					'shadercache',
	// 					'websql',
	// 					'serviceworkers',
	// 					'cachestorage',
	// 				],
	// 			}
	// 			focusedWindow.webContents.session.clearStorageData(clearObj)
	// 		}
	// 	},
	// },
	{
		label: 'Quit',
		click() {
			//ipc.send('close-main-window');
			app.quit()
		},
	},
])

//系统托盘右键菜单
export const createTaskMenu = async (type?: 'pink' | 'white') => {
	appTray && appTray.destroy()
	//系统托盘图标目录
	// console.log(1, iconDir)
	// console.log(
	// 	2,
	// 	'/home/shiina_aiiko/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/meow-sticky-note/client/public/favicon.ico'
	// )

	if (!type) {
		type = (await systemConfig.get('taskMenuIconType')) || 'pink'
	}
	await systemConfig.set('taskMenuIconType', type)

	let icon = type === 'pink' ? taskIcon : taskWhiteIcon
	appTray = new Tray(icon)
	// console.log(appTray)
	// console.log(iconDir)
	//图标的上下文菜单

	//设置此托盘图标的悬停提示内容
	appTray.setToolTip('Meow Sticky Note')

	//设置此图标的上下文菜单
	appTray.setContextMenu(contextMenu)
}
