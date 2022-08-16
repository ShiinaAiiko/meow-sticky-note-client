import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, { ActionParams, methods, storageSlice, RootState } from '.'
import { UserAgent } from '@nyanyajs/utils/dist/userAgent'
import nyanyajs from '@nyanyajs/utils'

// import { WebStorage } from './ws'
import { NoteItem } from './notes/typings'
import { storage } from './storage'
import { getI18n } from 'react-i18next'

import { api } from '../modules/electron/api'
import { stringify } from 'querystring'
import { resolve } from 'path'
import { nanoid } from 'nanoid'
import { client } from './sso'

export const modeName = 'user'

export const userMethods = {
	Init: createAsyncThunk<
		void,
		void,
		{
			state: RootState
		}
	>(modeName + '/Init', async (_, thunkAPI) => {
		// 获取配置
		// console.log(await storage.config.get('language'))
		const { user } = thunkAPI.getState()
		console.log('校验token是否有效')
		const token = await storage.global.get('token')
		const deviceId = await storage.global.get('deviceId')
		const userInfo = await storage.global.get('userInfo')
		if (token) {
			if (!user.isLogin) {
				thunkAPI.dispatch(
					methods.user.checkToken({
						token,
						deviceId,
					})
				)
			} else {
				thunkAPI.dispatch(
					userSlice.actions.login({
						token: token,
						deviceId: deviceId,
						userInfo: userInfo,
					})
				)
			}
		} else {
			thunkAPI.dispatch(userSlice.actions.logout({}))
		}
		thunkAPI.dispatch(userSlice.actions.setInit(true))
	}),
	checkToken: createAsyncThunk(
		modeName + '/checkToken',
		async (
			{
				token,
				deviceId,
			}: {
				token: string
				deviceId: string
			},
			thunkAPI
		) => {
			const res = await client?.checkToken({
				token,
				deviceId,
			})
			console.log('res checkToken', res)
			if (res) {
				console.log('登陆成功')
				thunkAPI.dispatch(
					userSlice.actions.login({
						token: res.token,
						deviceId: res.deviceId,
						userInfo: res.userInfo,
					})
				)
			} else {
				// thunkAPI.dispatch(userSlice.actions.logout({}))
			}
			return res
		}
	),
}

export interface UserInfo {
	id: number
	uid: number
	email: string
	avatar: string
	username: string
	nickname: string
	bio: string
	city: string
	gender: number
	birthday: string
	status: number
	backgroundImage: {
		src: string
		size: number
	}
	createTime: number
}

export let userInfo: UserInfo = {
	id: 0,
	uid: 0,
	// avatar: defaultConfig.defaultAvatar,
	email: '',
	avatar: '',
	username: '',
	nickname: '',
	bio: '',
	city: '',
	gender: 0,
	birthday: '',
	status: 0,
	backgroundImage: {
		src: '',
		size: 0,
	},
	createTime: 0,
}
export let userAgent = nyanyajs.userAgent(window.navigator.userAgent)
export const userSlice = createSlice({
	name: modeName,
	initialState: {
		userAgent: {
			...userAgent,
		},
		token: '',
		deviceId: '',
		userInfo,
		isLogin: false,
		isInit: false,
	},
	reducers: {
		setInit: (state, params: ActionParams<boolean>) => {
			state.isInit = params.payload
		},
		login: (
			state,
			params: ActionParams<{
				token: string
				deviceId: string
				userInfo: UserInfo
			}>
		) => {
			const { token, deviceId, userInfo } = params.payload
			state.token = token || ''
			state.deviceId = deviceId || ''
			state.userInfo = userInfo || Object.assign({}, userInfo)
			state.isLogin = !!token
			if (token) {
				storage.global.setSync('token', token)
				storage.global.setSync('deviceId', deviceId)
				storage.global.setSync('userInfo', userInfo)
			}
			setTimeout(() => {
				store.dispatch(storageSlice.actions.init(userInfo.uid))
			})
			// store.dispatch(userSlice.actions.init({}))
		},
		logout: (state, _) => {
			storage.global.delete('token')
			storage.global.delete('deviceId')
			storage.global.delete('userInfo')
			state.token = ''
			state.deviceId = ''
			state.userInfo = Object.assign({}, userInfo)
			state.isLogin = false
		},
	},
})
