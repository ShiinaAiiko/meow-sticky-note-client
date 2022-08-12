import React, { useEffect, useRef, useState } from 'react'
import {
	RouterProps,
	useLocation,
	useNavigate,
	useSearchParams,
	useParams,
} from 'react-router-dom'
import logo from '../logo.svg'
import './Note.scss'
import { Helmet } from 'react-helmet-async'
import SideMenu from '../../components/SideMenu'
import {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	configSlice,
} from '../../store'
import { useSelector, useDispatch } from 'react-redux'
import { bindEvent } from '../../modules/bindEvent'
import { useTranslation } from 'react-i18next'
import { snackbar } from '@saki-ui/core'

import { Header } from '../../components'
import { api } from '../../modules/electron/api'
import { NoteItem } from '../../store/notes/typings'
import { ReaderRouterProps } from '../../modules/renderRoutes'
import CategoryList from '../../components/CategoryList'

let note: NoteItem

const NoteComponent = (props: ReaderRouterProps) => {
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

	const [note, setNote] = useState(notes.list?.filter((v) => v.id === nid)?.[0])

	useEffect(() => {
		const note = notes.list?.filter((v) => v.id === nid)?.[0]
		dispatch(
			configSlice.actions.setHeaderCenterTitle({
				title: note?.name || '',
				subtitle: '',
			})
		)
		setNote(note)
	}, [nid, notes])
	return (
		<>
			<Helmet>
				<title>
					{note?.name +
						' - ' +
						t('appTitle', {
							ns: 'common',
						})}
				</title>
			</Helmet>

			<div ref={props.nodeRef} className='mobile-note-page scrollBarHover'>
				<CategoryList
					onClick={(v) => {
						console.log('CategoryList vvvvv', v)
						history({
							pathname: '/m/c',
							search: '?nid=' + nid + '&cid=' + v.id,
						})
					}}
					list={note?.categories || []}
					noteId={nid}
				></CategoryList>
			</div>
		</>
	)
}

export default NoteComponent
