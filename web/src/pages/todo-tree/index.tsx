import './style.less'

import Affix from 'antd/lib/affix'
import Button from 'antd/lib/button'
import Divider from 'antd/lib/divider'
import Empty from 'antd/lib/empty'
import message from 'antd/lib/message'
import Popconfirm from 'antd/lib/popconfirm'
import Progress from 'antd/lib/progress'
import Select from 'antd/lib/select'
import Space from 'antd/lib/space'
import Spin from 'antd/lib/spin'
import Tree from 'antd/lib/tree'
import Typography from 'antd/lib/typography'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router'

import CheckOutlined from '@ant-design/icons/CheckOutlined'
import DeleteOutlined from '@ant-design/icons/DeleteOutlined'
import PlusOutlined from '@ant-design/icons/PlusOutlined'
import UndoOutlined from '@ant-design/icons/UndoOutlined'
import { callService } from '@saber2pr/vscode-webview'

import { calcProgressV2 } from '../../../../src/api/calc-progress'
import { IStoreTodoTree, Key, Services } from '../../../../src/api/type'
import { KEY_TODO_TREE } from '../../../../src/constants'
import { MdOptionModal } from '../../components/md-option-modal'
import { OptionsBtn } from '../../components/options-btn'
import { i18n } from '../../i18n'
import {
  appendNode,
  clearDoneNode,
  compileMd,
  getArray,
  insertNode,
  TreeNode,
} from '../../utils'
import { parseUrlParam } from '../../utils/parseUrlParam'
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

  const location = useLocation()
  const params = location?.search ? parseUrlParam(location.search) : {}

  // new node position
  const [addMode, setMode] = useState<'top' | 'bottom'>('bottom')
  const [mounted, setMounted] = useState(false)

  const loadSource = async () => {
    const todo = await callService<Services, 'GetStore'>('GetStore', {
      key: KEY_TODO_TREE,
      path: params?.file,
    })
    if (todo) {
      const val: IStoreTodoTree = todo
      treeRef.current = getArray(val.tree)
      expandKeysRef.current = getArray(val.expandKeys)
      //update
      val.add_mode && setMode(val.add_mode)
      // forceUpdate()
    }
    setMounted(true)
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
          <OptionsBtn
            onCopy={() => node}
            onPaste={copyNode => {
              if (addMode === 'top') {
                insertNode(node.children, copyNode)
              } else {
                appendNode(node.children, copyNode)
              }
              updateTree()
              updateExpandKeys([copyNode.key], 'push')
            }}
          />
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
    if (addMode === 'top') {
      insertNode(getContainer(), node)
    } else {
      appendNode(getContainer(), node)
    }
  }

  const save = async () => {
    const storeVal: IStoreTodoTree = {
      tree: treeRef.current,
      expandKeys: expandKeysRef.current,
      schema:
        'https://github.com/Saber2pr/vsc-ext-todolist/blob/master/src/api/type.ts#L26',
      add_mode: addMode,
    }
    await callService<Services, 'Store'>('Store', {
      key: KEY_TODO_TREE,
      value: JSON.parse(JSON.stringify(storeVal)),
      path: params?.file,
    })
  }

  useEffect(() => {
    if (mounted) {
      save()
    }
  }, [treeRef.current, mounted, addMode])

  const percent = useMemo(
    () => calcProgressV2(treeRef.current),
    [treeRef.current]
  )

  const TITLE = params?.name ?? 'Todo List'

  // md modal
  const [showMdOptionsModal, setShowMdOptionsModal] = useState(false)

  const toolsWrapperRef = useRef<HTMLDivElement>()
  const todoTreeLength = getArray(treeRef.current).length

  return (
    <div className="PageTodoList">
      <div className="layout">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title>{TITLE}</Title>
          <Progress percent={percent} />
        </Space>
        <Divider />
        <div className="tree-wrapper">
          <Spin spinning={!mounted}>
            {todoTreeLength > 0 ? (
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
            ) : (
              <Empty
                description={
                  mounted ? i18n.format('null') : i18n.format('loading')
                }
              />
            )}
          </Spin>
        </div>
        <Affix offsetBottom={0}>
          <div className="tools-wrapper" ref={toolsWrapperRef}>
            <Divider className="tools-wrapper-div" style={{ margin: 0 }} />
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
                  await loadSource()
                  message.success(i18n.format('updateTip'))
                }}
              >
                {i18n.format('update')}
              </Button>
              <Button
                type="text"
                onClick={() => {
                  setShowMdOptionsModal(true)
                }}
              >
                {i18n.format('parsemd')}
              </Button>
              <Select
                getPopupContainer={() => toolsWrapperRef.current}
                bordered={false}
                value={addMode}
                onSelect={value => setMode(value)}
              >
                <Select.Option value="top">
                  {i18n.format('create_mode_top')}
                </Select.Option>
                <Select.Option value="bottom">
                  {i18n.format('create_mode_bottom')}
                </Select.Option>
              </Select>
            </Space>
          </div>
        </Affix>
        <MdOptionModal
          visible={showMdOptionsModal}
          onCancel={() => setShowMdOptionsModal(false)}
          onOk={async values => {
            const tree = treeRef.current
            if (tree) {
              await callService<Services, 'SaveFile'>('SaveFile', {
                path: `${TITLE}.md`,
                content: compileMd(treeRef.current, {
                  noTab: values.useTab === 'no-tab',
                  displayDone: values.displayDone,
                }),
              })
              message.success(i18n.format('createTip'))
              setShowMdOptionsModal(false)
            }
          }}
        />
      </div>
    </div>
  )
}
