import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import './App.css'
import { RenderRoutes } from './modules/renderRoutes'
import routes from './routes'
import { Provider } from 'react-redux'
import { useParams, useLocation } from 'react-router-dom'
import qs from 'qs'
import { sakiui } from './config'

import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	notesSlice,
	storageSlice,
	appearanceSlice,
} from './store'
import { useSelector, useDispatch } from 'react-redux'

function App() {
	const params = useParams()
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
		}

		window.addEventListener('resize', () => {
			store.dispatch(methods.config.getDeviceType())
		})
	}, [])

	return (
		<Provider store={store}>
			<HelmetProvider>
				<div className='App'>
					<Helmet>
						<script type='module' src={sakiui.esmjsurl}></script>
						<script noModule src={sakiui.jsurl}></script>
						<title></title>
					</Helmet>
					<RenderRoutes
						routerType={isElectron ? 'Hash' : 'History'}
						routes={routes}
					/>
				</div>
			</HelmetProvider>
		</Provider>
	)
}

export default App
