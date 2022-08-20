import React, { useEffect, useRef, useState } from 'react'
import { RouterProps, useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../logo.svg'
import './PageContent.scss'
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
import PageContent from '../../components/PageContent'

let note: NoteItem

const PageContentPage = (props: ReaderRouterProps) => {
	const { t, i18n } = useTranslation()
	const dispatch = useDispatch<AppDispatch>()
	const notes = useSelector((state: RootState) => state.notes)
	const config = useSelector((state: RootState) => state.config)
	const user = useSelector((state: RootState) => state.user)
	const autoCloseWindowAfterCopy = useSelector(
		(state: RootState) => state.config.general.autoCloseWindowAfterCopy
	)
	const ref = useRef<any>(null)
	let history = useNavigate()
	const [searchParams] = useSearchParams()
	let nid = searchParams.get('nid') || ''
	let cid = searchParams.get('cid') || ''
	let pid = searchParams.get('pid') || ''

	const [page, setPage] = useState<PageItem>()
	const [note, setNote] = useState<NoteItem>()
	const [pageTitle, setPageTitle] = useState('')
	useEffect(() => {
		// console.log('notes', '212121212', noteId)
		const note = notes?.list?.filter((v) => v.id === nid)?.[0]
		const category = note?.categories?.filter((v) => v.id === cid)?.[0]
		const page = category?.data?.filter((v) => v.id === pid)?.[0]

		dispatch(
			configSlice.actions.setHeaderCenterTitle({
				title: ' ',
				subtitle: '',
			})
		)
		setPageTitle(
			(page?.title ||
				t('untitledPage', {
					ns: 'indexPage',
				})) +
				' - ' +
				category?.name +
				' - ' +
				note?.name +
				' - ' +
				t('appTitle', {
					ns: 'common',
				})
		)
		setNote(note)
		setPage(page)
	}, [nid, cid, pid, notes])

	return (
		<>
			<Helmet>
				<title>{pageTitle}</title>
			</Helmet>
			<div ref={props.nodeRef} className='mobile-page-content-page'>
				<PageContent
					noteId={nid}
					categoryId={cid}
					page={page}
					sync={!!note && note?.isSync && note?.authorId === user.userInfo.uid}
				></PageContent>
			</div>
		</>
	)
}

export default PageContentPage
