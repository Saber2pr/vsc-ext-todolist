import './style.less'
import 'nprogress/nprogress.css'

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
import nprogress from 'nprogress'
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
import { ItemOptions } from '../../components/item-options'
import { useSettingsModal } from '../../components/settings-modal'
import { i18n } from '../../i18n'
import {
  appendNode,
  clearDoneNode,
  compileMd,
  getArray,
  insertNode,
  mapTree,
  TreeNode,
} from '../../utils'
import { parseUrlParam } from '../../utils/parseUrlParam'
import { treeDrop } from '../../utils/treeDrop'
import { TodoItem } from '../../components/todo-item'
import { ViewOptions } from '../../components/view-options'

const { Text, Title, Link } = Typography

let events: VoidFunction[] = []

nprogress.configure({
  showSpinner: false,
})

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

  const [loaded, setLoaded] = useState(false)
  // settings
  const [addMode, setMode] = useState<'top' | 'bottom'>('bottom')
  const [virtualMode, setVirtual] = useState<boolean>(false)

  // init
  const loadSource = async () => {
    setLoaded(false)
    const todo = await callService<Services, 'GetStore'>('GetStore', {
      key: KEY_TODO_TREE,
      path: params?.file,
    })
    if (todo) {
      const val: IStoreTodoTree = todo
      treeRef.current = getArray(val.tree)
      expandKeysRef.current = getArray(val.expandKeys)
      //settings
      val.add_mode && setMode(val.add_mode)
      setVirtual(!!val.virtual)
      forceUpdate()
    }
    setLoaded(true)
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
          <ItemOptions
            node={node}
            onPaste={copyNode => {
              if (addMode === 'top') {
                insertNode(node.children, copyNode)
              } else {
                appendNode(node.children, copyNode)
              }
              updateTree()
              updateExpandKeys([copyNode.key], 'push')
            }}
            onAddLink={link => {
              todo.link = link
              updateTree()
            }}
          />
        </>
      )
    }

    return (
      <Space className="todo">
        <TodoItem todo={todo} onChange={() => updateTree()} />
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
    nprogress.start()
    const storeVal: IStoreTodoTree = {
      tree: treeRef.current,
      expandKeys: expandKeysRef.current,
      schema:
        'https://github.com/Saber2pr/vsc-ext-todolist/blob/master/src/api/type.ts#L3',
      add_mode: addMode,
      virtual: virtualMode,
    }
    const tree = JSON.parse(JSON.stringify(storeVal))
    await callService<Services, 'Store'>('Store', {
      key: KEY_TODO_TREE,
      value: tree,
      path: params?.file,
    })
    nprogress.done()
    return {
      [KEY_TODO_TREE]: tree,
    }
  }

  const isMounted = useRef(false)
  useEffect(() => {
    if (isMounted.current) {
      save()
    }
    if (loaded) {
      isMounted.current = true
    }
  }, [loaded, treeRef.current, expandKeysRef.current, addMode, virtualMode])

  const percent = useMemo(
    () => calcProgressV2(treeRef.current),
    [treeRef.current]
  )

  const TITLE = params?.name ?? 'Todo List'

  // md modal
  const [showMdOptionsModal, setShowMdOptionsModal] = useState(false)

  const toolsWrapperRef = useRef<HTMLDivElement>()
  const todoTreeLength = getArray(treeRef.current).length

  // settings
  const { modal, setVisible } = useSettingsModal({
    initValues: {
      add_mode: addMode,
      virtual: virtualMode,
    },
    async onFinish(values) {
      setMode(values?.add_mode)
      setVirtual(!!values?.virtual)
      message.success(i18n.format('settingTip'))
      setVisible(false)
    },
    async onSaveAs() {
      const content = await save()
      await callService<Services, 'SaveFileAs'>('SaveFileAs', {
        content: JSON.stringify(content),
        name: `${TITLE}.todo`,
      })
    },
    async onParseMd() {
      setShowMdOptionsModal(true)
    },
  })

  return (
    <div className="PageTodoList">
      <div className="layout">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title>{TITLE}</Title>
          <Progress percent={percent} />
        </Space>
        <Divider />
        <div className="tree-wrapper">
          <Spin spinning={!loaded} tip={i18n.format('loading')}>
            {todoTreeLength > 0 ? (
              <Tree
                motion={null}
                height={virtualMode ? 500 : undefined}
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
            ) : loaded ? (
              <Empty description={i18n.format('null')} />
            ) : (
              <div style={{ height: 100 }}></div>
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
              <ViewOptions
                onUpdate={async () => {
                  await loadSource()
                  message.success(i18n.format('updateTip'))
                }}
                onCollapseAll={() => {
                  updateExpandKeys([], 'replace')
                }}
                onExpandAll={() => {
                  const keys = []
                  mapTree(treeRef.current, node => {
                    node.key && keys.push(node.key)
                    return node
                  })
                  updateExpandKeys(keys, 'replace')
                }}
              />
              <Button
                type="text"
                onClick={() => {
                  setVisible(true)
                }}
              >
                {i18n.format('setting')}
              </Button>
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
                  displayLink: values.displayLink,
                }),
              })
              message.success(i18n.format('createTip'))
              setShowMdOptionsModal(false)
            }
          }}
        />
        {modal}
      </div>
    </div>
  )
}
