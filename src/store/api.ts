import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, { ActionParams } from '.'
// import { WebStorage } from './ws'
import { WebStorage } from '@nyanyajs/utils'
import { storage } from './storage'
import { getI18n } from 'react-i18next'

import { api } from '../modules/electron/api'
import { stringify } from 'querystring'
import { resolve } from 'path'
import { nanoid } from 'nanoid'
import { serverApi } from '../config'

export const modeName = 'api'

export const apiMethods = {
	Init: createAsyncThunk(modeName + '/Init', async (_, thunkAPI) => {
		// 获取配置
	}),
}

export const apiSlice = createSlice({
	name: modeName,
	initialState: {
		apiUrl: serverApi.apiUrl,
		apiNames: {
			v1: {
				baseUrl: '/api/v1',
				syncToServer: '/sync/toserver',
				getUrls: '/sync/geturls',
				getFolderFiles: '/sync/getfolderfiles',
				GetNote: '/sync/getnote',
				getUploadToken: '/file/getUploadToken',
			},
		},
		NSocketIoEventNames: {
			v1: {
				Error: 'Error',
				OtherDeviceOnline: 'OtherDeviceOnline',
				OtherDeviceOffline: 'OtherDeviceOffline',
				OnForceOffline: 'OnForceOffline',
				SyncData: 'SyncData',
			},
		},
	},
	reducers: {},
})
