import * as proto from '../../../protos'
import * as coding from '../../../protos/socketioCoding'
import protoRoot from '../../../protos/proto'
import store from '../../../store'
import { RSA, AES } from '@nyanyajs/utils'
// import { e2eeDecryption, e2eeEncryption } from '../common'
export const Sync = (invitationCode: string) => {
	return {
		// async SendE2eeDHPublicKey(dhkey: string, uid: number) {
		// 	return coding.ResponseDataDecode<protoRoot.secretChat.SendMessageWithAnonymousRoom.Response>(
		// 		await store.state.socketio.client?.emit({
		// 			namespace: store.state.socketio.namespace.chat,
		// 			eventName: store.state.api.socketApi.v1.sendMessageWithAnonymousRoom,
		// 			params: await getParams({
		// 				apiName: 'SendE2eeDHPublicKey',
		// 				data: {
		// 					dhkey: dhkey,
		// 					uid,
		// 				},
		// 			}),
		// 		}),
		// 		protoRoot.sync.
		// 	)
		// },
	}
}
