import {
	BrowserWindow,
	ipcMain,
	Tray,
	Notification,
	nativeTheme,
	globalShortcut,
} from 'electron'
import { APIParams } from '../typings/api'
import path from 'path'

import { windows, openMainWindows } from '../windows'
import { mode, setMode } from '../appearance'
import { logo } from '../config'

export const R = (
	func: (options: {
		event: Electron.IpcMainEvent
		window: BrowserWindow
		data: APIParams
	}) => void
) => {
	return (event: Electron.IpcMainEvent, data: APIParams) => {
		const w = windows.get(data.route)
		w &&
			func({
				event,
				window: w,
				data,
			})
	}
}

export const initRouter = () => {
	ipcMain.on(
		'showNotification',
		R(({ window, data }) => {
			const notification = new Notification({
				title: data.data.title || '',
				body: data.data.content || 'Nothing',
				icon: logo,
			})
			notification.show()
			if (data.data.timeout) {
				setTimeout(() => {
					notification.close()
				}, data.data.timeout || 5000)
			}
		})
	)

	ipcMain.on(
		'openDevTools',
		R(({ window }) => {
			window.webContents.openDevTools()
		})
	)

	ipcMain.on(
		'setMode',
		R(({ window, data }) => {
			setMode(data.data.mode)
			nativeTheme.themeSource = mode
		})
	)

	ipcMain.on(
		'openMainProgram',
		R(({ window, data }) => {
			openMainWindows()
		})
	)

	ipcMain.on(
		'openSso',
		R(({ window, data }) => {
			openMainWindows()
		})
	)

	ipcMain.on(
		'hideWindow',
		R(({ window, data }) => {
			window.hide()
		})
	)

	ipcMain.on(
		'getMode',
		R(({ window, data }) => {
			window.webContents.send(
				'nativeThemeChange',
				mode === 'system'
					? nativeTheme.shouldUseDarkColors
						? 'dark'
						: 'light'
					: mode,
				mode
			)
		})
	)

	ipcMain.on(
		'updateData',
		R(({ window, data }) => {
			windows.forEach((v) => {
				console.log(v.id, window.id)
				if (v.id !== window.id) {
					v.webContents.send('updateData')
				}
			})
		})
	)

	ipcMain.on(
		'updateProfile',
		R(({ window, data }) => {
			windows.forEach((v) => {
				console.log(v.id, window.id)
				if (v.id !== window.id) {
					v.webContents.send('updateProfile')
				}
			})
		})
	)

	ipcMain.on(
		'updateSetting',
		R(({ window, data }) => {
			windows.forEach((v) => {
				console.log(v.id, window.id)
				if (v.id !== window.id) {
					v.webContents.send('updateSetting', {
						type: data.data.type,
					})
				}
			})
		})
	)
}
