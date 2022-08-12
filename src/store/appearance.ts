import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, { ActionParams } from '.'
import { WebStorage } from '@nyanyajs/utils'

import { api } from '../modules/electron/api'
import { storage } from './storage'

export const modeName = 'appearance'

export const appearanceMethods = {
	Init: createAsyncThunk(modeName + '/Init', async (_, thunkAPI) => {
		// 获取配置

		const { config } = store.getState()
		switch (config.platform) {
			case 'Electron':
				const electron = window.require('electron')
				if (electron) {
					const { ipcRenderer, ipcMain } = electron

					api.getMode()
				}
				break
			case 'Web':
				thunkAPI.dispatch(
					appearanceSlice.actions.setMode({
						mode: (await storage.systemConfig.get('mode')) || 'system',
					})
				)
				break

			default:
				break
		}
	}),
	SetMode: createAsyncThunk(
		modeName + '/SetMode',
		async (mode: 'dark' | 'light' | 'system', thunkAPI) => {
			const { config } = store.getState()
			switch (config.platform) {
				case 'Electron':
					const electron = window.require('electron')
					if (electron) {
						const { ipcRenderer, ipcMain } = electron

						api.setMode(mode)
						thunkAPI.dispatch(
							appearanceSlice.actions.setMode({
								mode: mode,
							})
						)
					}
					break
				case 'Web':
					thunkAPI.dispatch(
						appearanceSlice.actions.setMode({
							mode: mode,
						})
					)
					break

				default:
					break
			}
			// thunkAPI.dispatch(
			// 	appearanceSlice.actions.setMode({
			// 		mode: window.matchMedia('(prefers-color-scheme: dark)').matches
			// 			? 'dark'
			// 			: 'light',
			// 	})
			// )
			// const electron = window.require('electron')
			// if (electron) {
			// 	const { ipcRenderer, ipcMain } = electron
			// 	ipcRenderer.addListener('nativeThemeChange', (event, arg) => {
			// 		thunkAPI.dispatch(
			// 			appearanceSlice.actions.setMode({
			// 				mode: arg,
			// 			})
			// 		)
			// 	})
			// }
		}
	),
}

type Mode = 'dark' | 'light' | 'system'

export const appearanceSlice = createSlice({
	name: modeName,
	initialState: {
		mode: 'system',
	},
	reducers: {
		setMode: (
			state,
			params: ActionParams<{
				mode: Mode
			}>
		) => {
			state.mode = params.payload.mode
			document.body.classList.remove('system-mode', 'dark-mode', 'light-mode')
			document.body.classList.add(state.mode + '-mode')

			storage.systemConfig.setSync('mode', params.payload.mode)
			// api.showNotification({
			//   title: t('copySuccessfully', {
			//     ns: 'common',
			//   }),
			//   content: sv.content || '',
			// })
		},
	},
})
