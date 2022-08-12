import React, { useEffect, useRef, useState } from 'react'
import { RouterProps, useNavigate, useParams, Link } from 'react-router-dom'
import logo from '../logo.svg'
import './CategoryList.scss'
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
import { CategoryItem, NoteItem } from '../store/notes/typings'
import { ReaderRouterProps } from '../modules/renderRoutes'

const CategoryListComponent = ({
	onClick,
	list,
	noteId,
}: {
	noteId: string
	list: CategoryItem[]
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
	// console.log('list CategoryListComponent', list)
	return (
		<div className='category-list-component'>
			<div className='page-subtitle'>
				{t('categories', {
					ns: 'common',
				})}
			</div>
			<saki-menu
				ref={bindEvent({
					selectvalue: async (e) => {
						// console.log(e.detail.value)
						if (e.detail.value === 'addCategory') {
							if (!noteId) {
								snackbar({
									message: t('noteNotYetAdded', {
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
								methods.notes.AddCategory({
									noteId: notes.noteId,
								})
							).unwrap()
							return
						}
						dispatch(
							notesSlice.actions.selectCategory({
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
								notesSlice.actions.sortCategory({
									noteId: notes.noteId,
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
											categoryContextMenuEl?.show({
												x: e.detail.pageX,
												y: e.detail.pageY,
												label: i.toString(),
											})
										},
									})}
									key={i}
									active={v.id === notes.categoryId}
									padding='4px 18px'
									value={v.id}
								>
									<div className='cl-item'>
										<span className='text-elipsis'>{v.name}</span>
									</div>
								</saki-menu-item>
							</div>
						)
					})}
				</saki-drag-sort>
				<saki-menu-item padding='4px 18px' value={'addCategory'}>
					<div className={'cl-item text-elipsis add-category'}>
						<span className='text-elipsis'>
							{t('addCategory', {
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
							const category = list[Number(e.detail.label)]
							switch (e.detail.value) {
								case 'rename':
									let name = ''
									prompt({
										title: t('rename', {
											ns: 'common',
										}),
										value: category.name,
										placeholder: t('categoryName', {
											ns: 'indexPage',
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
													message: t('categoryNameNil', {
														ns: 'indexPage',
													}),
													vertical: 'top',
													horizontal: 'center',
													autoHideDuration: 2000,
													closeIcon: true,
												}).open()
												return
											}
											dispatch(
												notesSlice.actions.updateCategory({
													noteId: noteId,
													categoryId: category.id,
													category: {
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
										content: t('deleteThisCategory', {
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
												notesSlice.actions.deleteCategory({
													noteId: noteId,
													categoryId: category.id,
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
						setCategoryContextMenuEl(e)
					}
				)}
			>
				<saki-context-menu-item
					width='140px'
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
							p-id='3909'
						>
							<path
								d='M832 928H192c-52.8 0-96-43.2-96-96V192c0-52.8 43.2-96 96-96h320c17.6 0 32 14.4 32 32s-14.4 32-32 32H192c-17.6 0-32 14.4-32 32v640c0 17.6 14.4 32 32 32h640c17.6 0 32-14.4 32-32V512c0-17.6 14.4-32 32-32s32 14.4 32 32v320c0 52.8-43.2 96-96 96z'
								p-id='3910'
							></path>
							<path
								d='M404.8 603.2c-12.8-12.8-12.8-33.6 0-44.8L844.8 118.4c12.8-12.8 33.6-12.8 44.8 0 12.8 12.8 12.8 33.6 0 44.8L451.2 603.2c-12.8 12.8-33.6 12.8-46.4 0z'
								p-id='3911'
							></path>
						</svg>
						<span>
							{t('rename', {
								ns: 'common',
							})}
						</span>
					</div>
				</saki-context-menu-item>
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

export default CategoryListComponent
