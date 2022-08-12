import React, { useEffect, useRef, useState } from 'react'
import {
	RouterProps,
	useNavigate,
	useSearchParams,
	Link,
} from 'react-router-dom'
import logo from '../logo.svg'
import './Pages.scss'
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
import { NoteItem, PageItem } from '../../store/notes/typings'
import { ReaderRouterProps } from '../../modules/renderRoutes'
import PagesList from '../../components/PagesList'

const PagesListPage = (props: ReaderRouterProps) => {
	const { t, i18n } = useTranslation()
	const dispatch = useDispatch<AppDispatch>()
	const notes = useSelector((state: RootState) => state.notes)
	const config = useSelector((state: RootState) => state.config)
	const autoCloseWindowAfterCopy = useSelector(
		(state: RootState) => state.config.general.autoCloseWindowAfterCopy
	)
	const ref = useRef<any>(null)
	let history = useNavigate()
	const [searchParams] = useSearchParams()
	let nid = searchParams.get('nid') || ''
	let cid = searchParams.get('cid') || ''

	const [pages, setPages] = useState<PageItem[]>([])
	const [pageTitle, setPageTitle] = useState('')

	useEffect(() => {
		// console.log('notes', '212121212', noteId)
		const note = notes?.list?.filter((v) => v.id === nid)?.[0]
		const category = note?.categories?.filter((v) => v.id === cid)?.[0]

		dispatch(
			configSlice.actions.setHeaderCenterTitle({
				title: note?.name || '',
				subtitle: category?.name || '',
			})
		)
		setPageTitle(
			category?.name +
				' - ' +
				note?.name +
				' - ' +
				t('appTitle', {
					ns: 'common',
				})
		)
		setPages(category?.data || [])
	}, [nid, cid, notes])
	return (
		<>
			<Helmet>
				<title>{pageTitle}</title>
			</Helmet>
			<div className='mobile-page-content-page scrollBarHover'>
				<PagesList
					list={pages}
					onClick={(v) => {
						console.log('PagesList vvvvv', v)
						history({
							pathname: '/m/p',
							search: '?nid=' + nid + '&cid=' + cid + '&pid=' + v.id,
						})
					}}
					noteId={nid}
					categoryId={cid}
				></PagesList>
			</div>
		</>
	)
}

export default PagesListPage
