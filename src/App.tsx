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
	// const location = useLocation();
	useEffect(() => {
		store.dispatch(storageSlice.actions.init())

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
						<script
							noModule
							src={sakiui.jsurl}
						></script>
						<title></title>
					</Helmet>
					{RenderRoutes(routes)}
				</div>
			</HelmetProvider>
		</Provider>
	)
}

export default App
