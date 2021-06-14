import './style.less'

import Button from 'antd/lib/button'
import List from 'antd/lib/list'
import message from 'antd/lib/message'
import Popconfirm from 'antd/lib/popconfirm'
import Progress from 'antd/lib/progress'
import Select from 'antd/lib/select'
import Space from 'antd/lib/space'
import Typography from 'antd/lib/typography'
import React, { useMemo } from 'react'

import CheckOutlined from '@ant-design/icons/CheckOutlined'
import DeleteOutlined from '@ant-design/icons/DeleteOutlined'
import UndoOutlined from '@ant-design/icons/UndoOutlined'

import { calcProgress } from '../../../../src/api/calc-progress'
import { TodoItem } from '../../components'
import { useTodoList } from '../../hooks'
import { i18n } from '../../i18n'
import { getArray, IdList } from '../../utils'

const { Title } = Typography

export const PageTodoList = () => {
  const [todos, updateList, todo] = useTodoList()

  const percent = useMemo(() => calcProgress(todos), [todos])

  return (
    <div className="PageTodoList">
      <div className="layout">
        <List
          header={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title>Todo List</Title>
              <Progress percent={percent} />
            </Space>
          }
          footer={
            <Space>
              <Button
                type="text"
                onClick={() => {
                  todo.push(
                    IdList.createItem({
                      content: 'edit todo',
                      done: false,
                      level: 'default',
                    })
                  )
                  updateList()
                }}
              >
                {i18n.format('newItem')}
              </Button>
              <Button
                type="text"
                onClick={() => message.success(i18n.format('saveTip'))}
              >
                {i18n.format('save')}
              </Button>
              <Popconfirm
                placement="top"
                title={i18n.format('clearDoneTip')}
                onConfirm={() => {
                  todo.clear(item => item.done)
                  updateList()
                }}
                okText={i18n.format('confirm')}
                cancelText={i18n.format('cancel')}
              >
                <Button type="text">{i18n.format('clearDone')}</Button>
              </Popconfirm>
            </Space>
          }
          bordered
          dataSource={getArray(todos)}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={
                item.done
                  ? [
                      <Button
                        size="small"
                        type="text"
                        icon={<UndoOutlined />}
                        onClick={() => {
                          todo.update(item.id, { done: false })
                          updateList()
                        }}
                      />,
                    ]
                  : [
                      <Select
                        bordered={false}
                        size="small"
                        value={item.level}
                        onSelect={level => {
                          todo.update(item.id, { level })
                          updateList()
                        }}
                      >
                        <Select.Option value="danger">P0</Select.Option>
                        <Select.Option value="warning">P1</Select.Option>
                        <Select.Option value="success">P2</Select.Option>
                        <Select.Option value="default">P3</Select.Option>
                        <Select.Option value="secondary">P4</Select.Option>
                      </Select>,
                      <Button
                        size="small"
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={() => {
                          todo.update(item.id, { done: true })
                          updateList()
                        }}
                      />,
                      <Popconfirm
                        placement="topLeft"
                        title={i18n.format('removeItemTip')}
                        onConfirm={() => {
                          todo.delete(item.id)
                          updateList()
                        }}
                        okText={i18n.format('confirm')}
                        cancelText={i18n.format('cancel')}
                      >
                        <Button
                          size="small"
                          type="text"
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>,
                    ]
              }
            >
              <List.Item.Meta
                description={
                  <TodoItem
                    {...item}
                    onEditEnd={content => {
                      todo.update(item.id, { content })
                      updateList()
                    }}
                  />
                }
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}
