import { Checkbox } from 'antd'
import React, { ReactNode } from 'react'

export const FormCheckbox = ({
  children,
  value,
  onChange,
}: {
  children?: ReactNode
  value?: boolean
  onChange?: (value: boolean) => void
}) => {
  return (
    <Checkbox
      checked={value}
      onChange={(event) => onChange(event?.target?.checked)}
    >
      {children}
    </Checkbox>
  )
}
