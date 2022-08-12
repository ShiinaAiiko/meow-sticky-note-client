import React, { useEffect, useRef, useState } from 'react'
import { RouterProps, useNavigate, useParams, Link } from 'react-router-dom'
import logo from '../logo.svg'
import './Index.scss'
import { Helmet } from 'react-helmet-async'
import SideMenu from '../../components/SideMenu'
import {
	RootState,
	AppDispatch,
	configSlice,
	useAppDispatch,
	methods,
} from '../../store'
import { useSelector, useDispatch } from 'react-redux'
import { bindEvent } from '../../modules/bindEvent'
import { useTranslation } from 'react-i18next'
import { snackbar } from '@saki-ui/core'

import { Header } from '../../components'
import { api } from '../../modules/electron/api'
import { NoteItem } from '../../store/notes/typings'
import { ReaderRouterProps } from '../../modules/renderRoutes'
import NodeList from '../../components/NoteList'

let note: NoteItem

const IndexPage = (props: ReaderRouterProps) => {
	const { t, i18n } = useTranslation()
	const dispatch = useDispatch<AppDispatch>()
	const notes = useSelector((state: RootState) => state.notes)
	const config = useSelector((state: RootState) => state.config)
	const autoCloseWindowAfterCopy = useSelector(
		(state: RootState) => state.config.general.autoCloseWindowAfterCopy
	)
	let history = useNavigate()
	const ref = useRef<any>(null)

	useEffect(() => {
		dispatch(
			configSlice.actions.setHeaderCenterTitle({
				title: ' ',
				subtitle: '',
			})
		)
	}, [])

	return (
		<>
			<Helmet>
				<title>
					{t('appTitle', {
						ns: 'common',
					})}
				</title>
			</Helmet>
			<div ref={props.nodeRef} className='mobile-index-page scrollBarHover'>
				<NodeList
					onClick={(v) => {
						// console.log('id', v)

						// history('//m/categories', {
						// 	query: {
						// 		id: v.id,
						// 	},
						// })
						if (!v?.id) return
						history({
							pathname: '/m/n',
							search: '?nid=' + v.id,
						})
					}}
				></NodeList>
			</div>
		</>
	)
}

export default IndexPage
