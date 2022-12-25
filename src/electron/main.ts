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
	powerMonitor,
} from 'electron'
import path from 'path'
import isDev from 'electron-is-dev'
import { initConfig, systemConfig, logo, taskIcon } from './config'

import { initShortcut } from './shortcut'

import { initAppearance } from './appearance'
import { createTaskMenu } from './taskMenu'
import { initRouter } from './router/router'
import { backup } from './modules/methods'
import { openMainWindows, windows } from './windows'
import * as nyanyalog from 'nyanyajs-log'
import { t } from './modules/languages'

const run = () => {
	if (process.platform === 'win32') {
		app.setAppUserModelId(t('appName'))
	}

	let isQuit = false

	const argvFunc = (argv: string[]) => {
		nyanyalog.info(argv)
		isQuit = false
		argv.forEach((val, index) => {
			if (val === 'quit') {
				app.quit()
				isQuit = true
			}
		})
		nyanyalog.info('isQuit => ', isQuit)
	}

	argvFunc(process.argv)

	nyanyalog.info('启动')

	// protocol.registerSchemesAsPrivileged([
	//   { scheme: 'app', privileges: { secure: true, standard: true } }
	// ])
	const ready = async () => {
		if (isQuit) {
			return
		}
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

	nyanyalog.info('isFirstInstance', isFirstInstance)
	if (!isFirstInstance) {
		nyanyalog.info('is second instance')
		app.quit()
	} else {
		app.on('second-instance', (event, commanLine, workingDirectory) => {
			nyanyalog.info('new app started', commanLine)

			argvFunc(commanLine)

			!isQuit && openMainWindows()
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
		// if (process.platform !== 'darwin') {
		// 	// app.quit()
		// }
	})
	app.on('activate', () => {
		nyanyalog.info('activate')
		// if (mainWindow === null) {
		// 	createWindow()
		// }
	})

	powerMonitor.on('suspend', () => {
		console.log('The system is going to sleep')

		windows.forEach((v) => {
			v.webContents.send('suspend')
		})
	})
	powerMonitor.on('resume', () => {
		console.log('The system is going to sleep')
		windows.forEach((v) => {
			v.webContents.send('resume')
		})
	})

	powerMonitor.on('lock-screen', () => {
		console.log('The system is lock screen')
		windows.forEach((v) => {
			v.webContents.send('lock-screen')
		})
	})
	powerMonitor.on('unlock-screen', () => {
		console.log('The system is unlock screen')
		windows.forEach((v) => {
			v.webContents.send('unlock-screen')
		})
	})
}

run()
