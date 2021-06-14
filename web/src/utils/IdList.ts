export class IdList<T extends { id: number }> {
  list: T[] = []

  constructor(data?: T[]) {
    if (data) {
      this.list = data
    }
  }

  push(...item: T[]) {
    const list = this.list ?? []
    list.unshift(...item)
    this.list = list
  }

  get(id: number) {
    const list = this.list ?? []
    return list.find(item => item.id === id)
  }

  static createItem<T>(values: T) {
    return {
      id: Date.now(),
      ...values,
    }
  }

  update(id: number, values: Partial<T>) {
    const target = this.get(id)
    if (target) {
      for (const key in values) {
        target[key] = values[key]
      }
    }
  }

  delete(id: number) {
    const list = this.list ?? []
    this.list = list.filter(item => item.id !== id)
  }

  clear(cleaner?: (item: T) => boolean) {
    if (cleaner) {
      this.list = this.list.filter(item => !cleaner(item))
    } else {
      this.list = []
    }
  }

  toObject() {
    return this.list
  }

  toString() {
    return JSON.stringify(this.toObject())
  }
}
