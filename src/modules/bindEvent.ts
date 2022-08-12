import md5 from 'blueimp-md5'

type Events = {
	[eventName: string]: (e: CustomEvent) => void
}
const allEvents: {
	[key: string]: Events
} = {}

export const bindEvent = (
	events: Events = {},
	ref?: (element: HTMLElement) => void
) => {
	return (e: HTMLElement) => {
    ref?.(e)
    if (!e) return

		let beId = e.getAttribute('data-be-id')
		if (!beId) {
			beId = md5(
				String(new Date().getTime()) + String(Math.random() * 10000000)
			)
			e.setAttribute('data-be-id', beId)
		}
		const temp = allEvents[beId]
		temp &&
			Object.keys(temp)?.forEach((k) => {
				const func: any = temp[k]
				func && e.removeEventListener(k, func)
			})
		Object.keys(events).forEach((k) => {
			const func: any = events[k]
			func && e.addEventListener(k, func)
		})
		allEvents[beId] = events
	}
}
