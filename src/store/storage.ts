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
export let storage = {
	notes: new WebStorage<string, NoteItem>({
		storage: storageStr,
		baseLabel: 'notes',
	}),
	global: new WebStorage<string, any>({
		storage: storageStr,
		baseLabel: 'global',
	}),
	systemConfig: new WebStorage<string, any>({
		storage: storageStr,
		baseLabel: 'systemConfig',
	}),
}
if (platform === 'Electron') {
	storageStr = 'ElectronNodeFsStorage'

	storage = {
		notes: new WebStorage<string, NoteItem>({
			storage: storageStr,
			baseLabel: 'notes',
		}),
		global: new WebStorage<string, any>({
			storage: storageStr,
			baseLabel: 'global',
		}),
		systemConfig: new WebStorage<string, any>({
			storage: storageStr,
			baseLabel: 'systemConfig',
		}),
	}
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
		init: (state) => {
			let uid = 0
			storage.notes.setLabel(storage.notes.getBaseLabel() + '_' + uid)
			storage.global.setLabel(storage.global.getBaseLabel() + '_' + uid)
		},
	},
})
