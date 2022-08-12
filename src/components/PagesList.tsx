import React, { useEffect, useRef, useState } from 'react'
import { RouterProps, useNavigate, useParams, Link } from 'react-router-dom'
import logo from '../logo.svg'
import './PagesList.scss'
import { Helmet } from 'react-helmet-async'
import SideMenu from '../components/SideMenu'
import {
	RootState,
	AppDispatch,
	useAppDispatch,
	notesSlice,
	methods,
	configSlice,
} from '../store'
import { useSelector, useDispatch } from 'react-redux'
import { bindEvent } from '../modules/bindEvent'
import { useTranslation } from 'react-i18next'
import { snackbar, prompt, alert } from '@saki-ui/core'

import { Header } from '../components'
import { api } from '../modules/electron/api'
import { CategoryItem, NoteItem, PageItem } from '../store/notes/typings'
import { ReaderRouterProps } from '../modules/renderRoutes'

const PagesListComponent = ({
	onClick,
	noteId,
	list,
	categoryId,
}: {
	noteId: string
	list: PageItem[]
	categoryId: string
	onClick: ({ id }: { id: string }) => void
}) => {
	const { t, i18n } = useTranslation()
	const dispatch = useDispatch<AppDispatch>()
	const notes = useSelector((state: RootState) => state.notes)
	const config = useSelector((state: RootState) => state.config)
	const autoCloseWindowAfterCopy = useSelector(
		(state: RootState) => state.config.general.autoCloseWindowAfterCopy
	)
	let history = useNavigate()
	const ref = useRef<any>(null)
	const [categoryContextMenuEl, setCategoryContextMenuEl] = useState<any>()
	const [pageContextMenuEl, setPageContextMenuEl] = useState<any>()

	// const [note, setNote] = useState(
	// 	notes.list?.filter((v) => v.id === noteId)?.[0]
	// )

	// useEffect(() => {
	// 	console.log('notes', '212121212', noteId)
	// 	const note = notes.list?.filter((v) => v.id === noteId)?.[0]
	// 	setNote(note)
	// 	onLoad?.({ note })
	// }, [noteId])

	return (
		<div className='pages-list-component'>
			<div className='page-subtitle'>
				{t('pages', {
					ns: 'common',
				})}
			</div>
			<saki-menu
				ref={bindEvent({
					selectvalue: async (e) => {
						// console.log(e.detail.value)
						dispatch(configSlice.actions.setDisableChangeValue(true))
						if (e.detail.value === 'addPage') {
							if (!noteId || !categoryId) {
								snackbar({
									message: t('categoryNotYetAdded', {
										ns: 'indexPage',
									}),
									vertical: 'top',
									horizontal: 'center',
									autoHideDuration: 2000,
									closeIcon: true,
								}).open()
								return
							}
							await dispatch(
								methods.notes.AddPage({
									noteId: noteId,
									categoryId: categoryId,
								})
							).unwrap()
							return
						}

						dispatch(
							notesSlice.actions.selectPage({
								id: e.detail.value,
							})
						)
						onClick({
							id: e.detail.value,
						})
						// setOpenDropDownMenu(false)
					},
				})}
				padding='0px'
			>
				<saki-drag-sort
					ref={bindEvent({
						dragdone: (e) => {
							// console.log(e.detail)
							dispatch(
								notesSlice.actions.sortPage({
									noteId: noteId,
									categoryId: categoryId,
									originalIndex: e.detail.originalIndex,
									targetIndex: e.detail.targetIndex,
								})
							)
						},
					})}
					padding='0px'
				>
					{list.map((v, i) => {
						return (
							<div key={v.id}>
								<saki-menu-item
									ref={bindEvent({
										opencontextmenu: (e) => {
											console.log(e)
											pageContextMenuEl?.show({
												x: e.detail.pageX,
												y: e.detail.pageY,
												label: i.toString(),
											})
										},
									})}
									key={i}
									active={v.id === notes.pageId}
									padding='4px 18px'
									value={v.id}
								>
									<div className='pl-item'>
										<span className='text-elipsis'>
											{v.title ||
												t('untitledPage', {
													ns: 'indexPage',
												})}
										</span>
									</div>
								</saki-menu-item>
							</div>
						)
					})}
				</saki-drag-sort>
				<saki-menu-item padding='4px 18px' value={'addPage'}>
					<div className={'pl-item text-elipsis add-page'}>
						<span className='text-elipsis'>
							{t('addPage', {
								ns: 'indexPage',
							})}
						</span>
					</div>
				</saki-menu-item>
			</saki-menu>

			<saki-context-menu
				ref={bindEvent(
					{
						selectvalue: async (e) => {
							const page = list[Number(e.detail.label)]
							switch (e.detail.value) {
								case 'delete':
									alert({
										title: t('delete', {
											ns: 'common',
										}),
										content: t('deleteThisPage', {
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
											dispatch(configSlice.actions.setDisableChangeValue(true))
											dispatch(
												notesSlice.actions.deletePage({
													noteId: noteId,
													categoryId: categoryId,
													pageId: page?.id,
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
						setPageContextMenuEl(e)
					}
				)}
			>
				<saki-context-menu-item
					width='140px'
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

export default PagesListComponent
