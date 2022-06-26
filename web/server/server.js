const { join } = require('path')
const fs = require('fs-extra')
const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const { RCManager } = require('../../out/store/rc')

const app = express()

app
  .use(express.static(join(__dirname, '../build')))
  .use(bodyParser())
  .use(cors({ origin: '*' }))

const dataPath = join(__dirname, 'data.json')

const servicesMock = {
  GetLanguage: (params) => {
    return 'zh-cn'
  },
  GetStore: ({ key }) => {
    const rc = new RCManager(dataPath)
    return rc.get(key)
  },
  Store: async ({ key, value }) => {
    const rc = new RCManager(dataPath)
    await rc.set(key, value)
    return dataPath
  },
}

app.post('/api', async (req, res) => {
  const body = req.body
  console.log(body)
  const service = body.service
  const params = body.params
  if (service && service in servicesMock) {
    res.json({
      serviceUri: service,
      response: await servicesMock[service](params),
    })
    return
  }
  res.json({})
  return
})

app.listen(3000, () => console.log('http://localhost:3000'))
