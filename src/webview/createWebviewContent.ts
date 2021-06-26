import { join } from 'path'
import * as vscode from 'vscode'

const debug = true
const sourceTarget = 'http://localhost:8080/'

export const createWebviewContent = ({
  webviewPanel,
  basePath,
}: {
  webviewPanel: vscode.WebviewPanel
  basePath: string
}) => {
  const getSource = (name: string) => {
    if (debug) {
      return join(sourceTarget, name)
    }
    return webviewPanel.webview.asWebviewUri(
      vscode.Uri.file(join(basePath, 'web', 'build', name))
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
  <link href="${getSource('style.min.css')}" rel="stylesheet"></head>
  <body>
    <div id="root"></div>
  <script type="text/javascript" src="${getSource(
    'bundle.min.js'
  )}"></script></body>
  </html>
  `
}
