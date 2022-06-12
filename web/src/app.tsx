import './app.less'

import React, { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router'
import { setLogLevel } from 'webpack-dev-server/client/utils/log'

import { callService } from '@saber2pr/vscode-webview'

import { Services } from '../../src/api/type'
import { i18n } from './i18n'
import { PageTodoTree } from './pages'
import { APP_ARGS } from './utils'
import { PagePlay } from './pages/play'

setLogLevel('none')

export const App = () => {
  const navigate = useNavigate()
  useEffect(() => {
    callService<Services, 'GetLanguage'>('GetLanguage', null).then(
      (language) => {
        console.log('language', language)
        i18n.setLocal(language)
        navigate(
          APP_ARGS?.file
            ? `/todo_v2?file=${APP_ARGS.file}&name=${APP_ARGS?.name}`
            : `/todo_v2`,
        )
      },
    )
  }, [history])
  return (
    <div className="app" data-theme={APP_ARGS.theme ?? 'light'}>
      <Routes>
        <Route path="/todo_v2" element={<PageTodoTree />} />
        <Route path="/play" element={<PagePlay />} />
      </Routes>
    </div>
  )
}
