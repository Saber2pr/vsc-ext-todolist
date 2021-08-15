import vscode from 'vscode'

export const isActiveThemeKind = (kind: vscode.ColorThemeKind) =>
  vscode.window.activeColorTheme.kind === kind
