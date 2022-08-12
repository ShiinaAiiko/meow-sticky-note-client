import {
	BrowserWindow,
	globalShortcut,
	Tray,
	app,
	Menu,
	MenuItem,
} from 'electron'

import {
	windows,
	openMainWindows,
	openQuickReviewWindows,
	createWindow,
} from './windows'
//   Command（或Cmd简称）
// Control（或Ctrl简称）
// CommandOrControl（或CmdOrCtrl简称）
// Alt
// Option
// AltGr
// Shift
// Super

export const initShortcut = () => {
	console.log('initShortcut')
	globalShortcut.register('Control+Alt+n', () => {
		let window = windows.get('/')

		if (window) {
			if (!window.isVisible()) {
				window.show()
				window.focus()
				// 未来去掉
				// window.reload()
			} else {
				window.hide()
				window.webContents.send('hide')
			}
		} else {
			window = openMainWindows()
			window.webContents.send('show')
			// window.setFullScreen(true)
		}
		// Do stuff when Y and either Command/Control is pressed.
	})
	globalShortcut.register('Control+Alt+r', () => {
		let window = windows.get('/quickreview')
		console.log('快捷键', window)

		console.log(window?.isVisible())
		if (window) {
			if (!window.isVisible()) {
				window.show()
				window.focus()
				// 未来去掉
				// window.reload()
			} else {
        if (!window.isFocused()) {
          window.focus()
          return
        }
				window.hide()
				window.webContents.send('hide')
			}
		} else {
			window = openQuickReviewWindows()
			// window.setFullScreen(true)
		}
		// Do stuff when Y and either Command/Control is pressed.
	})
}
