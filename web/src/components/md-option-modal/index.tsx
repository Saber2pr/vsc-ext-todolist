import './style.less'

import Form from 'antd/lib/form'
import Modal from 'antd/lib/modal'
import Select from 'antd/lib/select'
import React from 'react'

import { i18n } from '../../i18n'

export interface MdOptionModal {
  onOk(values: MdOptions): void
  onCancel(): void
  visible: boolean
}

interface MdUseTabOption {
  label: string
  value: 'use-tab' | 'no-tab'
}

interface MdOptions {
  useTab: MdUseTabOption['value']
}

export const MdOptionModal = ({ onCancel, onOk, visible }: MdOptionModal) => {
  const list: MdUseTabOption[] = [
    {
      label: i18n.format('md_usetab'),
      value: 'use-tab',
    },
    {
      label: i18n.format('md_notab'),
      value: 'no-tab',
    },
  ]
  const [form] = Form.useForm()
  return (
    <Modal
      className="MdOptionModal"
      visible={visible}
      closable
      destroyOnClose
      title={i18n.format('parsemd')}
      okText={i18n.format('confirm')}
      cancelText={i18n.format('cancel')}
      centered
      onCancel={() => onCancel()}
      onOk={() => form.submit()}
      maskClosable
    >
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        onFinish={values => onOk(values)}
      >
        <Form.Item
          label={i18n.format('md_tab')}
          name="useTab"
          initialValue={list[0].value}
        >
          <Select>
            {list.map(item => (
              <Select.Option key={item.label} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}
