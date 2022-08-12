import React, { useEffect, useState } from 'react'
import { bindEvent } from '../modules/bindEvent'

import { useSelector, useDispatch } from 'react-redux'
import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	notesSlice,
	configSlice,
	userSlice,
} from '../store'
import './Login.scss'
import { api } from '../modules/electron/api'
import { useTranslation } from 'react-i18next'
import { prompt, alert } from '@saki-ui/core'
import { sakisso } from '../config'

const LoginComponent = () => {
	const { t, i18n } = useTranslation()
	const notes = useSelector((state: RootState) => state.notes)
	const appStatus = useSelector((state: RootState) => state.config.status)
	const config = useSelector((state: RootState) => state.config)

	const [noteContextMenuEl, setNoteContextMenuEl] = useState<any>()
	const [openDropDownMenu, setOpenDropDownMenu] = useState(false)
	const [openAddDropDownMenu, setOpenAddDropDownMenu] = useState(false)
	const [openSettingDropDownMenu, setOpenSettingDropDownMenu] = useState(false)
	const [openUserDropDownMenu, setOpenUserDropDownMenu] = useState(false)

	const dispatch = useDispatch<AppDispatch>()
	useEffect(() => {}, [])

	// setTimeout(() => {
	// 	store.dispatch(
	// 		configSlice.actions.setStatus({
	// 			type: 'loginModalStatus',
	// 			v: true,
	// 		})
	// 	)
	// }, 1000)
	return (
		<saki-modal
			max-width={config.deviceType === 'Mobile' ? 'auto' : '500px'}
			min-width={config.deviceType === 'Mobile' ? 'auto' : '400px'}
			max-height={config.deviceType === 'Mobile' ? 'auto' : '440px'}
			min-height={config.deviceType === 'Mobile' ? 'auto' : '400px'}
			width='100%'
			height='100%'
			border-radius={config.deviceType === 'Mobile' ? '0px' : ''}
			border={config.deviceType === 'Mobile' ? 'none' : ''}
			mask
			background-color='#fff'
			onClose={() => {
				store.dispatch(
					configSlice.actions.setStatus({
						type: 'loginModalStatus',
						v: false,
					})
				)
			}}
			visible={appStatus.loginModalStatus}
		>
			<div className='login-component'>
				<saki-modal-header
					ref={bindEvent({
						close: (e) => {
							store.dispatch(
								configSlice.actions.setStatus({
									type: 'loginModalStatus',
									v: false,
								})
							)
						},
					})}
					closeIcon
					title='Login'
				/>
				{appStatus.loginModalStatus ? (
					<saki-sso
						ref={bindEvent({
							login: (e) => {
								store.dispatch(
									userSlice.actions.login({
										token: e.detail.token,
										deviceId: e.detail.deviceId,
										userInfo: e.detail.userInfo,
									})
								)
								store.dispatch(
									configSlice.actions.setStatus({
										type: 'loginModalStatus',
										v: false,
									})
								)
							},
						})}
						style={{
							flex: 1,
						}}
						app-id={sakisso.appId}
						url={sakisso.clientUrl + '/login'}
					/>
				) : (
					''
				)}
			</div>
		</saki-modal>
	)
}

export default LoginComponent
