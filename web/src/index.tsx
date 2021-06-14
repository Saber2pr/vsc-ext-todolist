import 'antd/dist/antd.less'

import React from 'react'
import ReactDOM from 'react-dom'
import { MemoryRouter } from 'react-router'

import { App } from './app'

ReactDOM.render(
  <MemoryRouter>
    <App />
  </MemoryRouter>,
  document.querySelector('#root')
)
