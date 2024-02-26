import { join, parse } from 'path'
import * as vscode from 'vscode'

import { calcProgressV2 } from './api/calc-progress'
import { handleServiceMessage, ServicesHandlers } from './api/services'
import { IStoreTodoTree } from './api/type'
import { COM_MAIN, KEY_TODO_TREE, VIEW_TYPE } from './constants'
import { RCManager } from './store/rc'
import { TodoEditor } from './TodoEditor'
import { getThemeName } from './utils/getThemeName'
import { isActiveThemeKind } from './utils/isActiveThemeKind'
import {
  createWebviewContent,
  WebviewParams,
} from './webview/createWebviewContent'
import { getSystemType } from './utils/getSystemType'

let webviewPanel: vscode.WebviewPanel
let statusBar: vscode.StatusBarItem = null

const displayName = 'Todo List'
const loginWelcome = 'Check Todo List.'

export const updateStatusBarProgressV2 = async () => {
  const displayFile = await ServicesHandlers.GetDisplayFile(null)
  const listStr = await new RCManager(displayFile).get(KEY_TODO_TREE)
  if (listStr) {
    const list: IStoreTodoTree = listStr
    const length = list.tree.length
    const percent = calcProgressV2(list.tree)
    let name = parse(displayFile).name
    if (name === '.todolistrc') {
      name = 'Todo'
    }
    statusBar.text = length ? `${name} (${percent}%)` : displayName
  }
}

// install
export function activate(context: vscode.ExtensionContext) {
  // statusBar init
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  )
  statusBar.text = displayName
  statusBar.tooltip = loginWelcome
  statusBar.command = COM_MAIN
  statusBar.show()
  updateStatusBarProgressV2()

  // webview init
  function activeProjectCreatorWebview(
    params: WebviewParams = {
      platform: getSystemType(),
    },
    reload = false
  ) {
    if (webviewPanel) {
      if (reload) {
        webviewPanel.webview.html = createWebviewContent({
          webviewPanel,
          basePath: context.extensionPath,
          params,
        })
      }
      webviewPanel.reveal()
    } else {
      webviewPanel = vscode.window.createWebviewPanel(
        displayName,
        displayName,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      )
      webviewPanel.iconPath = vscode.Uri.file(
        join(context.extensionPath, 'assets', 'logo.png')
      )

      webviewPanel.webview.html = createWebviewContent({
        webviewPanel,
        basePath: context.extensionPath,
        params,
      })

      webviewPanel.webview.onDidReceiveMessage(
        async message => {
          await handleServiceMessage(webviewPanel, message)
          await updateStatusBarProgressV2()
        },
        null,
        context.subscriptions
      )

      webviewPanel.onDidDispose(
        () => {
          webviewPanel = undefined
        },
        null,
        context.subscriptions
      )
    }
  }
  // subscriptions
  context.subscriptions.push(
    vscode.commands.registerCommand(COM_MAIN, async (reload: string) => {
      const file = await ServicesHandlers.GetDisplayFile(null)
      const name = parse(file).name
      const colorTheme = getThemeName()
      activeProjectCreatorWebview(
        {
          theme: isActiveThemeKind(vscode.ColorThemeKind.Light)
            ? 'light'
            : 'dark',
          file,
          name,
          colorTheme,
          platform: getSystemType(),
        },
        reload === 'true'
      )
    }),
    vscode.window.registerCustomEditorProvider(
      VIEW_TYPE,
      new TodoEditor(context)
    ),
    vscode.window.onDidChangeActiveColorTheme(async event => {
      const file = await ServicesHandlers.GetDisplayFile(null)
      const name = parse(file).name
      const colorTheme = getThemeName()

      webviewPanel?.visible &&
        activeProjectCreatorWebview(
          {
            theme:
              event.kind === vscode.ColorThemeKind.Light ? 'light' : 'dark',
            file,
            name,
            colorTheme,
            platform: getSystemType(),
          },
          true
        )
    })
  )
  context.subscriptions.push(statusBar)
}

export function deactivate() {
  if (statusBar) {
    statusBar.hide()
    statusBar.dispose()
  }
  if (webviewPanel) {
    webviewPanel.dispose()
  }
  statusBar = null
  webviewPanel = null
}
