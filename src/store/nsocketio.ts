import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, { ActionParams, RootState, configSlice } from '.'
import { PARAMS, protoRoot } from '../protos'
import { WebStorage } from '@nyanyajs/utils'
import { createSocketioRouter } from '../modules/socketio/router'

import { api } from '../modules/electron/api'
import { storage } from './storage'
import { NSocketIoClient } from '@nyanyajs/utils'

export const modeName = 'nsocketio'

export let client: NSocketIoClient | undefined

const namespace = {
	base: '/',
	sync: '/sync',
}
const state: {
	// client?: NSocketIoClient
	namespace: typeof namespace
	status: 'connecting' | 'success' | 'fail' | 'notConnected'
} = {
	status: 'notConnected',
	namespace,
}

const setStatus = (s: typeof state['status']) => {
	new Promise((resolve) => {
		store.dispatch(nsocketioSlice.actions.setStatus(s))
		resolve('')
	}).then()
}
export const nsocketioSlice = createSlice({
	name: modeName,
	initialState: state,
	reducers: {
		init: (state, params: ActionParams<{}>) => {},
		setStatus: (state, params: ActionParams<typeof state['status']>) => {
			state.status = params.payload
		},
	},
})

export const nsocketioMethods = {
	Init: createAsyncThunk<
		void,
		void,
		{
			state: RootState
		}
	>(modeName + '/Init', async (_, thunkAPI) => {
		console.log('初始化socket')
		const { nsocketio, user, config } = thunkAPI.getState()
		if (client) {
			console.log('无需重复创建client')
			return
		}
		console.log(user)
		if (!user.isLogin) {
			console.log('未登录')
			return
		}
		setStatus('connecting')
		const { token, deviceId, userAgent } = user
		client = new NSocketIoClient(config.socketIoConfig.uri, {
			...config.socketIoConfig.opt,
			query: PARAMS<protoRoot.base.IRequestType>(
				{ token, deviceId, userAgent },
				protoRoot.base.RequestType
			),
			reconnectionDelay: 6000,
		})

		client.addEventListener('connected', () => {
			setStatus('success')
			// console.log('connect => connected', client)
			// thunkAPI.dispatch(configSlice.actions.setNetworkStatus(true))
		})
		client.addEventListener('disconnect', () => {
			setStatus('fail')
			// console.log('connect => disconnect', client)
			// thunkAPI.dispatch(configSlice.actions.setNetworkStatus(false))
		})

		client.socket(state.namespace.base)
		client.socket(state.namespace.sync)

		// 注册路由
		createSocketioRouter.createRouter()

		Object.keys(client.namespace).forEach((k) => {
			const socket = client?.namespace[k]
			console.log('socket params => ', socket)
			if (socket) {
				socket.on('connect', () => {
					console.log(k + ' => params  连接状态:' + socket.connected) // false

					setStatus('success')
					// console.log(k + ' => params   => 连接状态:' + socket.disconnected) // false
				})
				socket.on('reconnect', (attempt: any) => {
					console.log(k + ' => params  reconnect', attempt)

					setStatus('success')
				})

				socket.on('disconnect', (attempt: any) => {
					console.log(k + ' => params  disconnect', attempt)

					setStatus('fail')
				})
				socket.on('connect_error', (attempt: any) => {
					console.log(k + ' => params  connect_error', attempt)

					setStatus('fail')
				})
				socket.on('reconnect_error', (attempt: any) => {
					console.log(k + ' => params  reconnect_error', attempt)

					setStatus('fail')
				})
				socket.on('connect_error', (attempt: any) => {
					console.log(k + ' => params  connect_error', attempt)

					setStatus('fail')
				})
			}
		})

		client?.manager?.on('connect', (attempt: any) => {
			console.log('socketIo连接成功', attempt)
			setStatus('success')
		})
		client?.manager?.on('reconnect', (attempt: any) => {
			console.log('reconnect', attempt)
			setStatus('success')
			// state.reconnectCount++
			// if (state.reconnectCount >= 10) {
			// 	client?.close()
			// 	console.log('开始重连')
			// 	state.reconnectCount = 0
			// 	// store.state.event.eventTarget.dispatchEvent(
			// 	// 	new Event('initEncryption')
			// 	// )
			// 	store.commit('socketio/init')
			// }
		})
		// client?.manager?.on('Error', (error: Error) => {
		// 	console.log('Error', error)
		// 	state.connectionStatus = 'fail'
		// })
		client?.manager?.on('connect_error', (error: Error) => {
			console.log('connect_error', error)
			setStatus('fail')
		})
		client?.manager?.on('connect_timeout', () => {
			console.log('connect_timeout')
			setStatus('fail')
		})
		client?.manager?.on('reconnect_error', (error: Error) => {
			console.log('reconnect_failed', error, store)
			// console.log(deepCopy(store.state))
			// store.commit('app/setStatus', false)
			setStatus('fail')
		})
		// setInterval(() => {
		// 	store.commit('app/setStatus', !store.state.app.status)
		// }, 1000)
		client?.manager?.on('reconnect_failed', () => {
			console.log('reconnect_failed')
			setStatus('fail')
		})
		client?.manager?.on('disconnect', (attempt: any) => {
			console.log('disconnect', attempt)
			setStatus('fail')
		})
	}),
	Close: createAsyncThunk<
		void,
		void,
		{
			state: RootState
		}
	>(modeName + '/Close', async (_, thunkAPI) => {
		console.log('Close socket')
		if (client) {
			client?.close?.()
			client = undefined
		}
	}),
}
