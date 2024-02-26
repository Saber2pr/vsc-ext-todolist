import { workspace } from 'vscode'

export const getThemeName = () =>
  String(workspace.getConfiguration().get<string>('workbench.colorTheme'))
