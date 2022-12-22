import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import './App.css'
import { RenderRoutes } from './modules/renderRoutes'
import routes from './routes'
import { Provider } from 'react-redux'
import { useParams, useLocation } from 'react-router-dom'
import qs from 'qs'
import { sakiui, networkTestUrl, origin, meowApps } from './config'
import axios from 'axios'
// NetworkStatus
import { Debounce, deepCopy } from '@nyanyajs/utils'
import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	notesSlice,
	storageSlice,
	appearanceSlice,
	configSlice,
} from './store'

import { useSelector, useDispatch } from 'react-redux'
import { config } from 'process'

export class NetworkStatus extends EventTarget {
	private networkTestUrl: string = ''
	public online = true
	constructor(options?: { testUrl: string }) {
		super()

		this.networkTestUrl = options?.testUrl || window.location.origin

		this.run(true)
	}
	private run(init: boolean) {
		setTimeout(
			async () => {
				try {
					const res = await axios({
						url: this.networkTestUrl,
						method: 'HEAD',
					})

					this.run(false)
					console.log('nsnsns', res, this)
					if (res.status !== 200) {
						if (!init && this.online) {
							this.online = false
							this.dispatchEvent(new Event('offline'))
						}
						return false
					}

					if (!init && !this.online) {
						this.online = true
						this.dispatchEvent(new Event('online'))
					}
					return true
				} catch (error) {
					console.log('nsnsns', error, this)
					if (!init && this.online) {
						this.online = false
						this.dispatchEvent(new Event('offline'))
					}
					this.run(false)
					return false
				}
			},
			init ? 0 : 5000
		)
	}
}

function App() {
	const params = useParams()
	const [debounce] = useState(new Debounce())
	// const location = useLocation()
	const isDev = process.env.NODE_ENV === 'development'
	let isElectron = !!(
		window &&
		window.process &&
		window.process.versions &&
		window.process.versions['electron']
	)
	// isElectron = true
	console.log('isElectron', isElectron)
	console.log('isDev', isDev)

	useEffect(() => {
		store.dispatch(storageSlice.actions.init(0))
		console.log('process.env.NODE_ENV', process.env.NODE_ENV)
		if (
			window &&
			window.process &&
			window.process.versions &&
			window.process.versions['electron']
		) {
			console.log(window.location)
			console.log('electronelectron', window.require('electron'))
		}

		if (isDev) {
			let currentKey: {
				[key: string]: string
			} = {}

			window.addEventListener('keydown', (e) => {
				console.log('keydown', e.key)
				if (e.key === 'r' || e.key === 'Control') {
					currentKey[e.key] = e.key
				}
				if (currentKey['r'] && currentKey['Control']) {
					window.location.reload()
					delete currentKey['r']
					delete currentKey['Control']
				}
			})
			window.addEventListener('keyup', (e) => {
				if (e.key === 'r' || e.key === 'Control') {
					delete currentKey[e.key]
				}
			})
		} else {
			// console.log = () => {}
		}

		window.addEventListener('resize', () => {
			store.dispatch(methods.config.getDeviceType())
		})
		window.addEventListener('load', () => {
			store.dispatch(methods.config.getDeviceType())
		})

		async function isOnline() {
			try {
				const res = await axios({
					url: networkTestUrl,
					method: 'HEAD',
				})
				if (res.status === 200) {
					return true
				} else {
					return false
				}
			} catch (error) {
				return false
			}
		}
	}, [])
	console.log('meowApps?.jsurl ', meowApps?.jsurl)
	return (
		<Provider store={store}>
			<HelmetProvider>
				<div className='App'>
					<Helmet>
						<script
							type='module'
							src={
								sakiui.esmjsurl.indexOf('http') === 0
									? sakiui.esmjsurl
									: origin + sakiui.esmjsurl
							}
						></script>
						<script
							noModule
							src={
								sakiui.jsurl.indexOf('http') === 0
									? sakiui.jsurl
									: origin + sakiui.jsurl
							}
						></script>
						{meowApps?.jsurl ? <></> : 'aaaaaaaaaaaaa'}

						<script
							type='module'
							src={
								meowApps?.esmjsurl?.indexOf('http') !== 0
									? origin + meowApps.esmjsurl
									: meowApps.esmjsurl
							}
						></script>

						<script
							noModule
							src={
								meowApps?.jsurl?.indexOf('http') !== 0
									? origin + meowApps.jsurl
									: meowApps.jsurl
							}
						></script>

						<title></title>
					</Helmet>
					<RenderRoutes
						routerType={isElectron && !isDev ? 'Hash' : 'History'}
						routes={routes}
					/>
				</div>
			</HelmetProvider>
		</Provider>
	)
}

export default App
