import {
	BrowserWindow,
	ipcMain,
	Tray,
	Notification,
	nativeTheme,
	globalShortcut,
	dialog,
	SaveDialogOptions,
	OpenDialogOptions,
} from 'electron'
import path from 'path'
import fs from 'fs'
import moment from 'moment'

import { logo, systemConfig, notes } from '../config'
interface SaveAsOptions extends SaveDialogOptions {
	path?: string
}
export const saveAs = async (
	fileName: string,
	data: string,
	options?: SaveAsOptions
) => {
	const lastOpenFolderPath =
		(await systemConfig.get('lastOpenFolderPath')) ||
		process.env.HOME ||
		process.env.USERPROFILE
	const savePath = await dialog.showSaveDialog({
		defaultPath: (options?.path || lastOpenFolderPath) + '/' + fileName,
		...options,
		properties: [
			'showHiddenFiles',
			'showOverwriteConfirmation',
			'createDirectory',
		],
	})
	if (!savePath.canceled && savePath?.filePath) {
		await systemConfig.set(
			'lastOpenFolderPath',
			path.dirname(savePath.filePath)
		)
		// console.log(savePath.canceled, savePath.filePath)
		// console.log(path.dirname(savePath.filePath))
		fs.writeFileSync(savePath?.filePath, data)
	}
}

interface OpenFolderOptions extends OpenDialogOptions {}
export const openFolder = async (path: string, options?: OpenFolderOptions) => {
	const lastOpenFolderPath =
		path || (process.env.HOME || process.env.USERPROFILE) + '/meow-sticky-note'
	const openPath = await dialog.showOpenDialog({
		defaultPath: lastOpenFolderPath,
		...options,
		properties: ['showHiddenFiles', 'openDirectory', 'createDirectory'],
	})
	if (!openPath.canceled && openPath?.filePaths) {
		return openPath?.filePaths?.[0]
	}
	return ''
}

export const backup = async () => {
	console.log('backup')
	clearBackup()
	const backupAutomatically = JSON.parse(
		(await systemConfig.get('backupAutomatically')) || 'false'
	)
	const automaticBackupFrequency = Number(
		(await systemConfig.get('automaticBackupFrequency')) || 604800
	)
	const storagePath = await systemConfig.get('backupStoragePath')
	let lastBackupTime = (await systemConfig.get('lastBackupTime')) || 0

	// lastBackupTime = 0

	console.log(backupAutomatically, storagePath)
	if (backupAutomatically && storagePath) {
		console.log('开始备份')
		const timestamp = Math.floor(new Date().getTime() / 1000)

		if (timestamp > lastBackupTime + automaticBackupFrequency) {
			const noteList = await notes.getAll()

			console.log(noteList.length)
			console.log('该备份了')

			const backupPath =
				storagePath + '/backup_' + moment().format('YYYY-MM-DD_hh:mm:ss')
			mkdirsSync(backupPath)

			noteList.forEach((v) => {
				fs.writeFileSync(
					backupPath + '/' + v.value.id + '.note',
					JSON.stringify(v, null, 2)
				)
			})

			await systemConfig.set('lastBackupTime', timestamp)
		} else {
			console.log('还没到时间')
		}
	}
}

const clearBackup = async () => {
	// keepBackups
	console.log('-----clearBackup-----')
	let keepBackups = Number(
		(await systemConfig.get('keepBackups')) || 120 * 365 * 24 * 3600
	)

	const storagePath = await systemConfig.get('backupStoragePath')
	// console.log('keepBackups', storagePath, keepBackups)
	const files = fs.readdirSync(storagePath)
	// console.log(files)
	const timestamp = Math.floor(new Date().getTime() / 1000)

	files.forEach((v) => {
		if (v.indexOf('backup_') === 0) {
			const createTime = Math.floor(
				new Date(v.replace('backup_', '').replace('_', ' ')).getTime() / 1000
			)
			// console.log(createTime)
			const filePath = storagePath + '/' + v
			// console.log(filePath)

			if (timestamp - createTime >= keepBackups) {
				console.log(filePath, ' => 该删除了')
				removeDir(filePath)
			} else {
				console.log(filePath, ' => 不需要删除')
			}
		}
	})
}

const mkdirsSync = (dirname: string) => {
	if (fs.existsSync(dirname)) {
		return true
	} else {
		if (mkdirsSync(path.dirname(dirname))) {
			fs.mkdirSync(dirname)
			return true
		}
	}
}

const removeDir = (dir: string) => {
	let files = fs.readdirSync(dir)
	for (var i = 0; i < files.length; i++) {
		let newPath = path.join(dir, files[i])
		let stat = fs.statSync(newPath)
		if (stat.isDirectory()) {
			//如果是文件夹就递归下去
			removeDir(newPath)
		} else {
			//删除文件
			fs.unlinkSync(newPath)
		}
	}
	fs.rmdirSync(dir) //如果文件夹是空的，就将自己删除掉
}
