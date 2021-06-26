import './app.less'

import React, { useEffect } from 'react'
import { Route, useHistory } from 'react-router'
import { setLogLevel } from 'webpack-dev-server/client/utils/log'

import { callService } from '@saber2pr/vscode-webview'

import { Services } from '../../src/api/type'
import { i18n } from './i18n'
import { PageTodoList, PageTodoTree } from './pages'

setLogLevel('none')

export const App = () => {
  const history = useHistory()
  useEffect(() => {
    callService<Services, 'GetLanguage'>('GetLanguage', null).then(language => {
      i18n.setLocal(language)
      history.push('/todo_v2')
    })
  }, [history])
  return (
    <div className="app">
      <Route path="/todo" component={() => <PageTodoList />} />
      <Route path="/todo_v2" component={() => <PageTodoTree />} />
    </div>
  )
}
