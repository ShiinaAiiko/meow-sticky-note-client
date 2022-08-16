import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	notesSlice,
	storageSlice,
	configSlice,
	appearanceSlice,
	userSlice,
} from '../../store'
import { Debounce, deepCopy } from '@nyanyajs/utils'
import { storage } from '../../store/storage'
const createRouterDebounce = new Debounce()
export const init = () => {
	console.log('store', store.getState())
	const electron = window.require('electron')

	if (electron) {
		const { ipcRenderer, ipcMain } = electron

		ipcRenderer.on('nativeThemeChange', (event, ...arg) => {
			store.dispatch(
				appearanceSlice.actions.setMode({
					mode: arg[1],
				})
			)
		})

		ipcRenderer.on('show', (event, ...arg) => {
			switch (window.location.pathname) {
				case '/pathname':
					store.dispatch(methods.notes.Init()).unwrap()

					break

				default:
					break
			}
		})

		ipcRenderer.on('updateData', (event, ...arg) => {
			// console.log('updateData', arg)
			// store.dispatch(methods.notes.Init()).unwrap()
			store.dispatch(methods.notes.GetLocalData())
		})

		ipcRenderer.on('updateProfile', (event, ...arg) => {
			console.log('updateData', arg)
			// store.dispatch(methods.notes.Init()).unwrap()
			store.dispatch(methods.user.Init())
		})

		ipcRenderer.on('updateSetting', (event, ...arg) => {
			console.log('updateSetting', arg?.[0]?.type)
			switch (arg?.[0]?.type) {
				case 'autoCloseWindowAfterCopy':
					store.dispatch(methods.config.initAutoCloseWindowAfterCopy())
					break
				case 'language':
					store.dispatch(methods.config.initLanguage())
					break

				case 'appearance':
					store.dispatch(methods.appearance.Init())
					break
				case 'sync':
					store.dispatch(methods.config.initSync())
					break

				default:
					break
			}
			// store.dispatch(methods.notes.Init()).unwrap()
		})

		ipcRenderer.on('openFolder', (event, ...arg) => {
			switch (arg?.[0]?.type) {
				case 'BackupPath':
					console.log(arg?.[0]?.path)
					if (arg?.[0]?.path) {
						store.dispatch(
							configSlice.actions.setBackup({
								type: 'storagePath',
								v: arg?.[0]?.path,
							})
						)
					}
					break

				default:
					break
			}
			// store.dispatch(methods.notes.Init()).unwrap()
		})
	}
}
export const createRouter = () => {
	createRouterDebounce.increase(() => {
		switch (store.getState().config.platform) {
			case 'Electron':
				init()
				break

			default:
				break
		}
	}, 100)
}
