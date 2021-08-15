import './app.less'

import React, { useEffect } from 'react'
import { Route, useHistory } from 'react-router'
import { setLogLevel } from 'webpack-dev-server/client/utils/log'

import { callService } from '@saber2pr/vscode-webview'

import { Services } from '../../src/api/type'
import { i18n } from './i18n'
import { PageTodoTree } from './pages'
import { APP_ARGS } from './utils'

setLogLevel('none')

export const App = () => {
  const history = useHistory<{ file?: string }>()
  useEffect(() => {
    callService<Services, 'GetLanguage'>('GetLanguage', null).then(language => {
      i18n.setLocal(language)
      history.push(
        APP_ARGS?.file
          ? `/todo_v2?file=${APP_ARGS.file}&name=${APP_ARGS?.name}`
          : `/todo_v2`
      )
    })
  }, [history])
  return (
    <div className="app" data-theme={APP_ARGS.theme ?? 'light'}>
      <Route path="/todo_v2" component={() => <PageTodoTree />} />
    </div>
  )
}
