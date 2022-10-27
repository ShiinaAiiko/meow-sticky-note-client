import { languages } from '../config'

export const resources = {
	'zh-CN': {
		appName: '随喵便签',

		openMainWindow: '打开 {{appName}}',
		quickReview: '快速预览',
		icon: '图标',
		pinkIcon: '粉色图标',
		whiteIcon: '白色图标',

		languages: '多语言',
		enUS: 'English - 英文',
		zhCN: '中文(简体) - 中文(简体)',
		zhTW: '中文(繁體) - 中文(繁体)',

		quit: '退出',

		closed: '已关闭',
		activated: '已启动',

		about: '关于',
		version: '版本',
		github: 'Github',
	},
	'zh-TW': {
		appName: '隨喵便簽',

		openMainWindow: '打開 {{appName}}',
		quickReview: '快速預覽',
		icon: '圖標',
		pinkIcon: '粉色圖標',
		whiteIcon: '白色圖標',

		languages: '多語言',
		enUS: 'English - 英文',
		zhCN: '中文(简体) - 中文(簡體)',
		zhTW: '中文(繁體) - 中文(繁體)',

		quit: '退出',

		closed: '已關閉',
		activated: '已啟動',

		about: '關於',
		version: '版本',
		github: 'Github',
	},
	'en-US': {
		appName: 'Meow Sticky Note',

		openMainWindow: 'Open {{appName}}',
		quickReview: 'Quick review',
		icon: 'Icon',
		pinkIcon: 'Pink icon',
		whiteIcon: 'White icon',

		languages: 'Languages',
		enUS: 'English - English',
		zhCN: '中文(简体) - Chinese(Simplified)',
		zhTW: '中文(繁體) - Chinese(Traditional)',

		quit: 'Quit',

		closed: 'Closed',
		activated: 'Activated',

		about: 'About',
		version: 'Version',
		github: 'Github',
	},
}

export const t = (parameter: keyof typeof resources['en-US']): string => {
	return resources?.[languages]?.[parameter] || parameter
}
