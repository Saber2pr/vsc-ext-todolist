import type { WebviewParams } from '../../../src/webview/createWebviewContent'

declare const __ARGS__: WebviewParams

export const APP_ARGS = typeof __ARGS__ !== 'undefined' ? __ARGS__ : {}
