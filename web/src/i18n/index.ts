import { I18n } from './i18n'
import { localeMap } from './locale'

const i18n = new I18n()

i18n.registry('en', localeMap.en)
i18n.registry('zh-cn', localeMap['zh-cn'])

export { i18n }
