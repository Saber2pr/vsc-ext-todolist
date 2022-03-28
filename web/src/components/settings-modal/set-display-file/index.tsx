import Button from 'antd/lib/button'
import Divider from 'antd/lib/divider'
import Input from 'antd/lib/input'
import Space from 'antd/lib/space'
import React, { useEffect, useState } from 'react'

import { callService } from '@saber2pr/vscode-webview'

import { i18n } from '../../../i18n'

import type { Services } from '../../../../../src/api/type'
export interface SetDisplayFileProps {
  currentFile: string
  value?: string
  onChange?: (path: string) => void
}

export const SetDisplayFile: React.FC<SetDisplayFileProps> = ({
  currentFile,
  value,
  onChange,
}) => {
  const [loading, setLoading] = useState(false)
  return (
    <Input
      readOnly
      value={value}
      addonAfter={
        <Space split={<Divider type="vertical" />}>
          <Button
            type="text"
            size="small"
            onClick={() => onChange(currentFile)}
          >
            {i18n.format('display_file_set')}
          </Button>
          <Button
            type="text"
            size="small"
            loading={loading}
            onClick={async () => {
              setLoading(true)
              const defaultFile = await callService<
                Services,
                'GetDefaultFilePath'
              >('GetDefaultFilePath', null)
              onChange(defaultFile)
              setLoading(false)
            }}
          >
            {i18n.format('display_file_reset')}
          </Button>
        </Space>
      }
    />
  )
}
