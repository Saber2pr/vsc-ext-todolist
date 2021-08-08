import './app.less'

import React, { useEffect } from 'react'
import { Route, useHistory, useParams } from 'react-router'
import { setLogLevel } from 'webpack-dev-server/client/utils/log'

import { callService } from '@saber2pr/vscode-webview'

import { Services } from '../../src/api/type'
import { i18n } from './i18n'
import { PageTodoTree } from './pages'

setLogLevel('none')

declare const __ARGS__: { file?: string; name?: string }

export const App = () => {
  const history = useHistory<{ file?: string }>()
  useEffect(() => {
    const params = typeof __ARGS__ !== 'undefined' ? __ARGS__ : {}
    callService<Services, 'GetLanguage'>('GetLanguage', null).then(language => {
      i18n.setLocal(language)
      history.push(params?.file ? `/todo_v2?file=${params.file}&name=${params?.name}` : `/todo_v2`)
    })
  }, [history])
  return (
    <div className="app">
      <Route path="/todo_v2" component={() => <PageTodoTree />} />
    </div>
  )
}
