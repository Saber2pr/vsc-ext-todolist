import { join } from 'path'
import * as vscode from 'vscode'

export type WebviewParams = {
  file?: string
  name?: string
  theme?: 'light' | 'dark'
}

export const createWebviewContent = ({
  webviewPanel,
  basePath,
  params = {},
}: {
  webviewPanel: vscode.WebviewPanel
  basePath: string
  params?: WebviewParams
}) => {
  const theme = params?.theme ?? 'light'
  const getSource = (...names: string[]) => {
    return webviewPanel.webview.asWebviewUri(
      vscode.Uri.file(join(basePath, 'web', ...names))
    )
  }
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link href="${getSource('build', `app.min.css`)}" rel="stylesheet">
    <link href="${getSource('build', `theme-style.min.css`)}" rel="stylesheet">
    <link href="${getSource(
      'node_modules',
      `antd`,
      'dist',
      theme === 'light' ? 'antd.min.css' : 'antd.dark.min.css'
    )}" rel="stylesheet">
    <script>
      var __ARGS__ = ${JSON.stringify(params)}
    </script>
  </head>
  <body>
    <div id="root"></div>
  <script type="text/javascript" src="${getSource(
    'build',
    `app.min.js`
  )}"></script></body>
  </html>
  `
}
