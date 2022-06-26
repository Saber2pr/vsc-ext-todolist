import fs from 'fs'
import { dirname, resolve } from 'path'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

const mkDirPath = async (path: string): Promise<void> => {
  if (fs.existsSync(path)) {
    return
  } else {
    await mkDirPath(dirname(path))
    await mkdir(path)
  }
}

const mkDirPathSync = (path: string) => {
  if (fs.existsSync(path)) {
    return
  } else {
    mkDirPathSync(dirname(path))
    fs.mkdirSync(path)
  }
}

export const isJSON = (str: string) => {
  if (typeof str == 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  } else {
    return false
  }
}

export const SafeJSON: Pick<typeof JSON, 'parse' | 'stringify'> = {
  parse(text, ...args) {
    if (isJSON(text)) {
      return JSON.parse(text, ...args)
    } else {
      return {}
    }
  },
  stringify(obj: object, ...args: any[]) {
    if (obj) {
      return JSON.stringify(obj, ...args)
    } else {
      return ''
    }
  },
}

const prepare: MethodDecorator = (
  target,
  key,
  descriptor: TypedPropertyDescriptor<any>
) => {
  const originMethod = descriptor.value
  if (/Sync$/.test(String(key))) {
    descriptor.value = function (...args: any) {
      const preparePath = this['path']
      if (fs.existsSync(preparePath)) {
      } else {
        mkDirPathSync(dirname(resolve(preparePath)))
        fs.writeFileSync(preparePath, SafeJSON.stringify({}))
      }
      return originMethod.apply(this, args)
    }
  } else {
    descriptor.value = async function (...args: any) {
      const preparePath = this['path']
      if (fs.existsSync(preparePath)) {
      } else {
        await mkDirPath(dirname(resolve(preparePath)))
        await writeFile(preparePath, SafeJSON.stringify({}))
      }
      return originMethod.apply(this, args)
    }
  }
}

export class RCManager {
  constructor(private path: string) {}

  @prepare
  async get(key?: string) {
    const buf = await readFile(this.path)
    const data = SafeJSON.parse(buf.toString())
    return key ? data[key] : data
  }
  @prepare
  getSync(key?: string) {
    const buf = fs.readFileSync(this.path)
    const data = SafeJSON.parse(buf.toString())
    return key ? data[key] : data
  }

  @prepare
  async set(key: string, value: any) {
    const data = this.get()
    data[key] = value
    await writeFile(this.path, SafeJSON.stringify(data, null, 2))
  }
  @prepare
  setSync(key: string, value: any) {
    const data = this.get()
    data[key] = value
    fs.writeFileSync(this.path, SafeJSON.stringify(data, null, 2))
  }

  @prepare
  async delete(key: string) {
    const data = this.get()
    delete data[key]
    await writeFile(this.path, SafeJSON.stringify(data, null, 2))
  }
  @prepare
  deleteSync(key: string) {
    const data = this.get()
    delete data[key]
    fs.writeFileSync(this.path, SafeJSON.stringify(data, null, 2))
  }
}
