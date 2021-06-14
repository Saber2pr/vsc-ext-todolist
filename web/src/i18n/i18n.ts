export interface ITextMap {
  [key: string]: string
}

const template = (tpl: string, values: { [x: string]: any }) =>
  tpl.replace(/{\w+}/g, (slot: string) => values[slot.replace(/{|}/g, '')])

export class I18n {
  localesTextMap: { [locale: string]: ITextMap } = {}
  currentTextMap: ITextMap = {}
  registry(locale: string, text: ITextMap) {
    this.localesTextMap[locale] = text
  }

  setLocal(locale: string) {
    this.currentTextMap =
      this.localesTextMap[locale] ||
      this.localesTextMap[Object.keys(this.localesTextMap)[0]]
  }

  format(contentKey: string, args?: Record<string, string>) {
    const i18nformatString = this.currentTextMap[contentKey]
    if (!i18nformatString) {
      return ''
    }

    return args ? template(i18nformatString, args) : i18nformatString
  }
}
