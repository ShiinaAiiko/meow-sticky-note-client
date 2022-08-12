import { v1 } from './v1'
import store from '../../../store'

export const getUrl = (baseUrl: string, apiName: string) => {
	const { apiUrl } = store.getState().api

	return apiUrl + baseUrl + apiName
}

export const api = {
	v1,
}
