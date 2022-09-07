import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
	AsyncThunkOptions,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, {
	ActionParams,
	configSlice,
	RootState,
	userSlice,
} from '../index'
import { NoteItem, PageItem, CategoryItem } from './typings'
import { Debounce, deepCopy } from '@nyanyajs/utils'
import { prompt, snackbar, alert } from '@saki-ui/core'
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid'
import { storage } from '../storage'
import { getI18n } from 'react-i18next'
import { api } from '../../modules/http/api'
import electronApi from '../../modules/electron/api'
import { protoRoot, LongToNumber } from '../../protos'
import axios from 'axios'

const list: NoteItem[] = []

const syncRemoteDataDebounce = new Debounce()

const updateNoteDebounce = new Debounce()
const saveNoteDebounce = new Debounce()
const syncLoadingDebounce = new Debounce()

export const getNote = (id: string) => {
	api.v1
		.getNote({
			id: id,
		})
		.then((res: any) => {
			if (res.code === 200) {
				console.log('GetRemoteData', res.data.note)

				store.dispatch(
					notesSlice.actions.setNote({
						id: id,
						v: deepCopy(res.data.note),
					})
				)
			} else {
			}
		})
}

export const notesMethods = {
	Init: createAsyncThunk<
		void,
		void,
		{
			state: RootState
		}
	>('notes/Init', async (_, thunkAPI) => {
		syncRemoteDataDebounce.increase(async () => {
			const { user } = store.getState()
			await store.dispatch(notesMethods.GetLocalData())
			await store.dispatch(notesMethods.GetRemoteData())
			store.dispatch(notesSlice.actions.setIsInit(true))

			if (user.isLogin) {
				console.log('登陆完成，获取远程数据')
			}
		}, 200)
	}),
	GetLocalData: createAsyncThunk('notes/GetLocalData', async (_, thunkAPI) => {
		// console.log('------GetRemoteData------')
		const { config, notes, user } = store.getState()

		const res = await storage.notes.getAll()

		console.log('selectNote', res, await storage.global.get('selectNote'))

		// console.log('notes', storage.notes)
		if (res?.length) {
			store.dispatch(
				notesSlice.actions.init({
					list: res.map((v) => {
						return v.value
					}),
					noteId: (await storage.global.get('selectNote')) || 'none',
					categoryId: (await storage.global.get('selectCategory')) || 'none',
					pageId: (await storage.global.get('selectPage')) || 'none',
				})
			)
			store.dispatch(
				notesSlice.actions.setQuickReviewSelectData(
					await storage.global.get('quickReviewSelectData')
				)
			)
		}
		store.dispatch(
			configSlice.actions.setStatus({
				type: 'noteInitStatus',
				v: true,
			})
		)
	}),
	GetRemoteData: createAsyncThunk(
		'notes/GetRemoteData',
		async (_, thunkAPI) => {
			// console.log('------GetRemoteData------')
			const { config, notes, user } = store.getState()
			if (config.sync) {
				console.log('开始了同步功能')
				if (!user.isLogin) {
					console.log('未登录')
					return
				}
				store.dispatch(
					configSlice.actions.setStatus({
						type: 'syncStatus',
						v: true,
					})
				)

				// 1、获取所有的note列表以及其url
				// 检测准确的最新更新时间
				let files = await api.v1.getFolderFiles({})

				console.log('files', files)
				let total: any = files.data?.total
				if (files.code === 200) {
					files.data?.list?.forEach((v) => {
						if (v?.id && v.urls?.domainUrl && v.urls?.url) {
							//
							// console.log(notes.list)
							let isExist = false
							let note: NoteItem | undefined

							notes.list.some((sv) => {
								if (sv.id === v.id) {
									isExist = true
									note = sv
									return true
								}
							})
							// console.log(
							// 	'localLastUpdateTime',
							// 	note?.lastUpdateTime,
							// 	v.lastUpdateTime
							// )

							// // 本地存在\更新
							if (isExist && note?.lastUpdateTime) {
								//
								if (note.authorId === user.userInfo.uid && note.isSync) {
									// 更新时间每次和saass同步
									console.log(
										note.name,
										' => 存在,版本是否一致?',
										note?.lastUpdateTime,
										v.lastUpdateTime,
										Number(v.lastUpdateTime) > note.lastUpdateTime
									)
									if (Number(v.lastUpdateTime) > note.lastUpdateTime) {
										console.log('远程版本大于本地', note.name)
										getNote(v.id)
									} else if (
										Number(v.lastUpdateTime) === note?.lastUpdateTime
									) {
										console.log('已经是最新版了', note.name)
									} else {
										console.log('远程版本小于本地', note.name)
										saveNote({
											id: note.id,
											v: note,
											requestParams: {
												type: 'Note',
												methods: 'Update',
												options: {
													noteId: note.id,
												},
												data: {
													note: note,
												},
											},
										})
									}
								} else {
									if (note.authorId !== user.userInfo.uid) {
										console.log('这是其他人的日记')
									}
									console.log(note.name, ' => 禁用同步')
								}
							}
							// 本地不存在\添加
							else {
								console.log('远端存在,同步到本地', v)
								getNote(v.id)
							}
						} else {
						}
					})

					notes.list.forEach((v) => {
						let isExist = false
						files.data?.list?.some((sv) => {
							if (v.id === sv.id) {
								isExist = true
								return true
							}
						})
						// 本地存在\远端不存在
						if (!isExist && v.isSync) {
							console.log('本地存在远端不存在')
							api.v1
								.syncToServer({
									type: 'Note',
									methods: 'Add',
									options: {
										noteId: v.id,
									},
									data: {
										note: v,
									},
								})
								.then((res) => {
									console.log(res)
								})
						}
					})
				} else {
					if (files.code === 10004) {
						thunkAPI.dispatch(userSlice.actions.logout({}))
					}
				}
				store.dispatch(
					configSlice.actions.setStatus({
						type: 'syncStatus',
						v: false,
					})
				)
			} else {
				console.log('未开启同步功能')
			}
		}
	),
	AddNotebook: createAsyncThunk<
		void,
		void,
		{
			state: RootState
		}
	>('notes/AddNotebook', async (_, thunkAPI) => {
		let name = ''
		const i18n = getI18n()
		prompt({
			value: '',
			title: i18n.t('addNotebook', {
				ns: 'indexPage',
			}),
			placeholder: i18n.t('placeholder', {
				ns: 'indexPage',
			}),
			cancelText: i18n.t('cancel', {
				ns: 'common',
			}),
			confirmText: i18n.t('create', {
				ns: 'common',
			}),
			onChange(e) {
				name = e
				return ''
			},
			onCancel() {},
			onConfirm() {
				const { notes, user, config } = thunkAPI.getState()
				thunkAPI.dispatch(
					notesSlice.actions.addNote({
						v: {
							id: uuidv5(name, uuidv4()),
							name: name,
							createTime: Math.floor(new Date().getTime() / 1000),
							lastUpdateTime: Math.floor(new Date().getTime() / 1000),
							sort: (notes.list[notes.list?.length - 1]?.sort || 0) + 1,
							isSync: false,
							categories: [],
							authorId: user.userInfo.uid,
							version: config.version,
						},
					})
				)
			},
		}).open()
	}),
	AddCategory: createAsyncThunk(
		'notes/AddCategory',
		async ({ noteId }: { noteId: string }, thunkAPI) => {
			let name = ''
			const i18n = getI18n()
			prompt({
				value: '',
				title: i18n.t('addCategory', {
					ns: 'indexPage',
				}),
				placeholder: i18n.t('categoryName', {
					ns: 'indexPage',
				}),
				cancelText: i18n.t('cancel', {
					ns: 'common',
				}),
				confirmText: i18n.t('add', {
					ns: 'common',
				}),
				onChange(e) {
					name = e
					return ''
				},
				onCancel() {},
				onConfirm() {
					if (!name) {
						snackbar({
							message: i18n.t('categoryNameNil', {
								ns: 'indexPage',
							}),
							vertical: 'top',
							horizontal: 'center',
							autoHideDuration: 2000,
							closeIcon: true,
						}).open()
						return
					}
					thunkAPI.dispatch(
						notesSlice.actions.addCategory({
							noteId,
							category: {
								id: uuidv5(name, uuidv4()),
								name: name,
								createTime: Math.floor(new Date().getTime() / 1000),
								lastUpdateTime: Math.floor(new Date().getTime() / 1000),
								sort: 0,

								data: [],
							},
						})
					)
				},
			}).open()
			return ''
		}
	),
	AddPage: createAsyncThunk(
		'notes/AddPage',
		async (
			{
				noteId,
				categoryId,
			}: {
				noteId: string
				categoryId: string
			},
			thunkAPI
		) => {
			thunkAPI.dispatch(
				notesSlice.actions.addPage({
					noteId,
					categoryId,
					page: {
						id: uuidv5('Untitled Page', uuidv4()),
						title: '',
						content: '',
						createTime: Math.floor(new Date().getTime() / 1000),
						lastUpdateTime: Math.floor(new Date().getTime() / 1000),
						sort: 0,
					},
				})
			)
			return ''
		}
	),
	UpdatePage: createAsyncThunk(
		'notes/UpdatePage',
		(
			payload: {
				noteId: string
				categoryId: string
				pageId: string
				data: {
					title?: string
					content?: string
				}
			},
			thunkAPI
		) => {
			thunkAPI.dispatch(
				notesSlice.actions.updatePage({
					noteId: payload.noteId,
					categoryId: payload.categoryId,
					pageId: payload.pageId,
					data: payload.data,
				})
			)
		}
	),
	SyncData: createAsyncThunk(
		'notes/SyncData',
		(payload: protoRoot.sync.SyncData.IResponse, thunkAPI) => {
			console.log('SyncData')
			// thunkAPI.dispatch(notesSlice.actions.updatePage(payload))
			console.log('payload', payload)
			const pl: any = payload
			switch (payload.type) {
				case 'Note':
					switch (payload.methods) {
						case 'Add':
							thunkAPI.dispatch(
								notesSlice.actions.addNote({
									v: { ...pl.data?.note, isSync: true },
									disableSync: true,
								})
							)
							break
						case 'Update':
							thunkAPI.dispatch(
								notesSlice.actions.updateNote({
									noteId: pl.options?.noteId || '',
									note: {
										name: pl.data?.note?.name || '',
									},
									disableSync: true,
								})
							)
							break
						case 'Delete':
							thunkAPI.dispatch(
								notesSlice.actions.deleteNote({
									noteId: pl.options?.noteId,
									disableSync: true,
								})
							)
							break
						case 'Sort':
							thunkAPI.dispatch(
								notesSlice.actions.sortNote({
									originalIndex: pl.data?.sort?.originalIndex || 0,
									targetIndex: LongToNumber(pl.data?.sort?.targetIndex) || 0,
									disableSync: true,
								})
							)
							break

						default:
							break
					}

					break
				case 'Category':
					switch (payload.methods) {
						case 'Add':
							thunkAPI.dispatch(
								notesSlice.actions.addCategory({
									noteId: pl.options.noteId,
									category: {
										...pl.data?.category,
										title: pl.data?.category.name || '',
									},
									disableSync: true,
								})
							)
							break
						case 'Update':
							thunkAPI.dispatch(
								notesSlice.actions.updateCategory({
									noteId: pl.options?.noteId,
									categoryId: pl.options?.categoryId,
									category: {
										name: pl.data?.category.name,
									},
									disableSync: true,
								})
							)
							break
						case 'Delete':
							thunkAPI.dispatch(
								notesSlice.actions.deleteCategory({
									noteId: pl.options.noteId,
									categoryId: pl.options.categoryId,
									disableSync: true,
								})
							)
							break
						case 'Sort':
							thunkAPI.dispatch(
								notesSlice.actions.sortCategory({
									noteId: pl.options.noteId,
									originalIndex: pl.data?.sort?.originalIndex || 0,
									targetIndex: LongToNumber(pl.data?.sort?.targetIndex) || 0,
									disableSync: true,
								})
							)
							break

						default:
							break
					}

					break
				case 'Page':
					switch (payload.methods) {
						case 'Add':
							thunkAPI.dispatch(
								notesSlice.actions.addPage({
									noteId: pl.options.noteId,
									categoryId: pl.options.categoryId,
									page: {
										...pl.data?.page,
										title: pl.data?.page.title || '',
										content: pl.data?.page.content || '',
									},
									disableSync: true,
								})
							)
							break
						case 'Delete':
							thunkAPI.dispatch(
								notesSlice.actions.deletePage({
									noteId: pl.options.noteId,
									categoryId: pl.options.categoryId,
									pageId: pl.options.pageId,
									disableSync: true,
								})
							)
							break
						case 'Sort':
							thunkAPI.dispatch(
								notesSlice.actions.sortPage({
									noteId: pl.options.noteId,
									categoryId: pl.options.categoryId,
									originalIndex: pl.data?.sort?.originalIndex || 0,
									targetIndex: LongToNumber(pl.data?.sort?.targetIndex) || 0,
									disableSync: true,
								})
							)
							break
						case 'Update':
							thunkAPI.dispatch(
								notesSlice.actions.updatePage({
									noteId: pl.options.noteId,
									categoryId: pl.options.categoryId,
									pageId: pl.options.pageId,
									data: {
										...pl.data?.page,
									},
									disableSync: true,
								})
							)
							break

						default:
							break
					}

					break

				default:
					break
			}
		}
	),
}
export const saveNote = (payload: {
	id: string
	v: NoteItem
	requestParams?: protoRoot.sync.SyncToServer.IRequest
}) => {
	// console.log(payload)
	if (!payload?.id) return
	payload = deepCopy(payload)
	let note = payload.v
	// console.log(note)
	// const note = JSON.parse(JSON.stringify(payload.v))

	// saveNoteDebounce.increase(() => {
	console.log('-------saveNote-------')
	setTimeout(() => {
		const { user, config } = store.getState()
		config.sync &&
			store.dispatch(
				configSlice.actions.setStatus({
					type: 'syncStatus',
					v: true,
				})
			)
		// console.log('payload.id')
		// console.log(payload.id, note)
		storage.notes.set(payload.id, note).then(async () => {
			// console.log('payload.id')
			// console.log(payload.id)
			console.log('config.platform', config.platform)
			switch (config.platform) {
				case 'Electron':
					electronApi.api.updateData()
					break

				default:
					break
			}

			store.dispatch(
				notesSlice.actions.setNoteLastUpdateTime({
					id: payload.id,
					lastUpdateTime: Math.floor(new Date().getTime() / 1000),
				})
			)
			if (config.sync) {
				// && note.isSync
				if (note.authorId === user.userInfo.uid && note.isSync) {
					if (user.isLogin) {
						console.log('同步远端')
						console.log(payload.requestParams)
						if (payload.requestParams) {
							const res = await api.v1.syncToServer(payload.requestParams)

							console.log('res', res, payload.requestParams, res.code)
							if (res.code === 10021) {
								console.log('添加', payload.id, note)
								saveNote({
									id: payload.id,
									v: note,
									requestParams: {
										type: 'Note',
										methods: 'Add',
										options: {
											noteId: payload.id,
										},
										data: {
											note: note,
										},
									},
								})
								return
							}
							if (res.code === 200) {
								// const lastUpdateTime = new Date().getTime()
								res.data?.lastUpdateTime &&
									store.dispatch(
										notesSlice.actions.setNoteLastUpdateTime({
											id: payload.id,
											lastUpdateTime:
												Number(res.data.lastUpdateTime) || note.lastUpdateTime,
										})
									)
								// note.lastUpdateTime = lastUpdateTime
								// console.log(res.data.urls)
								// console.log(
								// 	(res.data.urls?.domainUrl || '') +
								// 		(res.data.urls?.encryptionUrl || '')
								// )
								// console.log(
								// 	(res.data.urls?.domainUrl || '') + (res.data.urls?.url || '')
								// )
							}
						}

						syncLoadingDebounce.increase(() => {
							store.dispatch(
								configSlice.actions.setStatus({
									type: 'syncStatus',
									v: false,
								})
							)
						}, 500)
						return
					}
				} else {
					if (note.authorId !== user.userInfo.uid) {
						console.log('这是其他人的日记')
					}
					console.log('禁用同步')
				}
				syncLoadingDebounce.increase(() => {
					store.dispatch(
						configSlice.actions.setStatus({
							type: 'syncStatus',
							v: false,
						})
					)
				}, 500)
			}
		})
	})
	// }, 700)
}

