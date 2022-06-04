import { useEffect, useState } from 'react'

export type UseAsyncOps<T> = {
  manual: boolean
  onSuccess?(result?: T): any
  onError?(err?: Error): any
}

export type UseAsyncResult<A extends any[], T> = {
  data: T
  loading: boolean
  setData(data: T): void
  run: (...args: A) => Promise<T>
}

export function useAsync<A extends any[], T = any>(
  run: (...args: A) => Promise<T>,
): UseAsyncResult<A, T>
export function useAsync<A extends any[], T = any>(
  run: (...args: A) => Promise<T>,
  deps: any[],
): UseAsyncResult<A, T>
export function useAsync<A extends any[], T = any>(
  run: (...args: A) => Promise<T>,
  deps: any[],
  ops: UseAsyncOps<T>,
): UseAsyncResult<A, T>

export function useAsync<A extends any[], T = any>(
  run: (...args: A) => Promise<T>,
  deps: any[] = [],
  ops?: UseAsyncOps<T>,
): UseAsyncResult<A, T> {
  const [data, setData] = useState<T>()
  const [loading, setLoading] = useState<boolean>()

  const main = async (...args: any) => {
    try {
      setLoading(true)
      const result = await run(...args)
      if (ops?.onSuccess) {
        await ops?.onSuccess(result)
      }
      setData(result)
      return result
    } catch (error) {
      if (ops?.onError) {
        await ops?.onError(error)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!ops?.manual) {
      main()
    }
  }, [ops?.manual, ...deps])

  return {
    data,
    loading,
    run: main,
    setData,
  }
}
