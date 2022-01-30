export interface ITextMap {
  [key: string]: string
}

export type ILocalesTextMap = { [locale: string]: ITextMap }

const template = (tpl: string, values: { [x: string]: any }) =>
  tpl.replace(/{\w+}/g, (slot: string) => values[slot.replace(/{|}/g, '')])

export class I18n<T extends ILocalesTextMap, M = T[keyof T]> {
  private currentTextMap: ITextMap = {}

  constructor(private localesTextMap: T) {}

  setLocal(locale: keyof T) {
    this.currentTextMap =
      this.localesTextMap[locale] ||
      this.localesTextMap[Object.keys(this.localesTextMap)[0]]
  }

  format(contentKey: keyof M, args?: Record<string, string>) {
    const i18nformatString = this.currentTextMap[contentKey as any]
    if (!i18nformatString) {
      return ''
    }

    return args ? template(i18nformatString, args) : i18nformatString
  }
}
