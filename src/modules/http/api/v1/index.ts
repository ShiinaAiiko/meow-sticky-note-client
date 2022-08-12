import { protoRoot, PARAMS, Request } from '../../../../protos'
import store from '../../../../store'
import axios from 'axios'
import { getUrl } from '..'

export const v1 = {
	async syncToServer(params: protoRoot.sync.SyncToServer.IRequest) {
		const { apiNames } = store.getState().api
		return await Request<protoRoot.sync.SyncToServer.IResponse>(
			{
				method: 'POST',
				// config: requestConfig,
				data: PARAMS<protoRoot.sync.SyncToServer.IRequest>(
					params,
					protoRoot.sync.SyncToServer.Request
				),
				url: getUrl(apiNames.v1.baseUrl, apiNames.v1.syncToServer),
			},
			protoRoot.sync.SyncToServer.Response
		)
	},
	async getUrls(params: protoRoot.sync.GetUrls.IRequest) {
		const { apiNames } = store.getState().api
		return await Request<protoRoot.sync.GetUrls.IResponse>(
			{
				method: 'GET',
				// config: requestConfig,
				data: PARAMS<protoRoot.sync.GetUrls.IRequest>(
					params,
					protoRoot.sync.GetUrls.Request
				),
				url: getUrl(apiNames.v1.baseUrl, apiNames.v1.getUrls),
			},
			protoRoot.sync.GetUrls.Response
		)
	},
	async getFolderFiles(params: protoRoot.sync.GetFolderFiles.IRequest) {
		const { apiNames } = store.getState().api

		return await Request<protoRoot.sync.GetFolderFiles.IResponse>(
			{
				method: 'GET',
				// config: requestConfig,
				data: PARAMS<protoRoot.sync.GetFolderFiles.IRequest>(
					params,
					protoRoot.sync.GetFolderFiles.Request
				),
				url: getUrl(apiNames.v1.baseUrl, apiNames.v1.getFolderFiles),
			},
			protoRoot.sync.GetFolderFiles.Response
		)
	},
	async getNote(params: protoRoot.sync.GetFolderFiles.IRequest) {
		const { apiNames } = store.getState().api

		return await Request<protoRoot.sync.GetNote.IResponse>(
			{
				method: 'GET',
				// config: requestConfig,
				data: PARAMS<protoRoot.sync.GetNote.IRequest>(
					params,
					protoRoot.sync.GetNote.Request
				),
				url: getUrl(apiNames.v1.baseUrl, apiNames.v1.GetNote),
			},
			protoRoot.sync.GetNote.Response
		)
	},
	async getUploadToken(params: protoRoot.file.GetUploadToken.IRequest) {
		const { apiNames } = store.getState().api

		return await Request<protoRoot.file.GetUploadToken.IResponse>(
			{
				method: 'GET',
				// config: requestConfig,
				data: PARAMS<protoRoot.file.GetUploadToken.IRequest>(
					params,
					protoRoot.file.GetUploadToken.Request
				),
				url: getUrl(apiNames.v1.baseUrl, apiNames.v1.getUploadToken),
			},
			protoRoot.file.GetUploadToken.Response
		)
	},
}
