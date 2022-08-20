import React, { useEffect, useState } from 'react'
import { RouterProps, useLocation, useNavigate } from 'react-router-dom'
import './Index.scss'
import { Header, Drag, Settings, Login } from '../components'
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
const IndexLayout = ({ children }: RouterProps) => {
	const { t, i18n } = useTranslation()
	const dispatch = useDispatch<AppDispatch>()
	const [openSettingModal, setOpenSettingModal] = useState(false)
	// const [openSettingType, setOpenSettingType] = useState('')

	const appearance = useSelector((state: RootState) => state.appearance)
	const config = useSelector((state: RootState) => state.config)
	const notes = useSelector((state: RootState) => state.notes)

	const appStatus = useSelector((state: RootState) => state.config.status)
	const user = useSelector((state: RootState) => state.user)

	const [hideLoading, setHideLoading] = useState(false)
	const [loadProgressBar, setLoadProgressBar] = useState(false)
	const [progressBar, setProgressBar] = useState(0.01)

	const history = useNavigate()
	const location = useLocation()
	useEffect(() => {
		debounce.increase(() => {
			dispatch(methods.sso.Init()).unwrap()
			dispatch(methods.config.Init()).unwrap()

			dispatch(methods.user.Init()).unwrap()
			dispatch(methods.appearance.Init()).unwrap()
			createRouter()

			// console.log('config.deviceType getDeviceType', config)
		}, 50)

		// setTimeout(() => {
		// 	setOpenSettingModal(true)
		// }, 1000)
		// store.dispatch(storageSlice.actions.init())
	}, [])

	useEffect(() => {
		// console.log('监听同步开启了', config.deviceType)
		if (
			location.pathname === '/' ||
			location.pathname === '/m' ||
			location.pathname === '/m/n' ||
			location.pathname === '/m/c' ||
			location.pathname === '/m/p'
		) {
			switch (config.deviceType) {
				case 'Mobile':
					// console.log('切换至手机版？')
					history?.('/m', {
						replace: true,
					})

					break

				default:
					history?.('/', {
						replace: true,
					})
					break
			}
		}
	}, [config.deviceType])

	useEffect(() => {
		// console.log('监听同步开启了', notes.isInit, config.sync)
		if (config.sync && notes.isInit) {
			// console.log('监听同步开启了')
			dispatch(methods.notes.Init()).unwrap()
		}
	}, [config.sync])

	useEffect(() => {
		if (user.isInit) {
			progressBar < 1 &&
				setProgressBar(progressBar + 0.2 >= 1 ? 1 : progressBar + 0.2)
			dispatch(methods.notes.Init()).unwrap()
		}
		if (
			user.isLogin &&
			(location.pathname === '/' || location.pathname === '/m')
		) {
			dispatch(methods.nsocketio.Init()).unwrap()
		} else {
			client?.close?.()
		}
	}, [user.isInit, user.isLogin])

	useEffect(() => {
		if (
			appStatus.sakiUIInitStatus &&
			appStatus.noteInitStatus &&
			loadProgressBar &&
			user.isInit
		) {
			console.log('progressBar', progressBar)
			progressBar < 1 &&
				setTimeout(() => {
					console.log('progressBar', progressBar)
					setProgressBar(1)
				}, 500)
		}
		// console.log("progressBar",progressBar)
	}, [
		user.isInit,
		appStatus.noteInitStatus,
		appStatus.syncStatus,
		loadProgressBar,
		appStatus.sakiUIInitStatus,
	])

	return (
		<div className='index-layout'>
			<Login />
			<saki-init
				ref={bindEvent({
					mounted(e) {
						console.log('mounted', e)
						store.dispatch(
							configSlice.actions.setStatus({
								type: 'sakiUIInitStatus',
								v: true,
							})
						)
						// setProgressBar(progressBar + 0.2 >= 1 ? 1 : progressBar + 0.2)
						// setProgressBar(.6)
					},
				})}
			></saki-init>

			<div
				onTransitionEnd={() => {
					console.log('onTransitionEnd')
					// setHideLoading(true)
				}}
				className={
					'il-loading active ' +
					// (!(appStatus.noteInitStatus && appStatus.sakiUIInitStatus)
					// 	? 'active '
					// 	: '') +
					(hideLoading ? 'hide' : '')
				}
			>
				{/* <div className='loading-animation'></div>
				<div className='loading-name'>
					{t('appTitle', {
						ns: 'common',
					})}
				</div> */}
				<div className='loading-logo'>
					<img src='./logo192.png' alt='' />
				</div>
				{/* <div>progressBar, {progressBar}</div> */}
				<div className='loading-progress-bar'>
					<saki-linear-progress-bar
						ref={bindEvent({
							loaded: () => {
								console.log('progress-bar', progressBar)
								setProgressBar(0)
								setTimeout(() => {
									progressBar < 1 &&
										setProgressBar(
											progressBar + 0.2 >= 1 ? 1 : progressBar + 0.2
										)
								}, 0)
								setLoadProgressBar(true)
							},
							transitionEnd: (e: CustomEvent) => {
								console.log('progress-bar', e)
								if (e.detail === 1) {
									const el: HTMLDivElement | null =
										document.querySelector('.il-loading')
									if (el) {
										const animation = el.animate(
											[
												{
													opacity: 1,
												},
												{
													opacity: 0,
												},
											],
											{
												duration: 500,
												iterations: 1,
											}
										)
										animation.onfinish = () => {
											el.style.display = 'none'
											setHideLoading(true)
										}
									}
								}
							},
						})}
						max-width='280px'
						transition='width 1s'
						width='100%'
						height='10px'
						progress={progressBar}
						border-radius='5px'
					></saki-linear-progress-bar>
				</div>
			</div>

			<Header
				onSettings={(type: string) => {
					console.log('onSettings', type)
					// setOpenSettingType(type)
					store.dispatch(configSlice.actions.setSettingType(type))
					setOpenSettingModal(true)
				}}
			/>
			<div className='il-main'>{children}</div>

			<Settings
				visible={openSettingModal}
				// type={openSettingType}
				onClose={() => {
					setOpenSettingModal(false)
				}}
			/>
			<Drag></Drag>
		</div>
	)
}

export default IndexLayout
