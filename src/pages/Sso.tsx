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
import './Sso.scss'
import { api } from '../modules/electron/api'
import { useTranslation } from 'react-i18next'
import { prompt, alert } from '@saki-ui/core'

const SSOPage = () => {
	const { t, i18n } = useTranslation()
	const notes = useSelector((state: RootState) => state.notes)
	const appStatus = useSelector((state: RootState) => state.config.status)

	const [noteContextMenuEl, setNoteContextMenuEl] = useState<any>()
	const [openDropDownMenu, setOpenDropDownMenu] = useState(false)
	const [openAddDropDownMenu, setOpenAddDropDownMenu] = useState(false)
	const [openSettingDropDownMenu, setOpenSettingDropDownMenu] = useState(false)
	const [openUserDropDownMenu, setOpenUserDropDownMenu] = useState(false)

	const dispatch = useDispatch<AppDispatch>()
	useEffect(() => {}, [])

	return (
		<div className='sso-page'>
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
					width: '100%',
					height: '384px',
				}}
				app-id='a-tbzkhXT-uGkLXv-oU-nvS-tbzkg2K'
				url='http://localhost:23161/login'
			/>
		</div>
	)
}

export default SSOPage
