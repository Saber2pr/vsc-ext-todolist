import { workspace } from 'vscode'

export const getRootPath = () => workspace?.workspaceFolders?.[0]?.uri?.fsPath