export const notesSlice = createSlice({
	name: 'notes',
	initialState: {
		noteId: 'none',
		categoryId: 'none',
		pageId: 'none',
		list,
		isInit: false,
		updateTime: 0,
		mustUpdate: false,
		quickReviewSelect: {
			noteId: '',
		},
	},
	reducers: {
		init: (
			state,
			params: ActionParams<{
				list: NoteItem[]
				noteId: string
				categoryId: string
				pageId: string
			}>
		) => {
			// console.log('init')
			state.list = params.payload.list
			state.list?.sort((a, b) => {
				return a.sort - b.sort
			})
			state.noteId = params.payload.noteId
			state.categoryId = params.payload.categoryId
			state.pageId = params.payload.pageId
			console.log('state.pageId', params, state.pageId)
		},
		setIsInit: (state, params: ActionParams<boolean>) => {
			state.isInit = params.payload
		},
		setQuickReviewSelectData: (
			state,
			params: ActionParams<{
				noteId: string
			}>
		) => {
			if (!params.payload?.noteId) {
				params.payload = {
					noteId: state.list?.[0]?.id || '',
				}
			}
			state.quickReviewSelect.noteId = params.payload.noteId
			storage.global.setSync('quickReviewSelectData', {
				noteId: params.payload.noteId,
			})
		},
		setNote: (
			state,
			params: ActionParams<{
				id: string
				v: NoteItem
			}>
		) => {
			let note: NoteItem | undefined
			state.list.some((v) => {
				if (v.id === params.payload.id) {
					note = Object.assign(v, params.payload.v)
					v = Object.assign(v, params.payload.v)
					state.updateTime = new Date().getTime()
					return true
				}
			})

			state.list?.sort((a, b) => {
				return a.sort - b.sort
			})
			if (note) {
				saveNote({
					id: note.id,
					v: note,
				})
			} else {
				// console.log('本地不存在', params.payload.v)
				setTimeout(() => {
					store.dispatch(
						notesSlice.actions.addNote({
							v: params.payload.v,
						})
					)
				})
			}
		},
		setNoteLastUpdateTime: (
			state,
			params: ActionParams<{
				id: string
				lastUpdateTime: number
			}>
		) => {
			// console.log('setNoteLastUpdateTime1')
			let note: NoteItem | undefined
			state.list.some((v) => {
				if (v.id === params.payload.id) {
					// console.log('setNoteLastUpdateTime2')
					v.lastUpdateTime = params.payload.lastUpdateTime

					storage.notes.set(v.id, deepCopy(v))
					return true
				}
			})
		},
		addNote: (
			state,
			params: ActionParams<{
				v: NoteItem
				disableSync?: boolean
			}>
		) => {
			// console.log(state.list, params)
			if (!params.payload) return
			let isExist = false
			state.list.some((v, i) => {
				if (v.id === params.payload.v.id) {
					isExist = true
					state.list[i] = Object.assign(v, params.payload.v)
					return true
				}
			})
			console.log('isExist', isExist)
			if (!isExist) {
				state.list.push(params.payload.v)

				state.list[state.list.length - 1].sort = state.list.length
			}
			state.noteId = params.payload.v.id
			// console.log(state.list, params)

			state.list?.sort((a, b) => {
				return a.sort - b.sort
			})
			saveNote({
				id: state.noteId,
				v: params.payload.v,
				requestParams: !params.payload.disableSync
					? {
							type: 'Note',
							methods: 'Add',
							options: {
								noteId: state.noteId,
							},
							data: {
								note: deepCopy(params.payload.v),
							},
					  }
					: undefined,
			})
			storage.global.setSync('selectNote', state.noteId)
		},
		updateNote: (
			state,
			params: ActionParams<{
				noteId: string
				note: {
					name?: string
					authorId?: number
					isSync?: boolean
				}
				disableSync?: boolean
			}>
		) => {
			const { noteId, note, disableSync } = params.payload
			if (!note.name) return
			state.list.some((v) => {
				if (v.id === noteId) {
					v.name = note.name || ''
					v.authorId = note.authorId || v.authorId
					v.isSync = note.isSync || v.isSync
					v.lastUpdateTime = Math.floor(new Date().getTime() / 1000)
					saveNote({
						id: v.id,
						v,
						requestParams: !disableSync
							? {
									type: 'Note',
									methods: 'Update',
									options: {
										noteId: v.id,
									},
									data: {
										note: {
											name: v.name,
											authorId: v.authorId,
											isSync: v.isSync,
											lastUpdateTime: v.lastUpdateTime,
										},
									},
							  }
							: undefined,
					})

					return true
				}
			})
		},
		enableSyncNote: (
			state,
			params: ActionParams<{
				noteId: string
				isSync: boolean
			}>
		) => {
			const { noteId, isSync } = params.payload
			state.list.some((v) => {
				if (v.id === noteId) {
					v.isSync = isSync
					saveNote({
						id: v.id,
						v,
						requestParams: undefined,
					})

					isSync &&
						setTimeout(async () => {
							await store.dispatch(notesMethods.GetRemoteData())
						})

					return true
				}
			})
		},

		saveNoteToThisAccount: (
			state,
			params: ActionParams<{
				noteId: string
				uid: number
			}>
		) => {
			console.log('saveNoteToThisAccount')
			// 存储至本账号的时候，检测是否有同样id的分类，如果有，
			// 询问用户是否合并两个笔记。不合并就全新创建(分类与页面的id也是新的)
			// 合并的时候，id用之前的id。
			// 这样就可以将本来的内容并在一起了,合并采用更新

			const { noteId, uid } = params.payload
			const note: NoteItem = deepCopy(
				state.list.filter((v) => v.id === noteId)?.[0]
			)
			const categoryIds = note.categories.map((v) => {
				return v.id
			})
			console.log(deepCopy(note))
			console.log(deepCopy(categoryIds))

			let nindex = -1
			let cNote: NoteItem
			state.list.forEach((v, i) => {
				if (v.authorId === uid) {
					v.categories.some((sv) => {
						console.log(categoryIds.includes(sv.id), v.name, sv.id)
						if (categoryIds.includes(sv.id)) {
							nindex = i
							return true
						}
					})
				}
				return nindex >= 0
			})
			console.log('nindex', nindex >= -1, nindex)
			if (nindex >= 0) {
				cNote = deepCopy(state.list[nindex])
			}
			const saveNote = (merge: boolean) => {
				setTimeout(() => {
					console.log('merge', merge)
					const { user } = store.getState()
					note.authorId = user.userInfo.uid
					if (merge) {
						// note.id = cNote.id
						// let categories: CategoryItem[] = []
						// cNote.categories.forEach((v) => {
						// 	const isExist = note.categories.filter((sv) => {
						// 		return sv.id === v.id
						// 	})
						// 	if (!isExist) {
						// 		categories.push(v)
						// 	}
						// })
						// console.log(categories)
						// note.categories = note.categories.concat(categories)
						// // 更新
						// store.dispatch(
						// 	notesSlice.actions.updateNote({
						// 		noteId: note.id,
						// 		note: {
						// 			name: note.name,
						// 			authorId: note.authorId,
						// 			isSync: note.isSync,
						// 		},
						// 		disableSync: false,
						// 	})
						// )
					} else {
						note.id = uuidv5(note.name, uuidv4())
						note.categories.forEach((v) => {
							v.id = uuidv5(v.name || 'none', uuidv4())
							v.data.forEach((sv) => {
								sv.id = uuidv5(sv.title || 'none', uuidv4())
							})
						})
						store.dispatch(
							notesSlice.actions.addNote({
								v: note,
							})
						)
						// 另存
					}

					// 删除原noteId
					store.dispatch(
						notesSlice.actions.deleteNote({
							noteId: noteId,
						})
					)
					console.log(note)
					console.log(cNote)
				})
			}
			if (nindex >= 0) {
				// 合并数据以后再说

				// 询问是否合并
				// alert({
				// 	title: '合并数据',
				// 	content:
				// 		'检测到与「' +
				// 		state.list[nindex].name +
				// 		'」可能是同一个数据内容,需要合并数据吗?',
				// 	cancelText: 'Save as',
				// 	confirmText: 'Merge',
				// 	onCancel() {
				// 		saveNote(false)
				// 	},
				// 	async onConfirm() {
				// 		saveNote(true)
				// 	},
				// }).open()
				saveNote(false)
				return
			}
			saveNote(false)
			// 无需合并
			// if (!note.name) return
			// state.list.some((v) => {
			// 	if (v.id === noteId) {
			// 		v.name = note.name || ''
			// 		v.lastUpdateTime = Math.floor(new Date().getTime() / 1000)
			// 		saveNote({
			// 			id: v.id,
			// 			v,
			// 			requestParams: !disableSync
			// 				? {
			// 						type: 'Note',
			// 						methods: 'Update',
			// 						options: {
			// 							noteId: v.id,
			// 						},
			// 						data: {
			// 							note: {
			// 								name: note.name,
			// 								lastUpdateTime: v.lastUpdateTime,
			// 							},
			// 						},
			// 				  }
			// 				: undefined,
			// 		})

			// 		return true
			// 	}
			// })
		},

		deleteNote: (
			state,
			params: ActionParams<{
				noteId: string
				disableSync?: boolean
			}>
		) => {
			const { noteId } = params.payload
			if (!noteId) return
			let index = -1
			state.list = state.list.filter((v, i) => {
				if (v.id === noteId) {
					index = i
				}
				return v.id !== noteId
			})

			let id = ''
			if (state.list.length) {
				id = state.list?.[index >= 1 ? index - 1 : 0]?.id
			}
			storage.notes.delete(noteId).then(async () => {
				store.dispatch(
					notesSlice.actions.selectNote({
						id,
					})
				)
				const { config, notes, user } = store.getState()
				if (config.sync) {
					const res = await api.v1.syncToServer({
						type: 'Note',
						methods: 'Delete',
						options: {
							noteId: noteId,
						},
						data: {},
					})

					console.log('Delete', res)
				}
			})
		},
		addCategory: (
			state,
			params: ActionParams<{
				noteId: string
				category: CategoryItem
				disableSync?: boolean
			}>
		) => {
			const { category, noteId, disableSync } = params.payload
			state.list.some((v) => {
				if (v.id === noteId) {
					v.categories.push(category)
					state.categoryId = category.id

					v.categories[v.categories.length - 1].sort = v.categories.length

					saveNote({
						id: v.id,
						v,
						requestParams: !disableSync
							? {
									type: 'Category',
									methods: 'Add',
									options: {
										noteId: v.id,
										categoryId: category.id,
									},
									data: {
										category: deepCopy(category),
									},
							  }
							: undefined,
					})
					storage.global.setSync('selectCategory', state.categoryId)
					return true
				}
			})
		},
		updateCategory: (
			state,
			params: ActionParams<{
				noteId: string
				categoryId: string
				category: {
					name?: string
				}
				disableSync?: boolean
			}>
		) => {
			const { noteId, category, categoryId, disableSync } = params.payload
			state.list.some((v) => {
				if (v.id === noteId) {
					v.categories.some((sv) => {
						if (sv.id === categoryId) {
							// console.log('categiory', category)
							// console.log({ ...sv })
							sv.lastUpdateTime = Math.floor(new Date().getTime() / 1000)
							sv = Object.assign(sv, category)
							// console.log({ ...sv })
							saveNote({
								id: v.id,
								v,
								requestParams: !disableSync
									? {
											type: 'Category',
											methods: 'Update',
											options: {
												noteId: v.id,
												categoryId: sv.id,
											},
											data: {
												category: Object.assign({}, category),
											},
									  }
									: undefined,
							})
							return true
						}
					})

					return true
				}
			})
		},
		deleteCategory: (
			state,
			params: ActionParams<{
				noteId: string
				categoryId: string
				disableSync?: boolean
			}>
		) => {
			const { categoryId, noteId, disableSync } = params.payload
			state.list.some((v) => {
				if (v.id === noteId) {
					v.categories = v.categories.filter((sv, si) => {
						if (sv.id === categoryId) {
							state.categoryId =
								v.categories[si - 1 >= 0 ? si - 1 : 0]?.id || 'none'
							if (state.categoryId) {
								state.pageId =
									v.categories[si - 1 >= 0 ? si - 1 : 0].data?.[0]?.id || 'none'
							}
						}
						return sv.id !== categoryId
					})

					saveNote({
						id: v.id,
						v,
						requestParams: !disableSync
							? {
									type: 'Category',
									methods: 'Delete',
									options: {
										noteId: v.id,
										categoryId: categoryId,
									},
									data: {},
							  }
							: undefined,
					})

					storage.global.setSync('selectPage', state.pageId)
					storage.global.setSync('selectCategory', state.categoryId)
					return true
				}
			})
		},
		addPage: (
			state,
			params: ActionParams<{
				noteId: string
				categoryId: string
				page: PageItem
				disableSync?: true
			}>
		) => {
			const { categoryId, noteId, page, disableSync } = params.payload
			state.list.some((v) => {
				if (v.id === noteId) {
					v.categories.some((sv) => {
						if (sv.id === categoryId) {
							page.sort = sv.data.length
							sv.data.push(page)

							state.pageId = page.id
							console.log('addPage', page, deepCopy(v))

							saveNote({
								id: v.id,
								v,
								requestParams: !disableSync
									? {
											type: 'Page',
											methods: 'Add',
											options: {
												noteId: v.id,
												categoryId: sv.id,
												pageId: page.id,
											},
											data: {
												page: page,
											},
									  }
									: undefined,
							})
							storage.global.setSync('selectPage', page.id)
							return true
						}
					})

					return true
				}
			})
		},
		updatePage: (
			state,
			params: ActionParams<{
				noteId: string
				categoryId: string
				pageId: string
				data: {
					title?: string
					content?: string
				}
				disableSync?: boolean
			}>
		) => {
			const { noteId, categoryId, pageId, data, disableSync } = params.payload
			console.log(params)
			state.list.some((v) => {
				if (v.id === noteId) {
					v.categories.some((sv) => {
						if (sv.id === categoryId) {
							sv.data.some((ssv) => {
								console.log('page', deepCopy(ssv), pageId)
								if (ssv.id === pageId) {
									ssv.lastUpdateTime = Math.floor(new Date().getTime() / 1000)
									// ssv = Object.assign(ssv, params.payload)
									// data.title &&
									// 	(ssv.title =
									// 		data.title.replace("'__nonec__xxx1,df,a", '') || '')
									// data.content && (ssv.content = data.content || '')
									// data.title !== '__nonec__xxx1,df,a' && (ssv.title = '')
									// data.content !== '__nonec__xxx1,df,a' && (ssv.content = '')

									if (!data.hasOwnProperty('title')) {
										data.title = '__nonec__xxx1,df,a'
									}
									if (!data.hasOwnProperty('content')) {
										data.content = '__nonec__xxx1,df,a'
									}
									// if (data.hasOwnProperty('content')) {
									// 	ssv.content = data.content || ''
									// }
									if (data?.title !== '__nonec__xxx1,df,a') {
										ssv.title = data.title || ''
									}
									if (data?.content !== '__nonec__xxx1,df,a') {
										ssv.content = data.content || ''
									}
									// state.pageId = page.id
									// console.log(JSON.parse(JSON.stringify(ssv)))
									// console.log('update')
									state.updateTime = Math.floor(new Date().getTime() / 1000)
									if (disableSync) {
										state.mustUpdate = true
									} else {
										state.mustUpdate = false
									}
									const saveNoteParams = {
										id: v.id,
										v: deepCopy(v),
										requestParams: !disableSync
											? {
													type: 'Page',
													methods: 'Update',
													options: {
														noteId: v.id,
														categoryId: sv.id,
														pageId: ssv.id,
													},
													data: {
														page: {
															title: data.hasOwnProperty('title')
																? data.title
																: '__nonec__xxx1,df,a',
															content: data.hasOwnProperty('content')
																? data.content
																: '__nonec__xxx1,df,a',
															lastUpdateTime: v.lastUpdateTime,
														},
													},
											  }
											: undefined,
									}
									updateNoteDebounce.increase(() => {
										console.log('update1', saveNoteParams)
										saveNote(saveNoteParams)
									}, 700)
									return true
								}
							})
							return true
						}
					})

					return true
				}
			})
		},
		deletePage: (
			state,
			params: ActionParams<{
				noteId: string
				categoryId: string
				pageId: string
				disableSync?: boolean
			}>
		) => {
			const { noteId, categoryId, pageId, disableSync } = params.payload
			state.list.some((v) => {
				if (v.id === noteId) {
					v.categories.some((sv) => {
						if (sv.id === categoryId) {
							sv.data = sv.data.filter((ssv, ssi) => {
								if (ssv.id === pageId) {
									state.pageId = sv.data[ssi - 1 >= 0 ? ssi - 1 : 0]?.id
								}
								return ssv.id !== pageId
							})
							storage.global.setSync('selectPage', state.pageId)

							saveNote({
								id: v.id,
								v,
								requestParams: !disableSync
									? {
											type: 'Page',
											methods: 'Delete',
											options: {
												noteId: v.id,
												categoryId: sv.id,
												pageId: pageId,
											},
											data: {},
									  }
									: undefined,
							})
							return true
						}
					})

					return true
				}
			})
		},

		selectNote: (
			state,
			params: ActionParams<{
				id: string
				isInit?: boolean
			}>
		) => {
			let { id } = params.payload
			if (!id) {
				if (state.list.length) {
					id = state.list[0].id
				}
			}
			state.list.some((v) => {
				if (v.id === id) {
					if (v.categories?.[0]) {
						state.categoryId = v.categories?.[0].id
						storage.global.setSync('selectCategory', state.categoryId)
						if (v.categories?.[0]?.data?.[0]) {
							state.pageId = v.categories?.[0]?.data?.[0]?.id
							storage.global.setSync('selectPage', state.pageId)
						}
					}
					state.noteId = id
					storage.global.setSync('selectNote', state.noteId)

					return true
				}
			})
		},
		selectCategory: (
			state,
			params: ActionParams<{
				id: string
				isInit?: boolean
			}>
		) => {
			let { id } = params.payload

			if (!id) {
				storage.global.setSync('selectPage', '')
				storage.global.setSync('selectCategory', '')
				return
			}
			if (state.categoryId === id) return
			state.categoryId = id
			storage.global.setSync('selectCategory', state.categoryId)
			state.list.some((v) => {
				if (v.id === state.noteId) {
					v.categories.some((sv) => {
						if (sv.id === state.categoryId) {
							state.pageId = sv.data?.[0]?.id || ''
							storage.global.setSync('selectPage', state.pageId)
							return true
						}
					})
					return true
				}
			})
		},
		selectPage: (
			state,
			params: ActionParams<{
				id: string
			}>
		) => {
			const { id } = params.payload
			if (state.pageId === id) return
			state.pageId = id
			// console.log(id)
			storage.global.getAndSet('selectPage', async (v) => {
				// console.log('v', storage.global, 'v', v, 'id', id)
				return id
			})
		},
		sortNote: (
			state,
			params: ActionParams<{
				originalIndex: number
				targetIndex: number
				disableSync?: boolean
			}>
		) => {
			// console.log('state.list', deepCopy(state.list))
			let { originalIndex, targetIndex, disableSync } = params.payload
			if (originalIndex === targetIndex) return

			// console.log(originalIndex, targetIndex)
			if (originalIndex < targetIndex) {
				for (let i = originalIndex; i < targetIndex; i++) {
					// console.log(i, i + 1)
					// sorts[i].sort = sorts[i + 1].sort
					// sorts[i + 1].sort = sorts[i].sort
					;[state.list[i], state.list[i + 1]] = [
						state.list[i + 1],
						state.list[i],
					]
				}
			} else {
				for (let i = originalIndex; i > targetIndex; i--) {
					// console.log(i, i - 1)
					// sorts[i].sort = sorts[i - 1].sort
					// sorts[i - 1].sort = sorts[i].sort
					;[state.list[i], state.list[i - 1]] = [
						state.list[i - 1],
						state.list[i],
					]
				}
			}
			state.list.forEach((v, i) => {
				console.log('v.sort !== i + 1', v.sort, i + 1)
				if (v.sort !== i + 1) {
					v.lastUpdateTime = Math.floor(new Date().getTime() / 1000)
				}
				v.sort = i + 1
			})

			// console.log(
			// 	state.list.map((v) => {
			// 		return {
			// 			id: v.id,
			// 			sort: v.sort,
			// 		}
			// 	})
			// )
			state.list.sort((a, b) => {
				return a.sort - b.sort
			})
			// console.log('state.list', deepCopy(state.list))
			if (!disableSync) {
				let ids = state.list.map((v) => {
					saveNote({
						id: v.id,
						v,
					})
					return {
						id: v.id,
						sort: v.sort,
						lastUpdateTime: v.lastUpdateTime,
					}
				})
				setTimeout(() => {
					api.v1
						.syncToServer({
							type: 'Note',
							methods: 'Sort',
							options: {},
							data: {
								sort: {
									originalIndex,
									targetIndex,
									list: ids,
								},
							},
						})
						.then((res) => {
							console.log(res)
						})
				})
			}
		},
		sortCategory: (
			state,
			params: ActionParams<{
				noteId: string
				originalIndex: number
				targetIndex: number
				disableSync?: boolean
			}>
		) => {
			let { noteId, originalIndex, targetIndex, disableSync } = params.payload

			if (originalIndex === targetIndex) return

			// storage.global.setSync('selectCategory', state.categoryId)
			state.list.some((v) => {
				if (v.id === noteId) {
					if (originalIndex < targetIndex) {
						for (let i = originalIndex; i < targetIndex; i++) {
							;[v.categories[i], v.categories[i + 1]] = [
								v.categories[i + 1],
								v.categories[i],
							]
						}
					} else {
						for (let i = originalIndex; i > targetIndex; i--) {
							;[v.categories[i], v.categories[i - 1]] = [
								v.categories[i - 1],
								v.categories[i],
							]
						}
					}
					saveNote({
						id: v.id,
						v,
						requestParams: !disableSync
							? {
									type: 'Category',
									methods: 'Sort',
									options: {
										noteId: v.id,
									},
									data: {
										note: {
											categories: v.categories,
										},
										sort: {
											originalIndex,
											targetIndex,
										},
									},
							  }
							: undefined,
					})
					return true
				}
			})
		},
		sortPage: (
			state,
			params: ActionParams<{
				noteId: string
				categoryId: string
				originalIndex: number
				targetIndex: number
				disableSync?: boolean
			}>
		) => {
			let { noteId, categoryId, originalIndex, targetIndex, disableSync } =
				params.payload

			if (originalIndex === targetIndex) return

			// storage.global.setSync('selectCategory', state.categoryId)
			state.list.some((v) => {
				if (v.id === noteId) {
					v.categories.some((sv) => {
						if (sv.id === categoryId) {
							if (originalIndex < targetIndex) {
								for (let i = originalIndex; i < targetIndex; i++) {
									;[sv.data[i], sv.data[i + 1]] = [sv.data[i + 1], sv.data[i]]
								}
							} else {
								for (let i = originalIndex; i > targetIndex; i--) {
									;[sv.data[i], sv.data[i - 1]] = [sv.data[i - 1], sv.data[i]]
								}
							}
							saveNote({
								id: v.id,
								v,
								requestParams: !disableSync
									? {
											type: 'Page',
											methods: 'Sort',
											options: {
												noteId: v.id,
												categoryId: sv.id,
											},
											data: {
												category: { data: sv.data },
												sort: {
													originalIndex,
													targetIndex,
												},
											},
									  }
									: undefined,
							})
							return true
						}
					})
					return true
				}
			})
		},
	},
})
