import React, { useEffect, useState } from 'react'
import {
	RouterProps,
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router-dom'
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
	userSlice,
} from '../store'
import { useSelector, useDispatch } from 'react-redux'
import { createRouter } from '../modules/electron/router'
import { client } from '../store/nsocketio'
import { NoteItem } from '../store/notes/typings'
import { alert } from '@saki-ui/core'

const IndexLayout = ({ children }: RouterProps) => {
	const [debounce] = useState(new Debounce())
	const [getRemoteDataDebounce] = useState(new Debounce())
	const { t, i18n } = useTranslation()
	const dispatch = useDispatch<AppDispatch>()
	const [openSettingModal, setOpenSettingModal] = useState(false)
	// const [openSettingType, setOpenSettingType] = useState('')

	const nsocketio = useSelector((state: RootState) => state.nsocketio)
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
	const [params] = useSearchParams()

	useEffect(() => {
		debounce.increase(() => {
			dispatch(methods.sso.Init()).unwrap()
			dispatch(methods.config.Init()).unwrap()
			dispatch(methods.user.Init()).unwrap()

			dispatch(methods.appearance.Init()).unwrap()
			dispatch(methods.notes.Init())
			dispatch(methods.notes.GetLocalData())

			createRouter()

			// console.log('config.deviceType getDeviceType', config)
		}, 50)

		// setTimeout(() => {
		// 	setOpenSettingModal(true)
		// }, 1000)
		// store.dispatch(storageSlice.actions.init())
	}, [])

	// useEffect(() => {
	// 	// if (!config.networkStatus) {
	// 	// 	dispatch(userSlice.actions.setInit(false))
	// 	// }
	// 	if (config.networkStatus && notes.isInit) {
	// 		dispatch(methods.user.Init()).unwrap()
	// 	}
	// }, [config.networkStatus])

	useEffect(() => {
		// console.log('?????????????????????', config.deviceType)
		let routePath = location.pathname

		// if (window.location.origin === 'file://') {
		// 	routePath = location.hash
		// }
		console.log(
			'---location.pathname',
			location,
			window.location
			// location.hash,
			// routePath,
			// params.get('route'),
			// location.pathname,

			// routePath === '/' ||
			// 	routePath === '/m' ||
			// 	routePath === '/m/n' ||
			// 	routePath === '/m/c' ||
			// 	routePath === '/m/p'
		)

		// route

		if (
			config.deviceType &&
			(routePath === '/' ||
				routePath === '/m' ||
				routePath === '/m/n' ||
				routePath === '/m/c' ||
				routePath === '/m/p')
		) {
			switch (config.deviceType) {
				case 'Mobile':
					// console.log('?????????????????????')
					if (routePath === '/') {
						history?.('/m' + location.search, {
							replace: true,
						})
					}

					break

				default:
					history?.('/' + location.search, {
						replace: true,
					})
					break
			}
		}
	}, [config.deviceType])

	// useEffect(() => {
	// 	// console.log('?????????????????????', notes.isInit, config.sync)
	// 	if (config.sync && user.isLogin && notes.isInit) {
	// 		console.log('?????????????????????')
	// 		dispatch(methods.notes.GetRemoteData()).unwrap()
	// 	}
	// }, [config.sync])

	useEffect(() => {
		console.log('nsocketio.status', nsocketio.status)
		if (
			nsocketio.status === 'success' &&
			user.isInit &&
			user.isLogin &&
			notes.isInit &&
			config.sync &&
			(location.pathname === '/' || location.pathname.indexOf('/m') === 0)
		) {
			getRemoteDataDebounce.increase(() => {
				dispatch(methods.notes.GetRemoteData()).unwrap()
			}, 300)
		}
	}, [nsocketio.status, user.isInit, user.isLogin, notes.isInit, config.sync])

	useEffect(() => {
		if (user.isInit) {
			progressBar < 1 &&
				setProgressBar(progressBar + 0.2 >= 1 ? 1 : progressBar + 0.2)
		}
		if (
			user.isInit &&
			user.isLogin &&
			(location.pathname === '/' || location.pathname.indexOf('/m') === 0)
		) {
			dispatch(methods.nsocketio.Init()).unwrap()
		} else {
			dispatch(methods.nsocketio.Close()).unwrap()
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
						store.dispatch(methods.config.getDeviceType())
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
					<img src={config.origin + '/logo192.png'} alt='' />
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
			{nsocketio.status !== 'success' &&
			user.token &&
			config.deviceType === 'Mobile' ? (
				<div className='il-connection-error'>
					<div className='circle-loading'></div>
					<span
						style={{
							color: '#555',
						}}
					>
						{t('connecting', {
							ns: 'common',
						})}
					</span>
				</div>
			) : (
				''
			)}
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
