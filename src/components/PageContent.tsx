import React, { useEffect, useRef, useState } from 'react'
import { RouterProps, useNavigate, useParams, Link } from 'react-router-dom'
import logo from '../logo.svg'
import './PageContent.scss'
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
import { snackbar, prompt, alert, progressBar } from '@saki-ui/core'
import { SAaSS, file, images } from '@nyanyajs/utils'

import { Header } from '../components'
import { api } from '../modules/electron/api'
import * as http from '../modules/http/api'
import { CategoryItem, NoteItem, PageItem } from '../store/notes/typings'
import { ReaderRouterProps } from '../modules/renderRoutes'
import { resolve } from 'path'
import { rejects } from 'assert'
import { SyncOff } from './Icon'

let fileProgressBar = progressBar()
const PageContentComponent = ({
	// onClick,
	page,
	sync,
	noteId,
	categoryId,
}: {
	noteId: string
	categoryId: string
	sync: boolean
	page?: PageItem
	// onClick: ({ id }: { id: string }) => void
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
	const [richtextEl, setRichtextEl] = useState<any>()

	const [pageTitle, setPageTitle] = useState('')

	useEffect(() => {
		console.log('changepage', page)
		setPageTitle(page?.title || '')
		richtextEl?.getFocus?.().then((isFocus: boolean) => {
			console.log('isFocus', isFocus)
			if (!isFocus) {
				richtextEl?.initValue?.(page?.content)
			}
		})
	}, [page, notes.updateTime])

	const upload = (file: File) => {
		return new Promise((resolve, reject) => {
			const { getHash, uploadFile } = SAaSS
			let reader = new FileReader()
			reader.onload = async (e) => {
				if (!e.target?.result) return
				const hash = getHash(e.target.result)
				console.log('hash', hash)
				console.log('file', file)

				// lastModified: 1659813176641
				// lastModifiedDate: Sun Aug 07 2022 03:12:56 GMT+0800 (China Standard Time) {}
				// name: "PngItem_1211108.png"
				// size: 11202
				// type: "image/png"
				// webkitRelativePath: ""

				// string name = 1;
				// int64 size = 2;
				// string type = 3;
				// string Suffix = 4;
				// int64 LastModified = 5;
				// string Hash = 6;
				const res = await http.api.v1.getUploadToken({
					fileInfo: {
						name: file.name,
						size: file.size,
						type: file.type,
						suffix: '.' + file.name.substring(file.name.lastIndexOf('.') + 1),
						lastModified: file.lastModified,
						hash: hash,
					},
				})
				console.log('getUploadToken', res)
				if (res.code === 200) {
					//         apiUrl: "http://192.168.0.106:16100/api/v1/chunkupload/upload"
					// chunkSize: 262144
					// token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaWxlSW5mbyI6eyJBcHBJZCI6IjFlODE2OTE0LTY0ZDItNDc3YS04ZTM1LTQyN2Q5NDdlY2Y1MCIsIk5hbWUiOiJQbmdJdGVtXzEyMTExMDgucG5nIiwiRW5jcnlwdGlvbk5hbWUiOiI4NmZlYmJhNTdiY2NkOGExODNhMTkyZWM2OTRmNzUzNSIsIlBhdGgiOiIvRjA5MzVFNENENTkyMEFBNkM3Qzk5NkE1RUU1M0E3MEYvZmlsZXMvIiwiVGVtcEZvbGRlclBhdGgiOiIuL3N0YXRpYy9jaHVjay8wMzJhYzZhMjQ2ZWI3ZTUxZTM3Mzc3YzNhYmE4YjM2NzE1NGZiMTUxMDFhOTI3NzY2NDA0MDRlMDlhZjkwMGJkLyIsIlRlbXBDaHVja0ZvbGRlclBhdGgiOiIuL3N0YXRpYy9jaHVjay8wMzJhYzZhMjQ2ZWI3ZTUxZTM3Mzc3YzNhYmE4YjM2NzE1NGZiMTUxMDFhOTI3NzY2NDA0MDRlMDlhZjkwMGJkLy9jaHVjay8iLCJDaHVua1NpemUiOjEzMTA3MiwiQ3JlYXRlVGltZSI6MTY1OTg5NDkwNCwiRXhwaXJhdGlvblRpbWUiOi0xLCJWaXNpdENvdW50IjotMSwiRmlsZUluZm8iOnsiTmFtZSI6IlBuZ0l0ZW1fMTIxMTEwOCIsIlNpemUiOjExMjAyLCJUeXBlIjoiaW1hZ2UvcG5nIiwiU3VmZml4IjoiLnBuZyIsIkxhc3RNb2RpZmllZCI6MTY1OTgxMzE3NjY0MSwiSGFzaCI6IjAzMmFjNmEyNDZlYjdlNTFlMzczNzdjM2FiYThiMzY3MTU0ZmIxNTEwMWE5Mjc3NjY0MDQwNGUwOWFmOTAwYmQifSwiRmlsZUNvbmZsaWN0IjoiUmVwbGFjZSJ9LCJleHAiOjE2NTk5ODEzMDQsImlzcyI6InNhYXNzIn0.nfwmBNpJAMCK31U_vG4dL3mRvkhKb7EnaAqji29X9Hw"
					// uploadedOffset: []
					// urls: Urls
					// domainUrl: "http://192.168.0.106:16100"
					// encryptionUrl: "/s/86febba57bccd8a183a192ec694f7535"
					// url: "/s/F0935E4CD5920AA6C7
					const data: any = res.data
					if (data.token) {
						uploadFile({
							file: file,
							url: data.apiUrl,
							token: data.token,
							chunkSize: data.chunkSize,
							uploadedOffset: data.uploadedOffset || [],
							async onprogress(options) {
								console.log(options)

								// await store.state.storage.staticFileWS.getAndSet(
								// 	upload.data.urls?.encryptionUrl || '',
								// 	async (v) => {
								// 		return {
								// 			...v,
								// 			fileDataUrl: result || '',
								// 			uploadedSize: options.uploadedSize,
								// 			totalSize: options.totalSize,
								// 		}
								// 	}
								// )
							},
							async onsuccess(options) {
								console.log(options)
								resolve(data.urls?.domainUrl + data.urls?.encryptionUrl)
								// await store.state.storage.staticFileWS?.getAndSet(
								// 	upload.data.urls?.encryptionUrl || '',
								// 	async (v) => {
								// 		return {
								// 			...v,
								// 			fileDataUrl: result || '',
								// 			encryptionUrl: options.encryptionUrl,
								// 			url: options.url,
								// 			uploadedSize: file.size,
								// 			totalSize: file.size,
								// 		}
								// 	}
								// )
								// store.dispatch('chat/sendMessageWidthSecretChatApi', {
								// 	messageId,
								// 	dialogId,
								// })
							},
							onerror() {
								console.log('error')

								// store.dispatch('chat/failedToSendMessage', {
								// 	messageId,
								// 	dialogId,
								// })
							},
						})
					} else {
						resolve(data.urls?.domainUrl + data.urls?.encryptionUrl)
					}
				}
			}
			reader.readAsArrayBuffer(file)
		})
	}

	const uploadFile = async (type: 'Image' | 'Video') => {
		const { uploadFile, getHash } = SAaSS

		let imgInput = document.createElement('input')
		imgInput.type = 'file'
		imgInput.multiple = true
		switch (type) {
			case 'Image':
				// 目前暂时仅支持PNG和JPG
				imgInput.accept = 'image/*'
				break
			case 'Video':
				imgInput.accept = 'video/*'
				break
			// case 'File':
			// 	imgInput.accept = '*'
			// 	break

			default:
				break
		}
		let index = 0
		const up = async (files: FileList, index: number) => {
			try {
				if (index >= files.length) {
					fileProgressBar.setProgress({
						progress: 1,
						tipText: 'Uploaded successfully',
						onAnimationEnd() {
							fileProgressBar.close()
						},
					})
					return
				}

				const file = files[index]

				const resizeData = await images.resize(file, {
					maxPixel: 1920,
					quality: 0.7,
				})

				console.log('file', file)
				console.log('resizeData', resizeData)

				const res = await upload(resizeData.file)
				console.log('resizeData', res)
				if (res) {
					console.log(res)

					fileProgressBar.setProgress({
						progress: index + 1 / files.length,
						tipText: 'Uploading',
						onAnimationEnd() {
							fileProgressBar.close()
						},
					})

					index++

					richtextEl?.insetNode({
						type: type,
						src: res + config.saassConfig.parameters.imageResize.normal,
					})
					up(files, index)
				}
			} catch (error) {
				fileProgressBar.setProgress({
					progress: 1,
					tipText: 'Upload failed',
					onAnimationEnd() {
						fileProgressBar.close()
					},
				})
			}
		}
		imgInput.oninput = async (e) => {
			console.log(imgInput?.files)
			if (imgInput?.files?.length) {
				index = 0
				fileProgressBar.open()
				up(imgInput?.files, index)
			}
		}
		imgInput.click()
	}

	const changeTitle = async (title: string) => {
		setPageTitle(title)
		page?.id &&
			(await dispatch(
				methods.notes.UpdatePage({
					noteId: noteId,
					categoryId: categoryId,
					pageId: page?.id || '',
					data: {
						title: title,
					},
				})
			).unwrap())
	}
	return (
		<div className='page-content-component'>
			{page?.id ? (
				<>
					<div className='p-title'>
						<saki-input
							ref={bindEvent({
								clearvalue: async (e) => {
									// console.log('clearvalue', e)
									await dispatch(
										methods.notes.UpdatePage({
											noteId: noteId,
											categoryId: categoryId,
											pageId: page.id,
											data: {
												title: '',
											},
										})
									).unwrap()
								},
								changevalue: (e) => {
									if (
										!config.pageConfig.disableChangeValue &&
										page.title !== e.detail
									) {
										changeTitle(e.detail)
									}
								},
							})}
							height='56px'
							padding='0 0px'
							font-size='24px'
							value={pageTitle}
							placeholder={t('untitledPage', {
								ns: 'indexPage',
							})}
						/>
					</div>
					<div className='p-content scrollBarHover'>
						<saki-richtext
							ref={bindEvent(
								{
									clearvalue: (e) => {
										console.log('clearvalue', e)
									},
									handlers: (e) => {
										console.log('handlers', e)
										let el: any = e.target

										switch (e.detail.handler) {
											case 'Image':
												uploadFile('Image')
												// el?.insetNode({
												// 	type: 'Image',
												// 	src: 'http://localhost:16100/s/0d33575b32e77d7e5fce40746efe3ea6?x-saass-process=image/resize,160,70',
												// })
												// const getImg = await useOss({
												// 	num: 9,
												// 	type: 'Picture',
												// 	token: this.token,
												// 	userAgent: {
												// 		os: this.os,
												// 		browser: this.browser,
												// 		device: this.device,
												// 		deviceId: this.deviceId,
												// 	},
												// 	language: this.language,
												// })
												// getImg?.forEach((item: any) => {
												// 	this.quillEditor.insetNode({
												// 		type: 'Image',
												// 		src: item.url,
												// 	})
												// })

												break
											case 'Video':
												// const getVideo = await useOss({
												// 	num: 1,
												// 	type: 'Video',
												// 	token: this.token,
												// 	userAgent: {
												// 		os: this.os,
												// 		browser: this.browser,
												// 		device: this.device,
												// 		deviceId: this.deviceId,
												// 	},
												// 	language: this.language,
												// })
												// getVideo?.forEach((item: any) => {
												// 	this.quillEditor.insetNode({
												// 		type: 'Video',
												// 		src: item.url,
												// 	})
												// })

												break

											default:
												break
										}
									},
									changevalue: async (e) => {
										// console.log('eeee', e)
										// console.log(
										// 	'changevalue',
										// 	notes.list[notes.list.length - 1],
										// 	e.detail,
										// 	page,
										// 	page.id
										// )
										if (
											!config.pageConfig.disableChangeValue &&
											page.content !== e.detail.richText
										) {
											await dispatch(
												methods.notes.UpdatePage({
													noteId: noteId,
													categoryId: categoryId,
													pageId: page.id,
													data: {
														content: e.detail.richText,
													},
												})
											).unwrap()
										}
									},
									pressenter: (e) => {
										console.log('pressenter', e)
									},
								},
								(e) => {
									// console.log(e)
									setRichtextEl(e)
								}
							)}
							theme='snow'
							editor-padding='10px 20px 10px 20px'
							toolbar-padding='0 13px'
							font-size='14px'
							border-radius='0'
							min-length='0'
							max-length='10000'
							value={page?.content}
							placeholder={t('enterContent', {
								ns: 'indexPage',
							})}
						/>
					</div>
					<div className='p-data'>
						<div className='p-d-sync'>
							{sync ? (
								''
							) : (
								<SyncOff
									style={{
										width: '14px',
										height: '14px',
										transform: 'translateY(2px)',
									}}
								/>
							)}
						</div>
						<div className='p-d-words'>
							{page?.content?.replace(/<\/?.+?>/g, '').length}
						</div>
					</div>
				</>
			) : (
				''
			)}
		</div>
	)
}

export default PageContentComponent
