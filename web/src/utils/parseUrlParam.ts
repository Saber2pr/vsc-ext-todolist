export const parseUrlParam = (url: string) => {
  if (!url || !url.includes('?')) return {} as any
  url = url.split('#')[0]
  const isNumber = /^\d+$/
  return decodeURIComponent(url)
    .split('?')[1]
    .split('&')
    .reduce((out, s) => {
      const union = s.split('=')
      const key = union[0]
      const value = isNumber.test(union[1])
        ? Number(union[1])
        : union[1] || true
      if (key in out) {
        out[key] = [out[key], value]
        return out
      }
      return {
        ...out,
        [key]: value,
      }
    }, {})
}
