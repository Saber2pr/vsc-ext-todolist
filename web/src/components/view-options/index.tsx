import { Button, Dropdown, Menu } from 'antd'
import React from 'react'
import MoreOutlined from '@ant-design/icons/MoreOutlined'

import { i18n } from '../../i18n'

export interface ViewOptionsProps {
  onUpdate: VoidFunction
  onExpandAll: VoidFunction
  onCollapseAll: VoidFunction
}

export const ViewOptions: React.FC<ViewOptionsProps> = ({
  onCollapseAll,
  onExpandAll,
  onUpdate,
}) => {
  const menu = (
    <Menu>
      <Menu.Item onClick={onUpdate}>{i18n.format('update')}</Menu.Item>
      <Menu.Item onClick={onCollapseAll}>
        {i18n.format('collapseAll')}
      </Menu.Item>
      <Menu.Item onClick={onExpandAll}>{i18n.format('expandAll')}</Menu.Item>
    </Menu>
  )

  return (
    <Dropdown placement="topCenter" trigger={['click']} overlay={menu}>
      <Button type="text">
        {i18n.format('viewOps')}
        <MoreOutlined />
      </Button>
    </Dropdown>
  )
}
