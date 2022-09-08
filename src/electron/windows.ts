import {
	BrowserWindow,
	BrowserWindowConstructorOptions,
	globalShortcut,
	Tray,
	app,
	Menu,
	MenuItem,
} from 'electron'
import path from 'path'

import isDev from 'electron-is-dev'

import { Route } from './typings/api'
import {
	logoWhiteBg,
	logoCircleIcon1024,
	logoCircleIcon512,
	logoCircleIcon256,
	logoCircleIcon128,
	logoCircleIcon64,
	logoCircleIcon32,
	logoWhiteBg2,
	taskIcon,
	logo,
} from './config'

export const windows = new Map<Route, BrowserWindow>()

export interface BrowserWindowOPtions extends BrowserWindowConstructorOptions {
	visible: boolean
}

export const createWindow = (route: Route, options: BrowserWindowOPtions) => {
	const window = new BrowserWindow({
		...options,
		webPreferences: {
			...options.webPreferences,
			devTools: true,
		},
    icon: logoCircleIcon1024,
    
	})

	if (process.platform === 'darwin') {
		app.dock.setIcon(logoCircleIcon1024)
	}

	if (options.center) {
		window.center()
	}
	if (options.visible) {
		window.show()
	} else {
		window.hide()
	}
	const queryStr = '?route=' + route + '&time=' + new Date().getTime()
	let dev = isDev
	// dev = false
	// window.loadURL('http://localhost:16111' + route + queryStr)
	// window.loadURL(
	// 	dev
	// 		? 'http://localhost:16111' + route + queryStr
	// 		: `file://${path.join(__dirname, '../build/index.html')}` + queryStr,
	// 	{ extraHeaders: 'pragma: no-cache' }
	// )
	// console.log(`file://${path.join(__dirname, '../../../build/index.html')}`)
	window.loadURL(
		dev
			? 'http://localhost:16111' + route + queryStr
			: `file://${path.join(__dirname, '../build/index.html')}#${route}` +
					queryStr,
		{ extraHeaders: 'pragma: no-cache' }
	)
	window.webContents.openDevTools()
	setTimeout(() => {
		if (options?.webPreferences?.devTools) {
			window.webContents.openDevTools()
		} else {
			window.webContents.closeDevTools()
		}
	})
	window.on('show', () => {
		console.log('show')
	})
	window.on('closed', () => {
		console.log('closed')
		windows.delete(route)
	})
	window.setMenu(null)
	windows.set(route, window)
	return window
}
const menu = new Menu()
menu.append(
	new MenuItem({
		label: 'Electron',
		submenu: [
			{
				role: 'help',
				accelerator:
					process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
				click: () => {
					console.log('Electron rocks!')
				},
			},
		],
	})
)

export const openMainWindows = () => {
	let window = windows.get('/')
	if (window) {
		window.show()
		// window.focus()
		window.webContents.send('show')
		return window
	}
	return createWindow('/', {
		title: 'Meow Sticky Note',
		width: 1200,
		height: 780,
		x: 0,
		y: 0,
		skipTaskbar: false,
		hasShadow: true,
		alwaysOnTop: false,
		fullscreen: false,
		center: true,
		// 可以隐藏窗口
		frame: true,
		// backgroundColor: 'rgba(0,0,0,0.3)',

		webPreferences: {
			devTools: false,
			nodeIntegration: true,
			contextIsolation: false,
		},
		visible: true,
	})
}

export const openQuickReviewWindows = () => {
	let window = windows.get('/quickreview')
	if (window) {
		window.show()
		// window.focus()
		window.webContents.send('show')
		return window
	}
	return createWindow('/quickreview', {
		title: 'Quick Review',
		width: 800,
		height: 600,
		x: 0,
		y: 500,
		skipTaskbar: false,
		hasShadow: true,
		alwaysOnTop: false,
		// transparent: true,
		// fullscreen: false,
		center: true,
		// 可以隐藏窗口
		frame: true,
		// backgroundColor: 'rgba(0,0,0,0.3)',

		webPreferences: {
			devTools: false,
			nodeIntegration: true,
			contextIsolation: false,
		},
		visible: true,
	})
}
