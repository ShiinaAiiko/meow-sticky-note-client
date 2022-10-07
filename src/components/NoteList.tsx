import React, { useEffect, useRef, useState } from 'react'
import { RouterProps, useNavigate, Link, useLocation } from 'react-router-dom'
import logo from '../logo.svg'
import './NoteList.scss'
import { Helmet } from 'react-helmet-async'
import SideMenu from '../components/SideMenu'
import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	notesSlice,
	methods,
	userSlice,
} from '../store'
import { useSelector, useDispatch } from 'react-redux'
import { bindEvent } from '../modules/bindEvent'
import { useTranslation } from 'react-i18next'
import { snackbar, prompt, alert } from '@saki-ui/core'

import { Header } from '../components'
import { api } from '../modules/electron/api'
import { NoteItem } from '../store/notes/typings'
import { ReaderRouterProps } from '../modules/renderRoutes'
import { SyncOff } from './Icon'

const NodeListComponent = ({
	onClick,
	onClose,
}: {
	onClick: ({ id }: { id: string }) => void
	onClose?: () => void
}) => {
	const { t, i18n } = useTranslation()
	const dispatch = useDispatch<AppDispatch>()
	const notes = useSelector((state: RootState) => state.notes)
	const config = useSelector((state: RootState) => state.config)
	const user = useSelector((state: RootState) => state.user)
	const autoCloseWindowAfterCopy = useSelector(
		(state: RootState) => state.config.general.autoCloseWindowAfterCopy
	)
	const [noteContextMenuEl, setNoteContextMenuEl] = useState<any>()
	const [contentMenuActiveIndex, setContentMenuActiveIndex] =
		useState<number>(-1)

	let history = useNavigate()
	let location = useLocation()
	const [menuEl, setMenuEl] = useState<any>(null)
	const menuElRef = useRef<any>()

	useEffect(() => {
		if (menuElRef) {
		}
	}, [menuElRef])

	return (
		<div className='note-list-component'>
			<div className='page-subtitle'>
				{t('notes', {
					ns: 'common',
				})}
			</div>
			<saki-menu
				ref={bindEvent(
					{
						selectvalue: async (e) => {
							// console.log(e.detail.value)
							onClose?.()
							switch (e.detail.value) {
								case 'AddNotebook':
									onClick?.({
										id: '',
									})
									await dispatch(methods.notes.AddNotebook()).unwrap()

									break
								default:
									onClick({
										id: e.detail.value,
									})
									break
							}
							// setOpenDropDownMenu(false)
						},
					},
					(e) => {
						setMenuEl(e)
					}
				)}
				padding='0px'
			>
				<saki-drag-sort
					ref={bindEvent({
						dragdone: (e) => {
							console.log(e.detail)
							dispatch(
								notesSlice.actions.sortNote({
									originalIndex: e.detail.originalIndex,
									targetIndex: e.detail.targetIndex,
								})
							)
						},
					})}
				>
					{notes.list?.map((v, i) => {
						return (
							<div key={v.id}>
								<saki-menu-item
									key={v.id}
									ref={bindEvent({
										opencontextmenu: (e) => {
											console.log(e)
											if (location.pathname !== '/quickreview') {
												setContentMenuActiveIndex(i)
												noteContextMenuEl?.show({
													x: e.detail.pageX,
													y: e.detail.pageY,
													label: i.toString(),
												})
											}
										},
									})}
									none-highlight-color
									padding='4px 18px'
									value={v.id}
								>
									<div
										data-id={v.id}
										data-author-id={String(v.authorId)}
										data-current-uid={String(user.userInfo.uid)}
										className='note-item'
									>
										<span className='name text-elipsis'>{v.name}</span>
										{v.authorId === user.userInfo.uid && v.isSync ? (
											''
										) : (
											<SyncOff />
										)}
									</div>
								</saki-menu-item>
							</div>
						)
					})}
				</saki-drag-sort>

				<saki-menu-item
					padding='4px 18px'
					font-size='15px'
					value={'AddNotebook'}
				>
					<div className={'note-item text-elipsis add-note'}>
						<span className='text-elipsis'>
							{t('addNotebook', {
								ns: 'indexPage',
							})}
						</span>
					</div>
				</saki-menu-item>
			</saki-menu>

			<saki-context-menu
				z-index='1000'
				ref={bindEvent(
					{
						selectvalue: async (e) => {
							const note = notes.list[Number(e.detail.label)]
							// onClose?.()
							switch (e.detail.value) {
								case 'rename':
									let name = ''

									prompt({
										title: t('rename', {
											ns: 'common',
										}),
										value: note.name,
										placeholder: t('notebookName', {
											ns: 'common',
										}),
										cancelText: t('cancel', {
											ns: 'common',
										}),
										confirmText: t('rename', {
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
													message: i18n.t('notebookNameNil', {
														ns: 'common',
													}),
													vertical: 'top',
													horizontal: 'center',
													autoHideDuration: 2000,
													closeIcon: true,
												}).open()
												return
											}
											dispatch(
												notesSlice.actions.updateNote({
													noteId: note.id,
													note: {
														name,
													},
												})
											)
										},
									}).open()
									break
								case 'delete':
									alert({
										title: t('delete', {
											ns: 'common',
										}),
										content: t('deleteThisNote', {
											ns: 'common',
										}),
										cancelText: t('cancel', {
											ns: 'common',
										}),
										confirmText: t('delete', {
											ns: 'common',
										}),
										onCancel() {},
										async onConfirm() {
											dispatch(
												notesSlice.actions.deleteNote({
													noteId: note.id,
												})
											)
										},
									}).open()
									break
								case 'saveToThisAccount':
									alert({
										title: '存储至此帐号',
										content: '存储至此帐号吗?',
										cancelText: t('cancel', {
											ns: 'common',
										}),
										confirmText: 'Save',
										onCancel() {},
										async onConfirm() {
											dispatch(
												notesSlice.actions.saveNoteToThisAccount({
													noteId: note.id,
													uid: user.userInfo.uid,
												})
											)
										},
									}).open()
									break
								case 'download':
									console.log('下载文件')
									// 创建隐藏的可下载链接
									const a = document.createElement('a')
									a.download = note.name.trim() + '.note'
									a.style.display = 'none'
									console.log(note)
									// 字符内容转变成blob地址
									a.href = URL.createObjectURL(
										new Blob([JSON.stringify(note, null, 2)])
									)
									// 触发点击
									document.body.appendChild(a)
									a.click()
									// 然后移除
									document.body.removeChild(a)
									break
								case 'saveAs':
									const fileName = note.name.trim() + '.note'
									api.saveAs(fileName, JSON.stringify(note, null, 2), {
										extensions: ['note'],
									})
									break
								case 'sync':
									alert({
										title: t('sync', {
											ns: 'settings',
										}),
										content: note.isSync
											? t('turnedOffTip', {
													ns: 'common',
											  })
											: t('turnedOnTip', {
													ns: 'common',
											  }),
										cancelText: t('cancel', {
											ns: 'common',
										}),
										confirmText: note.isSync
											? t('turnOff', {
													ns: 'common',
											  })
											: t('turnOn', {
													ns: 'common',
											  }),
										onCancel() {},
										async onConfirm() {
											store.dispatch(
												methods.notes.EnableSyncNote({
													noteId: note.id,
													isSync: !note.isSync,
												})
											)
										},
									}).open()
									break
								default:
									break
							}
						},
					},
					(e) => {
						setNoteContextMenuEl(e)
					}
				)}
			>
				<saki-context-menu-item
					width='200px'
					font-size='13px'
					padding='12px 10px'
					value='sync'
					disabled={
						notes.list[contentMenuActiveIndex]?.authorId !== user.userInfo.uid
					}
				>
					<div
						className={
							'context-menu-item ' +
							(notes.list[contentMenuActiveIndex]?.authorId !==
							user.userInfo.uid
								? 'disabletap'
								: '')
						}
					>
						<svg
							className='icon'
							viewBox='0 0 1024 1024'
							version='1.1'
							xmlns='http://www.w3.org/2000/svg'
							p-id='8580'
						>
							<path
								d='M505.6 57.6a20.906667 20.906667 0 0 1 6.4 15.36V170.666667a341.333333 341.333333 0 0 1 295.253333 512 22.186667 22.186667 0 0 1-15.786666 10.24 21.333333 21.333333 0 0 1-17.92-5.973334l-31.146667-31.146666a21.333333 21.333333 0 0 1-3.84-25.173334A253.44 253.44 0 0 0 768 512a256 256 0 0 0-256-256v100.693333a20.906667 20.906667 0 0 1-6.4 15.36l-8.533333 8.533334a21.333333 21.333333 0 0 1-30.293334 0L315.733333 229.973333a21.76 21.76 0 0 1 0-30.293333l151.04-150.613333a21.333333 21.333333 0 0 1 30.293334 0z m51.626667 585.813333a21.333333 21.333333 0 0 0-30.293334 0l-8.533333 8.533334a20.906667 20.906667 0 0 0-6.4 15.36V768a256 256 0 0 1-256-256 248.746667 248.746667 0 0 1 29.866667-119.04 21.76 21.76 0 0 0-3.84-25.173333l-31.573334-31.573334a21.333333 21.333333 0 0 0-17.92-5.973333 22.186667 22.186667 0 0 0-15.786666 11.093333A341.333333 341.333333 0 0 0 512 853.333333v97.706667a20.906667 20.906667 0 0 0 6.4 15.36l8.533333 8.533333a21.333333 21.333333 0 0 0 30.293334 0l151.04-150.613333a21.76 21.76 0 0 0 0-30.293333z'
								p-id='8581'
							></path>
						</svg>
						<span>
							{notes.list[contentMenuActiveIndex]?.isSync
								? t('turnOffSync', {
										ns: 'common',
								  })
								: t('turnOnSync', {
										ns: 'common',
								  })}
						</span>
					</div>
				</saki-context-menu-item>
				<saki-context-menu-item
					style={{
						display:
							notes.list[contentMenuActiveIndex]?.authorId !== user.userInfo.uid
								? 'block'
								: 'none',
					}}
					width='200px'
					font-size='13px'
					padding='12px 10px'
					value='saveToThisAccount'
				>
					<div className='context-menu-item'>
						<svg
							className='icon'
							viewBox='0 0 1024 1024'
							version='1.1'
							xmlns='http://www.w3.org/2000/svg'
							p-id='41162'
						>
							<path
								d='M85.333333 128v320L725.333333 512 85.333333 576V896l853.333334-384L85.333333 128z'
								p-id='41163'
							></path>
						</svg>
						<span>Save to this account</span>
					</div>
				</saki-context-menu-item>
				<saki-context-menu-item
					width='200px'
					font-size='13px'
					padding='12px 10px'
					value='rename'
				>
					<div className='context-menu-item'>
						<svg
							className='icon'
							viewBox='0 0 1024 1024'
							version='1.1'
							xmlns='http://www.w3.org/2000/svg'
							p-id='8901'
						>
							<path
								d='M916.945455 900.654545H111.709091c-18.618182 0-34.909091-16.290909-34.909091-34.90909s16.290909-34.909091 34.909091-34.909091h805.236364c18.618182 0 34.909091 16.290909 34.90909 34.909091s-13.963636 34.909091-34.90909 34.90909zM842.472727 747.054545H393.309091c-18.618182 0-34.909091-16.290909-34.909091-34.90909s16.290909-34.909091 34.909091-34.909091h446.836364c18.618182 0 34.909091 16.290909 34.90909 34.909091s-13.963636 34.909091-32.581818 34.90909zM160.581818 542.254545l104.727273 107.054546-46.545455 46.545454-104.727272-104.727272zM558.545455 141.963636l104.727272 107.054546-48.872727 46.545454-104.727273-104.727272z'
								fill='#666666'
								p-id='8902'
							></path>
							<path
								d='M128 765.672727c-20.945455 0-41.890909-9.309091-58.181818-25.6-16.290909-16.290909-25.6-41.890909-25.6-65.163636l9.309091-114.036364L537.6 74.472727c23.272727-23.272727 53.527273-34.909091 86.109091-34.909091 37.236364 0 72.145455 16.290909 97.745454 41.890909 27.927273 27.927273 41.890909 65.163636 41.89091 102.4 0 32.581818-13.963636 62.836364-37.236364 83.781819l-479.418182 488.727272-114.036364 9.309091h-4.654545z m-4.654545-174.545454L116.363636 679.563636c0 4.654545 2.327273 9.309091 4.654546 9.309091 2.327273 2.327273 6.981818 4.654545 9.309091 4.654546l88.436363-6.981818L677.236364 216.436364c9.309091-9.309091 13.963636-20.945455 16.290909-34.909091 0-18.618182-6.981818-37.236364-20.945455-51.2-13.963636-13.963636-30.254545-20.945455-48.872727-20.945455-9.309091 0-23.272727 2.327273-34.909091 13.963637l-465.454545 467.781818z'
								fill='#666666'
								p-id='8903'
							></path>
						</svg>
						<span>
							{t('renameThisNote', {
								ns: 'indexPage',
							})}
						</span>
					</div>
				</saki-context-menu-item>

				{config.platform === 'Electron' ? (
					<saki-context-menu-item
						width='200px'
						font-size='13px'
						padding='12px 10px'
						value='saveAs'
					>
						<div className='context-menu-item'>
							<svg
								className='icon'
								viewBox='0 0 1024 1024'
								version='1.1'
								xmlns='http://www.w3.org/2000/svg'
								p-id='35094'
							>
								<path
									d='M925.6 337.9c-22.6-53.3-54.8-101.2-96-142.3-41.1-41.1-89-73.4-142.3-96C632.1 76.2 573.5 64.4 513 64.4S393.9 76.2 338.7 99.6c-53.3 22.6-101.2 54.8-142.3 96-41.1 41.1-73.4 89-96 142.3C77 393.1 65.2 451.8 65.2 512.2c0 60.4 11.8 119.1 35.2 174.3 22.6 53.3 54.8 101.2 96 142.3 41.1 41.1 89 73.4 142.3 96C393.9 948.2 452.6 960 513 960s119.1-11.8 174.3-35.2c53.3-22.6 101.2-54.8 142.3-96 41.1-41.1 73.4-89 96-142.3 23.4-55.2 35.2-113.9 35.2-174.3 0-60.4-11.8-119.1-35.2-174.3zM513 879.1c-202.3 0-366.9-164.6-366.9-366.9S310.7 145.3 513 145.3c202.3 0 366.9 164.6 366.9 366.9S715.4 879.1 513 879.1z'
									p-id='35095'
								></path>
								<path
									d='M664.7 520.8c-17.6-15.6-44.7-13.9-60.3 3.7l-49.2 55.7V368.5c0-1.3-0.1-2.7-0.2-4 0.1-1.4 0.2-2.9 0.2-4.4v-30.3c0-23.2-19-42.2-42.2-42.2-23.2 0-42.2 19-42.2 42.2v30.3c0 1.6 0.1 3.1 0.3 4.7-0.1 1.2-0.2 2.4-0.2 3.7v211.6l-49.2-55.6c-15.6-17.6-42.7-19.3-60.3-3.7-17.6 15.6-19.3 42.7-3.7 60.3L481 720.5c4.1 4.7 9 8.2 14.4 10.6 0.1 0 0.2 0.1 0.3 0.1l1.5 0.6c0.2 0.1 0.4 0.2 0.6 0.2 0.4 0.2 0.8 0.3 1.2 0.4 0.3 0.1 0.6 0.2 0.8 0.3 0.3 0.1 0.7 0.2 1 0.3s0.7 0.2 1 0.3 0.6 0.2 0.9 0.2c0.4 0.1 0.8 0.2 1.1 0.3 0.3 0.1 0.6 0.1 0.8 0.2 0.4 0.1 0.8 0.2 1.2 0.2 0.3 0 0.5 0.1 0.8 0.1 0.4 0.1 0.8 0.1 1.2 0.2 0.3 0 0.6 0.1 0.8 0.1 0.4 0 0.8 0.1 1.2 0.1 0.3 0 0.6 0 0.9 0.1h4.2c0.3 0 0.6 0 0.9-0.1 0.4 0 0.8-0.1 1.2-0.1 0.3 0 0.6-0.1 0.8-0.1 0.4 0 0.8-0.1 1.2-0.2 0.3 0 0.5-0.1 0.8-0.1 0.4-0.1 0.8-0.1 1.2-0.2 0.3-0.1 0.6-0.1 0.8-0.2 0.4-0.1 0.8-0.2 1.1-0.3s0.6-0.1 0.9-0.2c0.3-0.1 0.7-0.2 1-0.3s0.7-0.2 1-0.3 0.6-0.2 0.8-0.3c0.4-0.1 0.8-0.3 1.2-0.4 0.2-0.1 0.4-0.2 0.6-0.2l1.5-0.6c0.1 0 0.2-0.1 0.3-0.1 5.3-2.4 10.3-5.9 14.4-10.6L668 581.1c16-17.6 14.3-44.8-3.3-60.3z'
									p-id='35096'
								></path>
							</svg>
							<span>
								{t('saveAs', {
									ns: 'common',
								})}
							</span>
						</div>
					</saki-context-menu-item>
				) : (
					<saki-context-menu-item
						width='200px'
						font-size='13px'
						padding='12px 10px'
						value='download'
					>
						<div className='context-menu-item'>
							<svg
								className='icon'
								viewBox='0 0 1024 1024'
								version='1.1'
								xmlns='http://www.w3.org/2000/svg'
								p-id='35094'
							>
								<path
									d='M925.6 337.9c-22.6-53.3-54.8-101.2-96-142.3-41.1-41.1-89-73.4-142.3-96C632.1 76.2 573.5 64.4 513 64.4S393.9 76.2 338.7 99.6c-53.3 22.6-101.2 54.8-142.3 96-41.1 41.1-73.4 89-96 142.3C77 393.1 65.2 451.8 65.2 512.2c0 60.4 11.8 119.1 35.2 174.3 22.6 53.3 54.8 101.2 96 142.3 41.1 41.1 89 73.4 142.3 96C393.9 948.2 452.6 960 513 960s119.1-11.8 174.3-35.2c53.3-22.6 101.2-54.8 142.3-96 41.1-41.1 73.4-89 96-142.3 23.4-55.2 35.2-113.9 35.2-174.3 0-60.4-11.8-119.1-35.2-174.3zM513 879.1c-202.3 0-366.9-164.6-366.9-366.9S310.7 145.3 513 145.3c202.3 0 366.9 164.6 366.9 366.9S715.4 879.1 513 879.1z'
									p-id='35095'
								></path>
								<path
									d='M664.7 520.8c-17.6-15.6-44.7-13.9-60.3 3.7l-49.2 55.7V368.5c0-1.3-0.1-2.7-0.2-4 0.1-1.4 0.2-2.9 0.2-4.4v-30.3c0-23.2-19-42.2-42.2-42.2-23.2 0-42.2 19-42.2 42.2v30.3c0 1.6 0.1 3.1 0.3 4.7-0.1 1.2-0.2 2.4-0.2 3.7v211.6l-49.2-55.6c-15.6-17.6-42.7-19.3-60.3-3.7-17.6 15.6-19.3 42.7-3.7 60.3L481 720.5c4.1 4.7 9 8.2 14.4 10.6 0.1 0 0.2 0.1 0.3 0.1l1.5 0.6c0.2 0.1 0.4 0.2 0.6 0.2 0.4 0.2 0.8 0.3 1.2 0.4 0.3 0.1 0.6 0.2 0.8 0.3 0.3 0.1 0.7 0.2 1 0.3s0.7 0.2 1 0.3 0.6 0.2 0.9 0.2c0.4 0.1 0.8 0.2 1.1 0.3 0.3 0.1 0.6 0.1 0.8 0.2 0.4 0.1 0.8 0.2 1.2 0.2 0.3 0 0.5 0.1 0.8 0.1 0.4 0.1 0.8 0.1 1.2 0.2 0.3 0 0.6 0.1 0.8 0.1 0.4 0 0.8 0.1 1.2 0.1 0.3 0 0.6 0 0.9 0.1h4.2c0.3 0 0.6 0 0.9-0.1 0.4 0 0.8-0.1 1.2-0.1 0.3 0 0.6-0.1 0.8-0.1 0.4 0 0.8-0.1 1.2-0.2 0.3 0 0.5-0.1 0.8-0.1 0.4-0.1 0.8-0.1 1.2-0.2 0.3-0.1 0.6-0.1 0.8-0.2 0.4-0.1 0.8-0.2 1.1-0.3s0.6-0.1 0.9-0.2c0.3-0.1 0.7-0.2 1-0.3s0.7-0.2 1-0.3 0.6-0.2 0.8-0.3c0.4-0.1 0.8-0.3 1.2-0.4 0.2-0.1 0.4-0.2 0.6-0.2l1.5-0.6c0.1 0 0.2-0.1 0.3-0.1 5.3-2.4 10.3-5.9 14.4-10.6L668 581.1c16-17.6 14.3-44.8-3.3-60.3z'
									p-id='35096'
								></path>
							</svg>
							<span>
								{t('download', {
									ns: 'common',
								})}
							</span>
						</div>
					</saki-context-menu-item>
				)}
				<saki-context-menu-item
					width='200px'
					font-size='13px'
					padding='12px 10px'
					value='delete'
				>
					<div className='context-menu-item'>
						<svg
							className='icon'
							viewBox='0 0 1024 1024'
							version='1.1'
							xmlns='http://www.w3.org/2000/svg'
							p-id='6838'
						>
							<path
								d='M608 768c-17.696 0-32-14.304-32-32V384c0-17.696 14.304-32 32-32s32 14.304 32 32v352c0 17.696-14.304 32-32 32zM416 768c-17.696 0-32-14.304-32-32V384c0-17.696 14.304-32 32-32s32 14.304 32 32v352c0 17.696-14.304 32-32 32zM928 224H768v-64c0-52.928-42.72-96-95.264-96H352c-52.928 0-96 43.072-96 96v64H96c-17.696 0-32 14.304-32 32s14.304 32 32 32h832c17.696 0 32-14.304 32-32s-14.304-32-32-32z m-608-64c0-17.632 14.368-32 32-32h320.736C690.272 128 704 142.048 704 160v64H320v-64z'
								p-id='6839'
							></path>
							<path
								d='M736.128 960H288.064c-52.928 0-96-43.072-96-96V383.52c0-17.664 14.336-32 32-32s32 14.336 32 32V864c0 17.664 14.368 32 32 32h448.064c17.664 0 32-14.336 32-32V384.832c0-17.664 14.304-32 32-32s32 14.336 32 32V864c0 52.928-43.072 96-96 96z'
								p-id='6840'
							></path>
						</svg>
						<span>
							{t('delete', {
								ns: 'common',
							})}
						</span>
					</div>
				</saki-context-menu-item>
			</saki-context-menu>
		</div>
	)
}

export default NodeListComponent
