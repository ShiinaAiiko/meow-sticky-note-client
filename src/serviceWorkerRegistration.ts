// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

import axios from 'axios'
import qs from 'qs'

const isLocalhost = Boolean(
	window.location.hostname === 'localhost' ||
		// [::1] is the IPv6 localhost address.
		window.location.hostname === '[::1]' ||
		// 127.0.0.0/8 are considered localhost for IPv4.
		window.location.hostname.match(
			/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
		)
)

type Config = {
	onSuccess?: (registration: ServiceWorkerRegistration) => void
	onUpdate?: (registration: ServiceWorkerRegistration) => void
}

export function register(config?: Config) {
	// process.env.NODE_ENV === 'production' &&
	if ('serviceWorker' in navigator) {
		console.log('开始创建')
		// The URL constructor is available in all browsers that support SW.
		const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href)
		if (publicUrl.origin !== window.location.origin) {
			// Our service worker won't work if PUBLIC_URL is on a different origin
			// from what our page is served on. This might happen if a CDN is used to
			// serve assets; see https://github.com/facebook/create-react-app/issues/2374
			return
		}

		window.addEventListener('load', () => {
			const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`

			console.log('isLocalhost', isLocalhost)
			if (isLocalhost) {
				// This is running on localhost. Let's check if a service worker still exists or not.
				checkValidServiceWorker(swUrl, config)

				// Add some additional logging to localhost, pointing developers to the
				// service worker/PWA documentation.
				navigator.serviceWorker.ready.then(() => {
					console.log(
						'This web app is being served cache-first by a service ' +
							'worker. To learn more, visit https://cra.link/PWA'
					)
				})
			} else {
				// Is not localhost. Just register service worker
				registerValidSW(swUrl, config)
			}
		})
	}
}

function registerValidSW(swUrl: string, config?: Config) {
	navigator.serviceWorker
		.register(swUrl)
		.then((registration) => {
			registration.onupdatefound = () => {
				const installingWorker = registration.installing
				if (installingWorker == null) {
					return
				}
				installingWorker.onstatechange = () => {
					if (installingWorker.state === 'installed') {
						if (navigator.serviceWorker.controller) {
							// At this point, the updated precached content has been fetched,
							// but the previous service worker will still serve the older
							// content until all client tabs are closed.
							console.log(
								'New content is available and will be used when all ' +
									'tabs for this page are closed. See https://cra.link/PWA.'
							)

							// Execute callback
							if (config && config.onUpdate) {
								config.onUpdate(registration)
							}
						} else {
							// At this point, everything has been precached.
							// It's the perfect time to display a
							// "Content is cached for offline use." message.
							console.log('Content is cached for offline use.')

							// Execute callback
							if (config && config.onSuccess) {
								config.onSuccess(registration)
							}
						}
					}
				}
			}
		})
		.catch((error) => {
			console.error('Error during service worker registration:', error)
		})
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
	// Check if the service worker can be found. If it can't reload the page.
	fetch(swUrl, {
		headers: { 'Service-Worker': 'script' },
	})
		.then((response) => {
			// Ensure service worker exists, and that we really are getting a JS file.
			const contentType = response.headers.get('content-type')
			if (
				response.status === 404 ||
				(contentType != null && contentType.indexOf('javascript') === -1)
			) {
				// No service worker found. Probably a different app. Reload the page.
				navigator.serviceWorker.ready.then((registration) => {
					registration.unregister().then(() => {
						window.location.reload()
					})
				})
			} else {
				// Service worker found. Proceed as normal.
				registerValidSW(swUrl, config)
			}
		})
		.catch(() => {
			console.log(
				'No internet connection found. App is running in offline mode.'
			)
		})
}

export function unregister() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.ready
			.then((registration) => {
				registration.unregister()
			})
			.catch((error) => {
				console.error(error.message)
			})
	}
}

export function showNotification() {
	if ('serviceWorker' in navigator) {
		Notification.requestPermission((result) => {
			console.log('result', result)
			if (result === 'granted') {
				navigator.serviceWorker.ready
					.then((registration) => {
						registration.showNotification('Vibration Sample', {
							body: 'Buzz! Buzz!',
							icon: '../public/logo512.png',
							vibrate: [200, 100, 200, 100, 200, 100, 200],
							tag: 'vibration-sample',
						})
					})
					.catch((error) => {
						console.error(error.message)
					})
			}
		})
	}
}

export function watchPush() {
	if ('serviceWorker' in navigator) {
		Notification.requestPermission((result) => {
			console.log('result', result)
			if (result === 'granted') {
				navigator.serviceWorker.ready
					.then((registration) => {
						console.log('registration watch push', registration)
						registration.addEventListener('push', (e) => {
							console.log('push', e)

							registration.showNotification('Vibration Samplee11111', {
								body: 'Buzz! Buzz!',
								icon: '../public/logo512.png',
								vibrate: [200, 100, 200, 100, 200, 100, 200],
								tag: 'vibration-sample',
							})
						})
					})
					.catch((error) => {
						console.error(error.message)
					})
			}
		})
	}
}

export function push() {
	if ('serviceWorker' in navigator) {
		Notification.requestPermission((result) => {
			console.log('result', result)
			if (result === 'granted') {
				navigator.serviceWorker.ready
					.then((registration) => {
						return registration.pushManager
							.getSubscription()
							.then(async (subscription) => {
								console.log('获取', subscription)
								// If a subscription was found, return it.
								if (subscription) {
									// await subscription.unsubscribe()

									return subscription
								}

								// Get the server's public key
								// const response = await fetch('./vapidPublicKey')

								// const res = await axios({
								// 	url: 'http://localhost:3001/api/v1/getkey',
								// 	method: 'GET',
								// 	headers: {
								// 		'Content-Type': 'application/x-www-form-urlencoded',
								// 	},
								// })
								// console.log('res', res)

								const vapidPublicKey = ''
								// Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
								// urlBase64ToUint8Array() is defined in /tools.js

								const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
								// Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
								// send notifications that don't have a visible effect for the user).
								return registration.pushManager.subscribe({
									userVisibleOnly: true,
									applicationServerKey: convertedVapidKey,
								})
							})
					})
					.then(async function (subscription) {
						console.log('注册', subscription)
						let data = qs.stringify({
							appId: '1111',
							subscription: JSON.stringify(subscription),
						})
						const res = await axios({
							url: 'http://localhost:3001/api/v1/register',
							method: 'POST',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded',
							},
							data: data,
						})
						console.log('res', res)
						const aEle = document.querySelector('.aaaaa')
						aEle?.addEventListener('click', async () => {
							const res = await axios({
								url: 'http://localhost:3001/api/v1/register',
								method: 'POST',
								headers: {
									'Content-Type': 'application/x-www-form-urlencoded',
								},
								data: data,
							})
							console.log('res', res)
						})
						// Send the subscription details to the server using the Fetch API.
					})
					.catch((error) => {
						console.error(error.message)

						// Send the subscription details to the server using the Fetch API.

						// document.getElementById('doIt').onclick = function () {
						// 	const payload = document.getElementById(
						// 		'notification-payload'
						// 	).value
						// 	const delay = document.getElementById('notification-delay').value
						// 	const ttl = document.getElementById('notification-ttl').value

						// 	// Ask the server to send the client a notification (for testing purposes, in actual
						// 	// applications the push notification is likely going to be generated by some event
						// 	// in the server).
						// 	fetch('./sendNotification', {
						// 		method: 'post',
						// 		headers: {
						// 			'Content-type': 'application/json',
						// 		},
						// 		body: JSON.stringify({
						// 			subscription: subscription,
						// 			payload: payload,
						// 			delay: delay,
						// 			ttl: ttl,
						// 		}),
						// 	})
						// }
					})
			}
		})
	}
}

function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

	const rawData = window.atob(base64)
	const outputArray = new Uint8Array(rawData.length)

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}
