import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, { ActionParams, RootState } from '.'
import { PARAMS, protoRoot } from '../protos'
import { WebStorage, SakiSSOClient } from '@nyanyajs/utils'

import { sakisso } from '../config'
import { userAgent } from './user'

export const modeName = 'sso'

export let client: SakiSSOClient | undefined

const namespace = {
	base: '/',
	sync: '/sync',
}
const state: {
	client?: SakiSSOClient
	namespace: typeof namespace
	status: 'connecting' | 'success' | 'fail' | 'notConnected'
} = {
	status: 'notConnected',
	namespace,
}
export const ssoSlice = createSlice({
	name: modeName,
	initialState: state,
	reducers: {
		init: (state, params: ActionParams<{}>) => {},
		setStatus: (state, params: ActionParams<typeof state['status']>) => {
			state.status = params.payload
		},
	},
})

export const ssoMethods = {
	Init: createAsyncThunk<
		void,
		void,
		{
			state: RootState
		}
	>(modeName + '/Init', async (_, thunkAPI) => {
		console.log('初始化sso')
		client = new SakiSSOClient({
			appId: sakisso.appId,
			clientUrl: sakisso.clientUrl,
			serverUrl: sakisso.serverUrl,
			userAgent,
		})
		console.log('sakisso', client)
	}),
}
