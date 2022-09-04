import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, { ActionParams } from '.'
// import { WebStorage, StorageOptions } from './ws'
import { WebStorage, StorageOptions } from '@nyanyajs/utils/dist/webStorage'
import { NoteItem } from './notes/typings'
import { platform } from './config'

let storageStr: StorageOptions['storage'] = 'IndexedDB'

console.log(storageStr)
if (platform === 'Electron') {
	storageStr = 'ElectronNodeFsStorage'
}
let labelPrefix = process.env.NODE_ENV === 'development' ? 'dev_' : ''
export let storage = {
	notes: new WebStorage<string, NoteItem>({
		storage: storageStr,
		baseLabel: labelPrefix + 'notes',
	}),
	global: new WebStorage<string, any>({
		storage: storageStr,
		baseLabel: labelPrefix + 'global',
	}),
	systemConfig: new WebStorage<string, any>({
		storage: storageStr,
		baseLabel: labelPrefix + 'systemConfig',
	}),
}

export const storageMethods = {
	init: createAsyncThunk('storage/init', async ({}, thunkAPI) => {
		return
	}),
}

export const storageSlice = createSlice({
	name: 'storage',
	initialState: {
		// 未来改nodefs
	},
	reducers: {
		init: (state, params: ActionParams<number>) => {
			// let uid = params.payload || 0
			// storage.notes.setLabel(storage.notes.getBaseLabel() + '_' + uid)
			// storage.global.setLabel(storage.global.getBaseLabel() + '_' + uid)
		},
	},
})
