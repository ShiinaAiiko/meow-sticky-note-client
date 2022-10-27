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
import { version } from './package.json'
import { exec } from 'child_process'
import {
	initConfig,
	logo,
	setLanguages,
	systemConfig,
	taskIcon,
	taskWhiteIcon,
} from './config'
import { t } from './modules/languages'

export let appTray: Tray

export const getMenu = () => {
	return Menu.buildFromTemplate([
		{
			label: t('openMainWindow').replace('{{appName}}', t('appName')),
			click() {
				openMainWindows()
			},
		},
		{
			label: t('quickReview'),
			click() {
				openQuickReviewWindows()
			},
		},
		{
			label: t('icon'),
			submenu: Menu.buildFromTemplate([
				{
					label: t('pinkIcon'),
					click() {
						createTaskMenu('pink')
					},
				},
				{
					label: t('whiteIcon'),
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
			label: t('about'),
			submenu: [
				{
					label: t('version') + ': ' + version,
					enabled: false,
				},
				{
					label: t('github'),
					click() {
						exec('start https://github.com/ShiinaAiiko/meow-sticky-note')
					},
				},
			],
		},
		{
			label: t('quit'),
			click() {
				//ipc.send('close-main-window');
				app.quit()
			},
		},
	])
}

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

  setLanguages()
}
