import qs from 'qs'

import { APIParams } from '../../electron/typings/api'

const query = qs.parse(
	window.location.search.substring(1, window.location.search.length)
)
const { ipcRenderer } = window?.require?.('electron') || {}
export const PARAMS = (eventName: string, data?: any): APIParams => {
	const route: any = query.route?.toString() || ''
	return {
		eventName,
		route: route,
		data: data,
		requestTime: Math.floor(new Date().getTime() / 1000),
	}
}
export const api = {
	openDevTools() {
		ipcRenderer?.send?.('openDevTools', PARAMS('openDevTools'))
	},
	getMode() {
		ipcRenderer?.send?.('getMode', PARAMS('getMode'))
	},
	showNotification(params: {
		title: string
		content: string
		timeout: number
	}) {
		ipcRenderer?.send?.(
			'showNotification',
			PARAMS('showNotification', {
				title: params.title,
				content: params.content,
				timeout: params.timeout,
			})
		)
	},
	setMode(mode: 'system' | 'dark' | 'light') {
		ipcRenderer?.send?.(
			'setMode',
			PARAMS('getMode', {
				mode,
			})
		)
	},
	openMainProgram() {
		ipcRenderer?.send?.('openMainProgram', PARAMS('openMainProgram', {}))
	},
	hideWindow() {
		ipcRenderer?.send?.('hideWindow', PARAMS('hideWindow', {}))
	},
	updateData() {
		ipcRenderer?.send?.('updateData', PARAMS('updateData', {}))
	},
	updateProfile() {
		ipcRenderer?.send?.('updateProfile', PARAMS('updateProfile', {}))
	},
	updateSetting({ type }: { type: string }) {
		ipcRenderer?.send?.(
			'updateSetting',
			PARAMS('updateSetting', {
				type,
			})
		)
	},
}

export default {
	api,
}
