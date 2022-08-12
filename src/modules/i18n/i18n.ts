import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
	'zh-CN': {
		common: {
			appTitle: '随喵笔记',
			language: '多语言',
			openDevtools: '开发者工具',
			quit: '退出',

			quitModalTitle: '退出提示',
			quitModalContent: '确定想退出主程序?',

			logout: '注销',
			cancel: '取消',
			add: '添加',
			create: '创建',
			rename: '重命名',
			copy: '复制',
			delete: '删除',
			deleteThisCategory: '删除此类别？',
			deleteThisPage: '删除此页面？',
			deleteThisNote: '删除此笔记？',
			renameThisNote: '为此笔记重命名',

			notebookName: '笔记名称',
			notebookNameNil: '笔记名称不能为空',
			copySuccessfully: '复制成功',

			goToLogin: '请前往登陆帐号',

			profile: '个人资料',
			categories: '分类',
			pages: '页面',
			notes: '笔记',
		},
		indexHeader: {},
		indexPage: {
			categoryNotYetAdded: '尚未添加类别',
			noteNotYetAdded: '尚未添加笔记',

			renameThisNote: '为此笔记重命名',
			deleteNote: '删除此笔记',

			addNotebook: '添加笔记',
			placeholder: '笔记名称',

			addCategory: '添加分类',
			addPage: '添加页面',
			untitledPage: '无标题页面',
			enterContent: '输入内容',
			categoryName: '分类名',

			categoryNameNil: '分类名不能为空',
		},
		quickReviewPage: {
			pageTitle: '快速阅览',
		},
		settings: {
			account: '帐号',
			title: '设置',
			general: '常规',
			language: '多语言',
			appearance: '外表',
			sync: '同步',
			syncTo: '同步至',
			syncingTo: '正在同步至',
			syncPromptForNotLoggedIn: '启用同步功能前需要先登陆帐号',
			modes: '模式',

			light: '浅色模式',
			dark: '暗黑模式',
			system: '随系统变化',

			switchSuccessfully: '已切换为 ',

			shortcut: '快捷键',
		},
	},
	'zh-TW': {
		common: {
			appTitle: '随喵笔记',
			language: '多語言',
			openDevtools: '開發者工具',
			quit: '退出',

			quitModalTitle: '退出提示',
			quitModalContent: '確定想退出主程序?',

			logout: '登出',
			cancel: '取消',
			add: '添加',
			create: '創建',
			rename: '改名',
			copy: '复制',
			delete: '刪除',
			deleteThisCategory: '刪除此類別？',
			deleteThisPage: '删除此頁面？',
			deleteThisNote: '删除此笔记？',
			renameThisNote: '为此笔记重命名',

			notebookName: '筆記名稱',
			notebookNameNil: '筆記名稱不能為空',
			copySuccessfully: '複製成功',

			goToLogin: '請前往登陸帳號',

			profile: '個人資料',
			categories: '類別',
			pages: '頁面',
			notes: '筆記',
		},
		indexHeader: {},
		indexPage: {
			categoryNotYetAdded: '尚未添加類別',
			noteNotYetAdded: '尚未添加筆記',

			renameThisNote: '為此筆記重命名',
			deleteNote: '刪除此筆記',

			addNotebook: '添加筆記',
			placeholder: '筆記名稱',

			addCategory: '添加類別',
			addPage: '添加頁面',
			untitledPage: '無標題頁面',
			enterContent: '輸入內容',
			categoryName: '分類名稱',

			categoryNameNil: '分類名不能為空',
		},
		quickReviewPage: {
			pageTitle: '快速閱覽',
		},
		settings: {
			title: '設置',
			account: '帳戶',
			general: '一般',
			language: '多語言',
			appearance: '外表',
			sync: '同步',
			syncTo: '同步至',
			syncingTo: '正在同步至',
			syncPromptForNotLoggedIn: '啟用同步功能前需要先登陸帳號',
			modes: '模式',

			light: '淺色模式',
			dark: '暗黑模式',
			system: '隨系統變化',

			switchSuccessfully: '已切換為 ',

			shortcut: '快捷鍵',
		},
	},
	'en-US': {
		common: {
			appTitle: 'Meow Sticky Note',
			language: 'Language',
			openDevtools: 'Open devtools',
			quit: 'Quit',

			quitModalTitle: 'Quit prompt',
			quitModalContent: 'Are you sure you want to exit the main program?',

			logout: 'Logout',
			cancel: 'Cancel',
			add: 'Add',
			create: 'Create',
			rename: 'Rename',
			copy: 'Copy',
			delete: 'Delete',
			deleteThisCategory: 'Delete this category?',
			deleteThisPage: 'Delete this page?',
			deleteThisNote: 'Delete this note?',
			renameThisNote: 'Rename this note?',

			notebookName: 'Notebook name',
			notebookNameNil: 'Notebook name cannot be empty',
			copySuccessfully: 'Copy successfully!',

			goToLogin: 'Please go to login account',

			profile: 'Profile',
			categories: 'CATEGORIES',
			pages: 'PAGES',
			notes: 'NOTES',
		},
		indexHeader: {},
		indexPage: {
			categoryNotYetAdded: 'Category not yet added',
			noteNotYetAdded: 'Note not yet added',

			renameThisNote: 'Rename this note',
			deleteNote: 'Delete this note',

			addNotebook: 'Add a notebook',
			placeholder: 'Notebook name',

			addCategory: 'Add Category',
			addPage: 'Add Page',
			untitledPage: 'Untitled Page',
			enterContent: 'Enter content',
			categoryName: 'Category name',

			categoryNameNil: 'Category name cannot be empty',
		},
		quickReviewPage: {
			pageTitle: 'Quick review',
		},
		settings: {
			title: 'Settings',
			account: 'Account',
			general: 'General',
			language: 'Language',
			appearance: 'Appearance',
			sync: 'Sync',
			syncTo: 'Sync to ',
			syncingTo: 'Syncing to ',
			syncPromptForNotLoggedIn:
				'To enable synchronization, you need to log in to your account.',
			modes: 'Modes',

			light: 'Light',
			dark: 'Dark',
			system: 'Use system setting',

			switchSuccessfully: 'Switched to ',

			shortcut: 'Keyboard Shortcut',
		},
	},
}

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources,
		ns: ['common'],
		defaultNS: 'common',
		fallbackLng: 'zh-CN',
		lng: 'zh-CN',
		// fallbackLng: 'en-US',
		// lng: 'en-US',

		keySeparator: false, // we do not use keys in form messages.welcome

		interpolation: {
			escapeValue: false, // react already safes from xss
		},
	})

export default i18n