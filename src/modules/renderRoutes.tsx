/**
 * React路由渲染插件
 * 可嵌套渲染一切子路由的插件
 * author:Shiina Aiiko
 */
import { type } from 'os'
import React, { useRef } from 'react'
import {
	Routes,
	BrowserRouter,
	Navigate,
	Route,
	RouterProps,
	useLocation,
	HashRouter,
	// Switch,
	// Link,
	// withRouter,
} from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

export interface Routers {
	path: string
	title: string
	exact?: boolean
	layout: (props: any) => JSX.Element
	component: (props: any) => JSX.Element
	redirect?: string
	children?: Routers[]
	CSSTransitionClassName?: string
}

export interface ReaderRouterProps extends RouterProps {
	nodeRef: React.MutableRefObject<null>
}

const RenderRoutesComponent = (routes: Routers[]) => {
	return routes && routes.length
		? routes.map((route, key) => {
				const Layout = route.layout
				// const Component = route.component
				const Component = (props: any) => {
					const location = useLocation()
					const nodeRef = useRef(null)
					console.log(location, route)
					console.log('nodeRef', nodeRef)
					return (
						<saki-transition
							class='router-transition'
							animation-duration={500}
							in={location.pathname === route.path}
							class-name={route.CSSTransitionClassName || 'router-transition'}
						>
							{/* //{' '} */}
							{/* <div ref={nodeRef}> */}
							<route.component nodeRef={nodeRef} {...props}></route.component>
							{/* //{' '} */}
							{/* </div> */}
						</saki-transition>
					)
					// return (
					// 	<CSSTransition
					// 		in={location.pathname === route.path}
					// 		key={route.path}
					// 		timeout={500}
					// 		classNames={route.CSSTransitionClassName || 'fade'}
					// 	>
					// 		{/* //{' '} */}
					// 		{/* <div ref={nodeRef}> */}
					// 		<route.component nodeRef={nodeRef} {...props}></route.component>
					// 		{/* //{' '} */}
					// 		{/* </div> */}
					// 	</CSSTransition>
					// )
				}
				return (
					<Route
						keep-alive
						key={key}
						path={route.path}
						// 有子路由的情况下不能有exact
						// 是否乃是精准路由地址
						element={
							route.redirect ? (
								<Navigate replace to={route.redirect} />
							) : route.layout ? (
								<Layout>
									<Component
										// {...props}
										Layout={route.layout}
										routes={route.children}
									>
										{RenderRoutesComponent(route?.children || [])}
									</Component>
								</Layout>
							) : (
								<Component
									// {...props}
									Layout={route.layout}
									routes={route.children}
								>
									{RenderRoutesComponent(route?.children || [])}
								</Component>
							)
						}
					></Route>
				)
		  })
		: ''
}

export const RenderRoutes = ({
	routerType,
	routes,
}: {
	routerType: 'Hash' | 'History'
	routes: Routers[]
}) => {
	return routerType === 'History' ? (
		<BrowserRouter>
			{/* <TransitionGroup className={'transition-group-class'}> */}
			<Routes>{RenderRoutesComponent(routes)}</Routes>
			{/* </TransitionGroup> */}
		</BrowserRouter>
	) : routerType === 'Hash' ? (
		<HashRouter>
			{/* <TransitionGroup className={'transition-group-class'}> */}
			<Routes>{RenderRoutesComponent(routes)}</Routes>
			{/* </TransitionGroup> */}
		</HashRouter>
	) : (
		<></>
	)
}

export default RenderRoutes
