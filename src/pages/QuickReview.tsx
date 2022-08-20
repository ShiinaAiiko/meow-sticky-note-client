import React, { useEffect, useRef, useState } from 'react'
import { RouterProps } from 'react-router-dom'
import logo from '../logo.svg'
import './QuickReview.scss'
import { Helmet } from 'react-helmet-async'
import SideMenu from '../components/SideMenu'
import { RootState, AppDispatch, useAppDispatch, methods } from '../store'
import { useSelector, useDispatch } from 'react-redux'
import { bindEvent } from '../modules/bindEvent'
import { useTranslation } from 'react-i18next'
import { snackbar } from '@saki-ui/core'

import { Header } from '../components'
import { api } from '../modules/electron/api'
import { NoteItem } from '../store/notes/typings'

let note: NoteItem

const QuickReviewPage = (props: RouterProps) => {
	const { t, i18n } = useTranslation()
	const dispatch = useDispatch<AppDispatch>()
	const notes = useSelector((state: RootState) => state.notes)
	const config = useSelector((state: RootState) => state.config)
	const autoCloseWindowAfterCopy = useSelector(
		(state: RootState) => state.config.general.autoCloseWindowAfterCopy
	)
	const ref = useRef<any>(null)

	useEffect(() => {
		bindEvent(
			{
				selectvalue: async (e) => {
					try {
						switch (e.detail.value) {
							case 'copy':
								copy(JSON.parse(e.detail.label)?.content || '')
								break

							default:
								break
						}
					} catch (error) {
						console.log(error)
					}
				},
			},
			(e) => {
				const r: any = ref
				console.log(r)
				// r?.(e)
			}
		)(ref.current)
	}, [ref])

	const filterNote = () => {
		note =
			notes?.list.filter((v) => {
				return v.id === notes.quickReviewelect?.noteId
			})?.[0] || undefined
		return note
	}

	const copy = (content: string) => {
		content = content.replace(/<\/?.+?>/g, '')
		navigator.clipboard.writeText(content)

		// showNotification
		// api.showNotification

		switch (config.platform) {
			case 'Electron':
				api.showNotification({
					title: t('copySuccessfully', {
						ns: 'common',
					}),
					content: content,
					timeout: 3000,
				})
				autoCloseWindowAfterCopy && api.hideWindow()
				break
			case 'Web':
				snackbar({
					message: t('copySuccessfully', {
						ns: 'common',
					}),
					vertical: 'top',
					horizontal: 'center',
					autoHideDuration: 2000,
					closeIcon: true,
				}).open()
				break

			default:
				break
		}
	}

	return (
		<div className='quick-review-page'>
			<Helmet>
				<title>
					{t('pageTitle', {
						ns: 'quickReviewPage',
					})}
				</title>
			</Helmet>
			<div className='qc-main'>
				<div className='qc-m-top'>
					<saki-tabs
						// header-background-color='rgb(245, 245, 245)'
						header-padding='0 10px'
						ref={bindEvent({
							tap: (e) => {
								// console.log('tap', e)
								// setOpenDropDownMenu(false)
							},
						})}
					>
						{note?.categories?.map((v, i) => {
							return (
								<saki-tabs-item key={i} font-size='14px' name={v.name}>
									<saki-scroll-view mode='Auto'>
										<div className='qc-m-t-main'>
											{v?.data.map((sv, si) => {
												return (
													<div
														key={si}
														title='copy'
														onContextMenu={(e) => {
															ref?.current?.show({
																x: e.pageX,
																y: e.pageY,
																label: JSON.stringify(sv),
															})
															e.preventDefault()
														}}
														onClick={() => {
															copy(sv.content || '')
														}}
														className='qc-m-t-m-item'
													>
														<span className='item-name'>
															{sv.title ||
																t('untitledPage', {
																	ns: 'indexPage',
																})}
														</span>

														<svg
															className='item-copy-icon'
															viewBox='0 0 1024 1024'
															version='1.1'
															xmlns='http://www.w3.org/2000/svg'
															p-id='10364'
														>
															<path
																d='M262.016 262.016m170.666667 0l335.317333 0q170.666667 0 170.666667 170.666667l0 335.317333q0 170.666667-170.666667 170.666667l-335.317333 0q-170.666667 0-170.666667-170.666667l0-335.317333q0-170.666667 170.666667-170.666667Z'
																p-id='10365'
															></path>
															<path
																d='M298.666667 170.666667a128 128 0 0 0-128 128v318.037333a42.666667 42.666667 0 0 1-42.666667 42.666667 42.666667 42.666667 0 0 1-42.666667-42.666667V298.666667a213.333333 213.333333 0 0 1 213.333334-213.333334h317.994666a42.666667 42.666667 0 0 1 42.666667 42.666667 42.666667 42.666667 0 0 1-42.666667 42.666667z'
																p-id='10366'
															></path>
														</svg>
													</div>
												)
											})}
										</div>
									</saki-scroll-view>
								</saki-tabs-item>
							)
						})}
					</saki-tabs>
				</div>
			</div>
			{!filterNote()?.categories?.length ? (
				<div className='qc-blank-page'>
					<div>
						<saki-button
							ref={bindEvent({
								tap: (e) => {
									api.openMainProgram()
								},
							})}
							type='Primary'
							padding='8px 10px'
						>
							{t('addCategory', {
								ns: 'indexPage',
							})}
						</saki-button>
						{/* <saki-button
						ref={bindEvent({
							tap: async (e) => {
								if (!notes.noteId) {
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
							},
						})}
						type='Primary'
						padding='8px 10px'
					>
						{t('addCategory', {
							ns: 'indexPage',
						})}
					</saki-button> */}
					</div>
				</div>
			) : (
				''
			)}
			<saki-context-menu ref={ref}>
				<saki-context-menu-item
					width='120px'
					font-size='13px'
					padding='12px 10px'
					value='copy'
				>
					<div className='context-menu-item'>
						<svg
							className='icon'
							viewBox='0 0 1024 1024'
							version='1.1'
							xmlns='http://www.w3.org/2000/svg'
							p-id='2426'
							width='200'
							height='200'
						>
							<path
								d='M768 682.666667V170.666667a85.333333 85.333333 0 0 0-85.333333-85.333334H170.666667a85.333333 85.333333 0 0 0-85.333334 85.333334v512a85.333333 85.333333 0 0 0 85.333334 85.333333h512a85.333333 85.333333 0 0 0 85.333333-85.333333zM170.666667 170.666667h512v512H170.666667z m682.666666 85.333333v512a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 0 85.333333 85.333334h426.666667a170.666667 170.666667 0 0 0 170.666667-170.666667V341.333333a85.333333 85.333333 0 0 0-85.333334-85.333333z'
								p-id='2427'
							></path>
						</svg>
						<span>
							{t('copy', {
								ns: 'common',
							})}
						</span>
					</div>
				</saki-context-menu-item>
			</saki-context-menu>
		</div>
	)
}

export default QuickReviewPage
