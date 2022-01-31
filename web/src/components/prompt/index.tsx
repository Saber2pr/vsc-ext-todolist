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
}

export const PromptModal: React.FC<PromptModalProps> = ({
  title,
  value,
  placeholder,
  visible,
  onCancel,
  onOk,
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
      <Form form={form} onFinish={values => onOk(values?.value)}>
        <Form.Item name="value" initialValue={value}>
          <Input placeholder={placeholder} />
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
}

export const usePromptModal = (ops: UsePromptModalOps) => {
  const [visible, setVisible] = useState(false)
  return {
    modal: (
      <PromptModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={ops.onOk}
        title={ops.title}
        value={ops.value}
        placeholder={ops.placeholder}
      />
    ),
    setVisible,
  }
}
