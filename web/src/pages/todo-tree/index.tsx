import './style.less'

import Button from 'antd/lib/button'
import Divider from 'antd/lib/divider'
import message from 'antd/lib/message'
import Popconfirm from 'antd/lib/popconfirm'
import Progress from 'antd/lib/progress'
import Select from 'antd/lib/select'
import Space from 'antd/lib/space'
import Tree from 'antd/lib/tree'
import Typography from 'antd/lib/typography'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import CheckOutlined from '@ant-design/icons/CheckOutlined'
import DeleteOutlined from '@ant-design/icons/DeleteOutlined'
import PlusOutlined from '@ant-design/icons/PlusOutlined'
import UndoOutlined from '@ant-design/icons/UndoOutlined'
import { callService } from '@saber2pr/vscode-webview'

import { calcProgressV2 } from '../../../../src/api/calc-progress'
import { IStoreTodoTree, Key, Services } from '../../../../src/api/type'
import { KEY_TODO_TREE } from '../../../../src/constants'
import { i18n } from '../../i18n'
import { appendNode, clearDoneNode, getArray, TreeNode } from '../../utils'
import { treeDrop } from '../../utils/treeDrop'

const { Text, Title } = Typography

let events: VoidFunction[] = []

export const PageTodoTree = () => {
  const [_, setState] = useState({})
  const forceUpdate = () => setState({})

  const expandKeysRef = useRef<Key[]>([])
  const updateExpandKeys = (keys: Key[], type: 'push' | 'replace' = 'push') => {
    const expandKeys = getArray(expandKeysRef.current)
    expandKeysRef.current = Array.from(
      new Set(type === 'push' ? [...expandKeys, ...keys] : keys)
    )
    forceUpdate()
  }

  const treeRef = useRef<TreeNode[]>([])

  const updateTree = () => {
    const data = treeRef.current
    if (Array.isArray(data)) {
      treeRef.current = data.slice()
    }
    forceUpdate()
    events.forEach(l => l())
  }

  const loadSource = async () => {
    callService<Services, 'GetStore'>('GetStore', KEY_TODO_TREE).then(todo => {
      if (todo) {
        const val: IStoreTodoTree = todo
        treeRef.current = getArray(val.tree)
        expandKeysRef.current = getArray(val.expandKeys)
        forceUpdate()
      }
    })
  }

  useEffect(() => {
    loadSource()
  }, [])

  const Item = ({ node }: { node: TreeNode }) => {
    const [_, setState] = useState({})
    useEffect(() => {
      const listener = () => setState({})
      events.push(listener)
      return () => {
        events = events.filter(l => l !== listener)
      }
    }, [])
    const todo = node.todo

    let ops = <></>
    if (todo.done) {
      ops = (
        <>
          <Button
            size="small"
            type="text"
            icon={<UndoOutlined />}
            onClick={() => {
              todo.done = false
              updateTree()
            }}
          />
        </>
      )
    } else {
      ops = (
        <>
          <Select
            bordered={false}
            size="small"
            value={todo.level}
            onSelect={level => {
              todo.level = level
              updateTree()
            }}
          >
            <Select.Option value="danger">P0</Select.Option>
            <Select.Option value="warning">P1</Select.Option>
            <Select.Option value="success">P2</Select.Option>
            <Select.Option value="default">P3</Select.Option>
            <Select.Option value="secondary">P4</Select.Option>
          </Select>
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            onClick={() => {
              createNode(() => node.children)
              updateTree()
              updateExpandKeys([node.key], 'push')
            }}
          />
          <Button
            size="small"
            type="text"
            icon={<CheckOutlined />}
            onClick={() => {
              todo.done = true
              updateTree()
            }}
          />
          <Popconfirm
            placement="topLeft"
            title={i18n.format('removeItemTip')}
            onConfirm={() => {
              todo.pendingDelete = true
              treeRef.current = clearDoneNode(
                treeRef.current,
                node => node.todo.pendingDelete
              )
              updateTree()
            }}
            okText={i18n.format('confirm')}
            cancelText={i18n.format('cancel')}
          >
            <Button size="small" type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      )
    }

    return (
      <Space className="todo">
        <Text
          delete={todo.done}
          type={todo.level === 'default' ? null : todo.level}
          disabled={todo.done ? true : false}
          editable={
            todo.done
              ? false
              : {
                  tooltip: false,
                  onChange: value => {
                    todo.content = value
                    updateTree()
                  },
                }
          }
        >
          {todo.content}
        </Text>
        {ops}
      </Space>
    )
  }

  const createNode = (getContainer: () => TreeNode[]) => {
    const key = Date.now()

    const node: TreeNode = {
      key,
      children: [],
      todo: {
        content: 'edit todo.',
        id: key,
        level: 'default',
        done: false,
      },
      toJSON: () => ({
        key: node.key,
        children: node.children,
        todo: node.todo,
      }),
    }
    appendNode(getContainer(), node)
  }

  const save = async () => {
    const storeVal: IStoreTodoTree = {
      tree: treeRef.current,
      expandKeys: expandKeysRef.current,
    }
    await callService<Services, 'Store'>('Store', {
      key: KEY_TODO_TREE,
      value: JSON.parse(JSON.stringify(storeVal)),
    })
  }

  useEffect(() => {
    save()
  }, [treeRef.current])

  const percent = useMemo(
    () => calcProgressV2(treeRef.current),
    [treeRef.current]
  )

  return (
    <div className="PageTodoList">
      <div className="layout">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title>Todo List</Title>
          <Progress percent={percent} />
        </Space>
        <Divider />
        <Tree
          titleRender={(node: TreeNode) => <Item node={node} />}
          expandedKeys={expandKeysRef.current}
          onExpand={keys => updateExpandKeys(keys, 'replace')}
          draggable
          blockNode
          onDrop={treeDrop(treeRef.current, data => {
            treeRef.current = data
            updateTree()
          })}
          treeData={treeRef.current}
        />
        <Divider />
        <Space split={<Divider type="vertical" />}>
          <Button
            type="text"
            onClick={() => {
              createNode(() => treeRef.current)
              updateTree()
            }}
          >
            {i18n.format('newItem')}
          </Button>
          <Button
            type="text"
            onClick={async () => {
              await save()
              message.success(i18n.format('saveTip'))
            }}
          >
            {i18n.format('save')}
          </Button>
          <Popconfirm
            placement="top"
            title={i18n.format('clearDoneTip')}
            onConfirm={() => {
              treeRef.current = clearDoneNode(
                treeRef.current,
                node => node.todo.done
              )
              updateTree()
            }}
            okText={i18n.format('confirm')}
            cancelText={i18n.format('cancel')}
          >
            <Button type="text">{i18n.format('clearDone')}</Button>
          </Popconfirm>
          <Button
            type="text"
            onClick={async () => {
              await callService<Services, 'RefreshStore'>('RefreshStore', null)
              await loadSource()
              message.success(i18n.format('updateTip'))
            }}
          >
            {i18n.format('update')}
          </Button>
        </Space>
      </div>
    </div>
  )
}
