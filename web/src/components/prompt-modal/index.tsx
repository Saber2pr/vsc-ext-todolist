import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Modal from 'antd/lib/modal'
import React, { useState } from 'react'

import { i18n } from '../../i18n'

export interface PromptModalProps {
  title: string
  value?: string
  placeholder?: string
  onOk: (value: string) => void
  onCancel?: VoidFunction
  visible?: boolean
  type?: 'input' | 'textarea'
}

export const PromptModal: React.FC<PromptModalProps> = ({
  title,
  value,
  placeholder,
  visible,
  onCancel,
  onOk,
  type = 'input',
}) => {
  const [form] = Form.useForm()
  return (
    <Modal
      title={title}
      okText={i18n.format('confirm')}
      cancelText={i18n.format('cancel')}
      onOk={() => form.submit()}
      visible={visible}
      onCancel={onCancel}
      maskClosable={false}
    >
      <Form form={form} onFinish={(values) => onOk(values?.value)}>
        <Form.Item name="value" initialValue={value}>
          {type === 'input' ? (
            <Input placeholder={placeholder} allowClear />
          ) : (
            <Input.TextArea
              autoSize={{
                minRows: 2,
              }}
              placeholder={placeholder}
              allowClear
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  )
}

export interface UsePromptModalOps {
  title: string
  value?: string
  placeholder?: string
  onOk: (value: string) => void
  onCancel: VoidFunction
  type?: PromptModalProps['type']
}

export const usePromptModal = (ops: UsePromptModalOps) => {
  const [visible, setVisible] = useState(false)
  return {
    modal: (
      <PromptModal
        visible={visible}
        onCancel={() => {
          setVisible(false)
          ops.onCancel && ops.onCancel()
        }}
        onOk={ops.onOk}
        title={ops.title}
        value={ops.value}
        placeholder={ops.placeholder}
        type={ops.type}
      />
    ),
    setVisible,
  }
}
