import React, { useEffect, useState } from 'react'
import { RouterProps, useLocation, useNavigate } from 'react-router-dom'
import './Drag.scss'
import { Header, Settings, Login } from '../components'
import { bindEvent } from '../modules/bindEvent'

import { useTranslation } from 'react-i18next'
import { Debounce, deepCopy } from '@nyanyajs/utils'
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid'

import { api } from '../modules/http/api'

import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	notesSlice,
	storageSlice,
	configSlice,
} from '../store'
import { useSelector, useDispatch } from 'react-redux'
import { createRouter } from '../modules/electron/router'
import { client } from '../store/nsocketio'
import { NoteItem } from '../store/notes/typings'
import { alert } from '@saki-ui/core'

const debounce = new Debounce()
let timer: NodeJS.Timeout
const DragComponent = () => {
	const { t, i18n } = useTranslation()
	const [showModal, setShowModal] = useState(false)
	const createDragEvent = () => {
		const el = document.body
		console.log('el', el)
		if (!el) return
		el.addEventListener('dragover', (e) => {
			e.stopPropagation()
			e.preventDefault()
			timer && clearTimeout(timer)
			setShowModal(true)
		})
		el.addEventListener('dragleave', (e) => {
			e.stopPropagation()
			e.preventDefault()
		})
		el.addEventListener('drop', (e: any) => {
			e.stopPropagation()
			e.preventDefault()
			setShowModal(false)
			const ele: HTMLDivElement = e.target
			if (ele?.classList.contains('drag-main')) {
				if (e.dataTransfer.items) {
					let items = new Array(...e.dataTransfer.items)
					for (let index = 0; index < items.length; index++) {
						let e = items[index]
						let item = null
						if (e.webkitGetAsEntry) {
							item = e.webkitGetAsEntry()
						} else if (e.getAsEntry) {
							item = e.getAsEntry()
						} else {
							console.error('浏览器不支持拖拽上传')
							return
						}
						if (item.isFile) {
							item.file((file: File) => {
								console.log(file)

								const fileReader = new FileReader()
								fileReader.onload = (e) => {
									try {
										if (!e.target?.result) return
										const data = String(e.target?.result)
										console.log(JSON.parse(data))
										const note: NoteItem = JSON.parse(data)

										if (note?.id) {
											let isExist = false
											const { notes, user } = store.getState()
											notes.list.some((v) => {
												console.log(v.id, note.id)
												if (v.id === note.id) {
													isExist = true
													return true
												}
											})
											if (!isExist) {
												store.dispatch(
													notesSlice.actions.addNote({
														v: {
															...note,
															isSync: false,
														},
														disableSync: true,
													})
												)
											} else {
												alert({
													title: '导入笔记',
													content: '确定导入?',
													cancelText: 'Cancel',
													confirmText: 'Next',
													onCancel() {},
													onConfirm() {
														alert({
															title: '导入笔记',
															content: '检测到已导入同一个笔记,是否覆盖?',
															cancelText: 'Add',
															confirmText: 'Replace',
															onCancel() {
																store.dispatch(
																	notesSlice.actions.addNote({
																		v: {
																			...note,
																			id: uuidv5(note.name, uuidv4()),
																			authorId: user.userInfo.uid,
																			isSync: false,
																		},
																		disableSync: true,
																	})
																)
															},
															onConfirm() {
																store.dispatch(
																	notesSlice.actions.addNote({
																		v: {
																			...note,
																			isSync: false,
																		},
																		disableSync: true,
																	})
																)
															},
														}).open()
													},
												}).open()
											}
										}
									} catch (error) {
										console.error(error)
									}
								}
								fileReader.readAsText(file)
							})
						}
					}
				}
			}
		})
	}
	useEffect(() => {
		debounce.increase(() => {
			createDragEvent()
		}, 50)
	}, [])

	return (
		<saki-modal
			width='100%'
			height='100%'
			max-width='300px'
			max-height='200px'
			visible={showModal}
		>
			<div className='drag-component'>
				<div data-methods='drag' className='drag-main'>
					拖拽区域
				</div>
			</div>
		</saki-modal>
	)
}

export default DragComponent
