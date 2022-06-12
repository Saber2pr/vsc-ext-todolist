import axios from 'axios'
import React from 'react'
import ReactDOM from 'react-dom'
import { MemoryRouter } from 'react-router'

import { setMockVscodeApi } from '@saber2pr/vscode-webview'

import { App } from './app'

// for docker web service
setMockVscodeApi({
  async postMessage(message) {
    // /api in server.js
    const res = await axios.post('/api', message)
    return res.data.response
  },
})

ReactDOM.render(
  <MemoryRouter>
    <App />
  </MemoryRouter>,
  document.querySelector('#root'),
)
