'use strict'
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc)
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
    return c > 3 && r && Object.defineProperty(target, key, r), r
  }
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.RCManager = exports.SafeJSON = exports.isJSON = void 0
const fs_1 = __importDefault(require('fs'))
const path_1 = require('path')
const util_1 = require('util')
const readFile = util_1.promisify(fs_1.default.readFile)
const writeFile = util_1.promisify(fs_1.default.writeFile)
const mkdir = util_1.promisify(fs_1.default.mkdir)
const mkDirPath = (path) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (fs_1.default.existsSync(path)) {
      return
    } else {
      yield mkDirPath(path_1.dirname(path))
      yield mkdir(path)
    }
  })
const mkDirPathSync = (path) => {
  if (fs_1.default.existsSync(path)) {
    return
  } else {
    mkDirPathSync(path_1.dirname(path))
    fs_1.default.mkdirSync(path)
  }
}
const isJSON = (str) => {
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
exports.isJSON = isJSON
exports.SafeJSON = {
  parse(text, ...args) {
    if (exports.isJSON(text)) {
      return JSON.parse(text, ...args)
    } else {
      return {}
    }
  },
  stringify(obj, ...args) {
    if (obj) {
      return JSON.stringify(obj, ...args)
    } else {
      return ''
    }
  },
}
/**
 * 保证文件读写前，文件是存在的
 */
const prepare = (target, key, descriptor) => {
  const originMethod = descriptor.value
  if (/Sync$/.test(String(key))) {
    descriptor.value = function (...args) {
      const preparePath = this['path']
      if (fs_1.default.existsSync(preparePath)) {
      } else {
        mkDirPathSync(path_1.dirname(path_1.resolve(preparePath)))
        fs_1.default.writeFileSync(preparePath, exports.SafeJSON.stringify({}))
      }
      return originMethod.apply(this, args)
    }
  } else {
    descriptor.value = function (...args) {
      return __awaiter(this, void 0, void 0, function* () {
        const preparePath = this['path']
        if (fs_1.default.existsSync(preparePath)) {
        } else {
          yield mkDirPath(path_1.dirname(path_1.resolve(preparePath)))
          yield writeFile(preparePath, exports.SafeJSON.stringify({}))
        }
        return originMethod.apply(this, args)
      })
    }
  }
}
/**
 * 安全的json读写类
 * ```ts
 * // usage
 * const file = new RCManager('./config.json')
 * file.set('token', 'xxx')
 * file.get('token')
 * file.delete('token')
 * ```
 */
class RCManager {
  constructor(path) {
    this.path = path
  }
  get(key) {
    return __awaiter(this, void 0, void 0, function* () {
      const buf = yield readFile(this.path)
      const data = exports.SafeJSON.parse(buf.toString())
      return key ? data[key] : data
    })
  }
  getSync(key) {
    const buf = fs_1.default.readFileSync(this.path)
    const data = exports.SafeJSON.parse(buf.toString())
    return key ? data[key] : data
  }
  set(key, value) {
    return __awaiter(this, void 0, void 0, function* () {
      const data = this.get()
      data[key] = value
      yield writeFile(this.path, exports.SafeJSON.stringify(data, null, 2))
    })
  }
  setSync(key, value) {
    const data = this.get()
    data[key] = value
    fs_1.default.writeFileSync(
      this.path,
      exports.SafeJSON.stringify(data, null, 2),
    )
  }
  delete(key) {
    return __awaiter(this, void 0, void 0, function* () {
      const data = this.get()
      delete data[key]
      yield writeFile(this.path, exports.SafeJSON.stringify(data, null, 2))
    })
  }
  deleteSync(key) {
    const data = this.get()
    delete data[key]
    fs_1.default.writeFileSync(
      this.path,
      exports.SafeJSON.stringify(data, null, 2),
    )
  }
}
__decorate([prepare], RCManager.prototype, 'get', null)
__decorate([prepare], RCManager.prototype, 'getSync', null)
__decorate([prepare], RCManager.prototype, 'set', null)
__decorate([prepare], RCManager.prototype, 'setSync', null)
__decorate([prepare], RCManager.prototype, 'delete', null)
__decorate([prepare], RCManager.prototype, 'deleteSync', null)
exports.RCManager = RCManager
