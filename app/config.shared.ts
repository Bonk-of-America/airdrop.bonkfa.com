export const APP_NAME = 'Bonk of America | Raid2Earn'
export const DEFAULT_FAILURE_REDIRECT = '/'
export const DEFAULT_SUCCESS_REDIRECT = '/'

export function title(pageTitle?: string) {
	if (!pageTitle) return APP_NAME

	return `${pageTitle} | ${APP_NAME}`
}
