import { baselog } from 'nyanyajs-log'
import * as Ion from 'ion-sdk-js/lib/connector'
// import { config } from 'process'
baselog.Info('Env:', process.env.NODE_ENV)

let version = ''
let sakisso = {
	appId: '',
	clientUrl: '',
	serverUrl: '',
}
let serverApi = {
	apiUrl: '',
}
let nsocketio = {
	url: '',
}
let staticPathDomain = ''

let sakiui = {
	jsurl: '',
	esmjsurl: '',
}

interface Config {
	version: typeof version
	sakisso: typeof sakisso
	serverApi: typeof serverApi
	nsocketio: typeof nsocketio
	staticPathDomain: typeof staticPathDomain
	sakiui: typeof sakiui
}
// import configJson from './config.test.json'
try {
	let configJson: Config = require('./config.temp.json')
	let pkg = require('../package.json')
	console.log('configJson', configJson)
	if (configJson) {
		version = pkg.version
		sakisso = configJson.sakisso
		serverApi = configJson.serverApi
		nsocketio = configJson.nsocketio
		staticPathDomain = configJson.staticPathDomain
		sakiui = configJson.sakiui
	}
} catch (error) {
	console.log('未添加配置文件.')
	console.log(error)
}
export { version, serverApi, sakiui, staticPathDomain, sakisso, nsocketio }
