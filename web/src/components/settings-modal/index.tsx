import Button from 'antd/lib/button'
import Divider from 'antd/lib/divider'
import Form from 'antd/lib/form'
import Modal from 'antd/lib/modal'
import Select from 'antd/lib/select'
import Space from 'antd/lib/space'
import Typography from 'antd/lib/typography'
import React, { useEffect, useState } from 'react'

import { FormCheckbox } from '../'
import { i18n } from '../../i18n'

const Link = Typography.Link

export interface SettingsProps {
  visible?: boolean
  onCancel: VoidFunction
  onFinish: (values: FormValues) => Promise<void>
  onSaveAs: () => Promise<void>
  onParseMd: () => Promise<void>
  initValues?: FormValues
}

type FormValues = {
  add_mode: 'top' | 'bottom'
  virtual?: boolean
}

export const SettingsModal: React.FC<SettingsProps> = ({
  visible,
  onCancel,
  onFinish,
  initValues,
  onSaveAs,
  onParseMd,
}) => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.resetFields()
  }, [initValues])

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      title={i18n.format('setting')}
      footer={
        <div className="flex space-between align-items-center">
          <Link
            underline
            style={{ fontSize: 12 }}
            href="https://marketplace.visualstudio.com/items?itemName=saber2pr.todolist"
          >
            {i18n.format('shareTip')}
          </Link>
          <Space>
            <Button onClick={onCancel}>{i18n.format('cancel')}</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {i18n.format('confirm')}
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} onFinish={onFinish} initialValues={initValues}>
        <Form.Item
          label={i18n.format('create_mode')}
          tooltip={i18n.format('create_mode_tip')}
          name="add_mode"
        >
          <Select
            options={[
              {
                value: 'top',
                label: i18n.format('create_mode_top'),
              },
              {
                value: 'bottom',
                label: i18n.format('create_mode_bottom'),
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={i18n.format('scroll_virtual')}
          tooltip={i18n.format('scroll_virtual_tip')}
          name="virtual"
        >
          <FormCheckbox />
        </Form.Item>
      </Form>
      <Divider>{i18n.format('more_options')}</Divider>
      <Space split={<Divider type="vertical" />}>
        <Button type="text" onClick={onSaveAs}>
          {i18n.format('save_as')}
        </Button>
        <Button type="text" onClick={onParseMd}>
          {i18n.format('parsemd')}
        </Button>
      </Space>
    </Modal>
  )
}

export interface SettingsModalOps {
  onFinish: (values: FormValues) => Promise<void>
  onSaveAs: () => Promise<void>
  onParseMd: () => Promise<void>
  initValues: FormValues
}

export const useSettingsModal = (ops: SettingsModalOps) => {
  const [visible, setVisible] = useState(false)
  return {
    modal: (
      <SettingsModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onFinish={ops.onFinish}
        initValues={ops.initValues}
        onSaveAs={ops.onSaveAs}
        onParseMd={ops.onParseMd}
      />
    ),
    setVisible,
  }
}
