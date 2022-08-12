import store from '../../store'
import { RSA, AES } from '@nyanyajs/utils'
// export const e2eeEncryption = (invitationCode: string, data: any) => {
// 	const e2ee = store.state.storage.e2ee.getSync(invitationCode)
// 	if (e2ee?.aesKey) {
// 		return AES.encrypt(data, e2ee.aesKey, e2ee.aesKey).value
// 	}
// 	return data
// }
// export const e2eeDecryption = (invitationCode: string, data: any) => {
// 	const e2ee = store.state.storage.e2ee.getSync(invitationCode)
// 	if (e2ee?.aesKey) {
// 		const dataDe = AES.decrypt(data, e2ee?.aesKey, e2ee?.aesKey)
// 		if (!dataDe) {
// 			store.state.storage.e2ee.delete(invitationCode)
// 			store.dispatch('secretChat/startE2eeEncryption', invitationCode)
// 			return
// 		}
// 		return dataDe && JSON.parse(dataDe)
// 	}
// 	return data
// }
