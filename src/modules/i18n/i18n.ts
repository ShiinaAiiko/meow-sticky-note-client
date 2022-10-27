import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
	'zh-CN': {
		common: {
			appTitle: '随喵便签',
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

			saveAs: '另存',
			download: '下载',
			connecting: '正在连接',

			turnOff: '关闭',
			turnOn: '开启',
			turnOffSync: '关闭同步',
			turnOnSync: '开启同步',
			turnedOnTip: '此笔记将同步到云端',
			turnedOffTip: '即将关闭此笔记的同步功能',

			importNotes: '导入笔记',
			noteAlreadyExistsOverwrite: '这个笔记已经存在，你要覆盖它吗？',
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
			backup: '备份',
			syncAndBackup: '同步与备份',
			syncTo: '同步至',
			syncingTo: '正在同步至',
			syncPromptForNotLoggedIn: '启用同步功能前需要先登陆帐号',
			modes: '模式',

			openMeowStickyNote: '打开随喵笔记',
			openQuickReview: '打开快速预览',
			autoCloseWindowAfterCopy: '复制后自动关闭窗口',

			light: '浅色模式',
			dark: '暗黑模式',
			system: '随系统变化',

			switchSuccessfully: '已切换为 ',

			shortcut: '快捷键',

			storagePath: '存储路径',
			automaticBackupFrequency: '自动备份频率',
			backupAutomatically: '自动备份',
			keepBackups: '保留备份',
			chooseStoragePath: '选择存储路径',

			atLeastOneMonths: '至少一个月',
			atLeastThreeMonths: '至少三个月',
			forever: '永久',

			daily: '每日',
			weekly: '每周',

			lastBackupTime: '上次备份时间',

			backUpNow: '立即备份',

			about: '关于',
		},
	},
	'zh-TW': {
		common: {
			appTitle: '隨喵便簽',
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

			saveAs: '另存',
			download: '下載',
			connecting: '正在連接',

			turnOff: '關閉',
			turnOn: '開啟',
			turnOffSync: '關閉同步',
			turnOnSync: '開啟同步',
			turnedOnTip: '此筆記將同步到雲端',
			turnedOffTip: '即將關閉此筆記的同步功能',

			importNotes: '導入筆記',
			noteAlreadyExistsOverwrite: '這個筆記已經存在，你要覆蓋它嗎？',
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
			backup: '備份',
			syncAndBackup: '同步和備份',
			syncTo: '同步至',
			syncingTo: '正在同步至',
			syncPromptForNotLoggedIn: '啟用同步功能前需要先登陸帳號',
			modes: '模式',

			openMeowStickyNote: '打開随喵笔记',
			openQuickReview: '打開快速預覽',
			autoCloseWindowAfterCopy: '複製后自動關閉窗口',

			light: '淺色模式',
			dark: '暗黑模式',
			system: '隨系統變化',

			switchSuccessfully: '已切換為 ',

			shortcut: '快捷鍵',

			storagePath: '存儲路徑',
			automaticBackupFrequency: '自動備份頻率',
			backupAutomatically: '自動備份',
			keepBackups: '保留備份',
			chooseStoragePath: '選擇一個存儲路徑',

			atLeastOneMonths: '至少一個月',
			atLeastThreeMonths: '至少三個月',
			forever: '永遠',

			daily: '每日',
			weekly: '每週',

			lastBackupTime: '上次備份時間',

			backUpNow: '立即備份',

			about: '關於',
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

			saveAs: 'Save as',
			download: 'Download',
			connecting: 'connecting',

			turnOff: 'Turn off',
			turnOn: 'Turn on',
			turnOffSync: 'Turn off sync',
			turnOnSync: 'Turn on sync',
			turnedOnTip: 'This note will sync to the cloud.',
			turnedOffTip: 'Sync will be turned off for this note soon.',

			importNotes: 'Import notes',
			noteAlreadyExistsOverwrite:
				'This note already exists, do you want to overwrite it?',
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
			backup: 'Backup',
			syncAndBackup: 'Sync and Backup',
			syncTo: 'Sync to ',
			syncingTo: 'Syncing to ',
			syncPromptForNotLoggedIn:
				'To enable synchronization, you need to log in to your account.',
			modes: 'Modes',

			openMeowStickyNote: 'Open Meow Sticky Note',
			openQuickReview: 'Open Quick review',
			autoCloseWindowAfterCopy: 'Automatically close the window after copying',

			light: 'Light',
			dark: 'Dark',
			system: 'Use system setting',

			switchSuccessfully: 'Switched to ',

			shortcut: 'Keyboard Shortcut',

			storagePath: 'Storage path',
			automaticBackupFrequency: 'Automatic Backup Frequency',
			backupAutomatically: 'Backup automatically',
			keepBackups: 'Keep Backups',
			chooseStoragePath: 'Choose a storage path',

			atLeastOneMonths: 'At least one months',
			atLeastThreeMonths: 'At least three months',
			forever: 'Forever',

			daily: 'Daily',
			weekly: 'Weekly',

			lastBackupTime: 'Last backup time',

			backUpNow: 'Back Up Now',

			about: 'About ',
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
