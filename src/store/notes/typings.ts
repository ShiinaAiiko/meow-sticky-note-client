export interface CategoryItem {
	id: string
	name: string
	createTime: number
	lastUpdateTime: number
	sort: number
	data: PageItem[]
}

export interface PageItem {
	id: string
	title: string
	content: string
	createTime: number
	lastUpdateTime: number
	sort: number
}

export interface NoteItem {
	id: string
	name: string
	createTime: number
	lastUpdateTime: number
	sort: number
	isSync: boolean
	categories: CategoryItem[]
}
