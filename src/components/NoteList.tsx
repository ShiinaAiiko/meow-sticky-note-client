import React, { useEffect, useRef, useState } from 'react'
import { RouterProps, useNavigate, Link } from 'react-router-dom'
import logo from '../logo.svg'
import './NoteList.scss'
import { Helmet } from 'react-helmet-async'
import SideMenu from '../components/SideMenu'
import {
	RootState,
	AppDispatch,
	useAppDispatch,
	notesSlice,
	methods,
} from '../store'
import { useSelector, useDispatch } from 'react-redux'
import { bindEvent } from '../modules/bindEvent'
import { useTranslation } from 'react-i18next'
import { snackbar, prompt, alert } from '@saki-ui/core'

import { Header } from '../components'
import { api } from '../modules/electron/api'
import { NoteItem } from '../store/notes/typings'
import { ReaderRouterProps } from '../modules/renderRoutes'

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
	const autoCloseWindowAfterCopy = useSelector(
		(state: RootState) => state.config.general.autoCloseWindowAfterCopy
	)
	const [noteContextMenuEl, setNoteContextMenuEl] = useState<any>()

	let history = useNavigate()
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
											noteContextMenuEl?.show({
												x: e.detail.pageX,
												y: e.detail.pageY,
												label: i.toString(),
											})
										},
									})}
									none-highlight-color
									padding='4px 18px'
									value={v.id}
								>
									<div className='note-item'>
										<span className='text-elipsis'>{v.name}</span>
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
				{/* <saki-drag-sort
					ref={bindEvent({
						dragdone: (e) => {
							// console.log(e.detail)
							dispatch(
								notesSlice.actions.sortNote({
									originalIndex: e.detail.originalIndex,
									targetIndex: e.detail.targetIndex,
								})
							)
						},
					})}
					padding='0px'
				>
					{notes.list?.map((v, i) => {
						return (
							<saki-drag-sort-item key={i}>
								<saki-menu-item
									ref={bindEvent({
										opencontextmenu: (e) => {
											console.log(e)
											noteContextMenuEl?.show({
												x: e.detail.pageX,
												y: e.detail.pageY,
												label: i.toString(),
											})
										},
									})}
									none-highlight-color
									key={i}
									padding='4px 18px'
									value={v.id}
								>
									<div className='note-item'>
										<span className='text-elipsis'>{v.name}</span>
									</div>
								</saki-menu-item>
							</saki-drag-sort-item>
						)
					})}

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
				</saki-drag-sort> */}
			</saki-menu>

			<saki-context-menu
				z-index='1000'
				ref={bindEvent(
					{
						selectvalue: async (e) => {
							onClose?.()
							const note = notes.list[Number(e.detail.label)]
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
					width='180px'
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
				<saki-context-menu-item
					width='180px'
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
