import { join, parse } from 'path'
import {
  CancellationToken,
  ColorThemeKind,
  CustomDocument,
  CustomDocumentBackup,
  CustomDocumentBackupContext,
  CustomDocumentContentChangeEvent,
  CustomEditorProvider,
  EventEmitter,
  ExtensionContext,
  Uri,
  WebviewPanel,
  window,
  workspace,
} from 'vscode'

import { handleServiceMessage } from './api/services'
import { getThemeName } from './utils/getThemeName'
import { isActiveThemeKind } from './utils/isActiveThemeKind'
import {
  createWebviewContent,
  WebviewParams,
} from './webview/createWebviewContent'
import { getSystemType } from './utils/getSystemType'

export class TodoEditor implements CustomEditorProvider<TodoDocument> {
  private readonly onDidChangeCustomDocumentEmitter = new EventEmitter<
    CustomDocumentContentChangeEvent<TodoDocument>
  >()

  public constructor(private context: ExtensionContext) {}

  public readonly onDidChangeCustomDocument =
    this.onDidChangeCustomDocumentEmitter.event

  public saveCustomDocument(
    document: TodoDocument,
    cancellation: CancellationToken
  ): Promise<void> {
    return document.save()
  }

  public saveCustomDocumentAs(
    document: TodoDocument,
    destination: Uri,
    cancellation: CancellationToken
  ): Promise<void> {
    return document.saveAs(destination)
  }

  public revertCustomDocument(
    document: TodoDocument,
    cancellation: CancellationToken
  ): Promise<void> {
    return document.loadFromDisk()
  }

  public async backupCustomDocument(
    document: TodoDocument,
    context: CustomDocumentBackupContext,
    cancellation: CancellationToken
  ): Promise<CustomDocumentBackup> {
    return document.backup(context.destination)
  }

  openCustomDocument(uri: Uri) {
    const todoDocument = new TodoDocument(uri)
    return todoDocument
  }

  public async resolveCustomEditor(
    document: TodoDocument,
    webviewPanel: WebviewPanel,
    token: CancellationToken
  ): Promise<void> {
    try {
      const webview = webviewPanel.webview
      webview.options = {
        enableScripts: true,
      }
      const loadContent = (params: WebviewParams) => {
        webviewPanel.webview.html = createWebviewContent({
          webviewPanel,
          basePath: this.context.extensionPath,
          params,
        })
      }
      loadContent({
        file: document.uri.fsPath,
        name: parse(document.uri.fsPath).name,
        theme: isActiveThemeKind(ColorThemeKind.Light) ? 'light' : 'dark',
        colorTheme: getThemeName(),
        platform: getSystemType(),
      })
      webviewPanel.iconPath = Uri.file(
        join(this.context.extensionPath, 'assets', 'logo.png')
      )
      webviewPanel.webview.onDidReceiveMessage(
        async message => {
          await handleServiceMessage(webviewPanel, message)
        },
        null,
        this.context.subscriptions
      )
      this.context.subscriptions.push(
        window.onDidChangeActiveColorTheme(event => {
          webviewPanel?.visible &&
            loadContent({
              file: document.uri.fsPath,
              name: parse(document.uri.fsPath).name,
              theme: event.kind === ColorThemeKind.Light ? 'light' : 'dark',
              colorTheme: getThemeName(),
              platform: getSystemType(),
            })
        })
      )
    } catch (e) {
      window.showErrorMessage(`Failed to open file: ${e}`)
      throw e
    }
  }
}

class TodoDocument implements CustomDocument {
  public constructor(public readonly uri: Uri) {}
  dispose() {}
  public save(): Promise<void> {
    return this.saveAs(this.uri)
  }

  public async saveAs(target: Uri): Promise<void> {}

  public async loadFromDisk(): Promise<void> {
    // if (this.uri.fsPath.endsWith('.todo')) {
    //   const buffer = await workspace.fs.readFile(this.uri)
    // } else {
    //   throw new Error('Invalid file extension')
    // }
  }

  public async backup(destination: Uri): Promise<CustomDocumentBackup> {
    return {
      id: destination.toString(),
      delete: async () => {
        try {
          await workspace.fs.delete(destination)
        } catch {
          // no op
        }
      },
    }
  }
}
