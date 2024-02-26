export const getSystemType = () => {
  if (process.platform === 'darwin') {
    return 'mac'
  } else if (process.platform === 'win32') {
    return 'win'
  }
  return 'linux'
}
