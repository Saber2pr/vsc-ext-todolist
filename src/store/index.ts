import nconf from 'nconf'
import os from 'os'
import { join } from 'path'

import { FILE_CONFIG } from '../constants'

const configPath = join(os.homedir(), FILE_CONFIG)

const file = nconf.file(configPath)

export const configStore = {
  path: configPath,
  refresh() {
    file.load()
  },
  save() {
    file.save((err: any) => console.log(err))
  },
  set(key: string, value: string) {
    file.set(key, value)
    configStore.save()
  },
  get(key?: string) {
    configStore.refresh()
    return file.get(key)
  },
  del(key: string) {
    file.clear(key)
    configStore.save()
  },
}
