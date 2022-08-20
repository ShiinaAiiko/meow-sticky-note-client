import React, { useEffect, useState } from 'react'
import { RouterProps } from 'react-router-dom'
import logo from '../logo.svg'
import { Helmet } from 'react-helmet-async'
import './Index.scss'
import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	notesSlice,
	configSlice,
} from '../store'
import { useSelector, useDispatch } from 'react-redux'

import { prompt, alert, snackbar, bindEvent } from '@saki-ui/core'
import { useTranslation } from 'react-i18next'
import { deepCopy } from '@nyanyajs/utils'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { eventTarget } from '../store/config'
import CategoryList from '../components/CategoryList'
import PagesList from '../components/PagesList'
import PageContent from '../components/PageContent'

const IndexPage = (props: RouterProps) => {
	const { t, i18n } = useTranslation('indexPage')
	const notes = useSelector((state: RootState) => state.notes)
	const config = useSelector((state: RootState) => state.config)
	const user = useSelector((state: RootState) => state.user)
	const [richtextEl, setRichtextEl] = useState<any>()
	const [categoryContextMenuEl, setCategoryContextMenuEl] = useState<any>()
	const [pageContextMenuEl, setPageContextMenuEl] = useState<any>()

	const [activeNotes, setActiveNotes] = useState(
		notes.list.filter((v) => {
			return v.id === notes.noteId
		})?.[0]
	)
	const [activeCategory, setActiveCategory] = useState(
		activeNotes?.categories.filter((v) => {
			return v.id === notes.categoryId
		})?.[0]
	)
	const [activePage, setActivePage] = useState(
		activeCategory?.data.filter((v) => {
			return v.id === notes.pageId
		})?.[0]
	)

	const [pageConfig, setPageConfig] = useState({
		showCategoryListPage: true,
		showPageListPage: false,
		showPageContentPage: false,
	})

	const dispatch = useDispatch<AppDispatch>()

	const back = () => {
		switch (config.deviceType) {
			case 'Mobile':
				if (pageConfig.showPageContentPage) {
					setPageConfig({
						showCategoryListPage: true,
						showPageListPage: true,
						showPageContentPage: false,
					})
					return
				}
				if (pageConfig.showPageListPage) {
					setPageConfig({
						showCategoryListPage: true,
						showPageListPage: false,
						showPageContentPage: false,
					})
					return
				}
				break

			default:
				break
		}
	}

	useEffect(() => {
		// console.log(notes)
		eventTarget.addEventListener('back', () => {
			console.log('back')
			back()
		})

		dispatch(
			configSlice.actions.setHeaderCenterTitle({
				title: '',
				subtitle: '',
			})
		)
	}, [])

	useEffect(() => {
		const an = notes.list.filter((v) => {
			return v.id === notes.noteId
		})?.[0]
		setActiveNotes(an)
		const ac = an?.categories.filter((v) => {
			return v.id === notes.categoryId
		})?.[0]
		setActiveCategory(ac)
		setActivePage(
			ac?.data.filter((v) => {
				return v.id === notes.pageId
			})?.[0]
		)
	}, [notes, notes.noteId, notes.categoryId, notes.pageId, notes.updateTime])

	useEffect(() => {
		if (notes.mustUpdate) {
			richtextEl?.init?.()
			return
		}
		richtextEl?.getFocus?.().then((isFocus: boolean) => {
			console.log('isFocus', isFocus)
			if (!isFocus) {
				richtextEl?.init?.()
			}
		})
	}, [notes.pageId, notes.updateTime])

	const categoryListRef = React.useRef<HTMLDivElement>(null)
	const pageListRef = React.useRef<HTMLDivElement>(null)
	const pageContentRef = React.useRef<HTMLDivElement>(null)

	useEffect(() => {
		console.log('pageConfig', pageConfig, categoryListRef)
		// if (pageConfig.categoryList) {
		// } else {
		// }
	}, [pageConfig])

	useEffect(() => {
		console.log('pageConfig', pageConfig, categoryListRef)
		// if (pageConfig.categoryList) {
		// } else {
		// }
		if (config.deviceType !== 'Mobile') {
			dispatch(configSlice.actions.setLayoutBackIcon(false))
		}
	}, [config.deviceType])

	return (
		<>
			<Helmet>
				<title>
					{t('appTitle', {
						ns: 'common',
					})}
				</title>
			</Helmet>

			<div className={'index-page ' + config.deviceType}>
				{activeNotes?.id ? (
					<>
						<div className={'page i-category scrollBarHover '}>
							<CategoryList
								onClick={(v) => {
									dispatch(
										notesSlice.actions.selectCategory({
											id: v.id,
										})
									)
								}}
								list={activeNotes?.categories || []}
								noteId={activeNotes?.id}
							></CategoryList>
						</div>
						<div className={'page i-pagelist scrollBarHover '}>
							<PagesList
								onClick={(v) => {
									dispatch(
										notesSlice.actions.selectPage({
											id: v.id,
										})
									)
								}}
								list={activeCategory?.data || []}
								noteId={activeNotes?.id}
								categoryId={activeCategory?.id}
							></PagesList>
						</div>
						<div className={'i-page page '}>
							<PageContent
								noteId={activeNotes?.id}
								categoryId={activeCategory?.id}
								page={activePage}
								sync={
									activeNotes.isSync &&
									activeNotes.authorId === user.userInfo.uid
								}
							></PageContent>
						</div>
					</>
				) : (
					<div className='i-none'>
						<saki-button
							ref={bindEvent({
								tap: async () => {
									await dispatch(methods.notes.AddNotebook()).unwrap()
								},
							})}
							padding='12px 16px'
							type='Primary'
						>
							<span className='text-elipsis'>
								{t('addNotebook', {
									ns: 'indexPage',
								})}
							</span>
						</saki-button>
					</div>
				)}
			</div>
		</>
	)
}

export default IndexPage
