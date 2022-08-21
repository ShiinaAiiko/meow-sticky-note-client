import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import exp from 'constants'
// import thunk from 'redux-thunk'
import { useDispatch } from 'react-redux'
import { storageMethods, storageSlice } from './storage'
import { notesSlice, notesMethods } from './notes'
import { appearanceMethods, appearanceSlice } from './appearance'
import { configMethods, configSlice } from './config'
import { userMethods, userSlice } from './user'
import { apiMethods, apiSlice } from './api'
import { nsocketioMethods, nsocketioSlice } from './nsocketio'
import { ssoMethods, ssoSlice } from './sso'

export interface ActionParams<T = any> {
	type: string
	payload: T
}

const rootReducer = combineReducers({
	notes: notesSlice.reducer,
	storage: storageSlice.reducer,
	appearance: appearanceSlice.reducer,
	config: configSlice.reducer,
	user: userSlice.reducer,
	api: apiSlice.reducer,
	nsocketio: nsocketioSlice.reducer,
	sso: ssoSlice.reducer,
})

const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
})

export {
	notesSlice,
	userSlice,
	nsocketioSlice,
	storageSlice,
	appearanceSlice,
	configSlice,
	ssoSlice,
}
export const methods = {
	notes: notesMethods,
	storage: storageMethods,
	appearance: appearanceMethods,
	config: configMethods,
	user: userMethods,
	api: apiMethods,
	nsocketio: nsocketioMethods,
	sso: ssoMethods,
}

// console.log(store.getState())

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()

export default store
