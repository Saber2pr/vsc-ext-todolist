import './style.less'
import 'nprogress/nprogress.css'

import {
  Affix,
  Button,
  Divider,
  Dropdown,
  Empty,
  message,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd'
import axios from 'axios'
import nprogress from 'nprogress'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'

import { DEFAULT_PLAYFONTSIZE } from '@/components/words-inputing'
import { globalState } from '@/state'
import { calcProgressV2 } from '@/utils/calc-progress'
import CheckOutlined from '@ant-design/icons/CheckOutlined'
import PlusOutlined from '@ant-design/icons/PlusOutlined'
import UndoOutlined from '@ant-design/icons/UndoOutlined'
import {
  callService,
  isInVscode,
  mockVscodeApi,
} from '@saber2pr/vscode-webview'

import { IStoreTodoTree, Key, Services } from '../../../../src/api/type'
import { KEY_TODO_TREE } from '../../../../src/constants'
import {
  copyNode,
  ItemOptions,
  OptionsBtnProps,
  TodoLevels,
  useCreateItemMenu,
} from '../../components/item-options'
import { MdOptionModal } from '../../components/md-option-modal'
import { useSettingsModal } from '../../components/settings-modal'
import { TodoItem } from '../../components/todo-item'
import { TodoTree } from '../../components/tree'
import { ViewOptions } from '../../components/view-options'
import { i18n } from '../../i18n'
import {
  APP_ARGS,
  appendNodes,
  clearDoneNode,
  cloneTree,
  compileMd,
  findNodeParent,
  getArray,
  getTreeKeys,
  insertNodes,
  insertNodeSibling,
  sortTree,
  TreeNode,
} from '../../utils'
import { parseUrlParam } from '../../utils/parseUrlParam'
import useInterval from 'react-use/lib/useInterval'

const { Title } = Typography

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
      new Set(type === 'push' ? [...expandKeys, ...keys] : keys),
    )
    forceUpdate()
  }

  const treeRef = useRef<TreeNode[]>([])
  const displayFileRef = useRef<string>(null)

  const updateTree = () => {
    const data = treeRef.current
    if (Array.isArray(data)) {
      treeRef.current = data.slice()
    }
    forceUpdate()
    events.forEach((l) => l())
  }

  const location = useLocation()
  const params = location?.search ? parseUrlParam(location.search) : {}
  const navigate = useNavigate()

  const [loaded, setLoaded] = useState(false)
  // settings
  const [addMode, setMode] = useState<'top' | 'bottom'>('bottom')
  const [virtualMode, setVirtual] = useState<boolean>(false)
  const [showLine, setShowLine] = useState<boolean>(false)
  const [playFontSize, setPlayFontSize] = useState<number>(0)
  const [webhook, setWebhook] = useState<string>()

  // for hook message
  useEffect(() => {
    if (webhook) {
      mockVscodeApi.hook = (message) => axios.post(webhook, message)
    } else {
      mockVscodeApi.hook = null
    }
  }, [webhook])

  // init
  const loadSource = async (
    callback?: (tree: IStoreTodoTree['tree']) => IStoreTodoTree['tree'],
  ) => {
    setLoaded(false)
    // config
    const displayFile = await callService<Services, 'GetDisplayFile'>(
      'GetDisplayFile',
      null,
    )
    displayFileRef.current = displayFile
    // load todo file
    const todo = await callService<Services, 'GetStore'>('GetStore', {
      key: KEY_TODO_TREE,
      path: params?.file,
    })
    if (todo) {
      const val: IStoreTodoTree = todo
      treeRef.current = getArray(callback ? callback(val.tree) : val.tree)
      expandKeysRef.current = getArray(val.expandKeys)
      //settings
      val.add_mode && setMode(val.add_mode)
      setVirtual(!!val.virtual)
      setShowLine(!!val.showLine)
      setPlayFontSize(val.playFontSize || DEFAULT_PLAYFONTSIZE)
      setWebhook(val.webhook)
      forceUpdate()
    }
    setLoaded(true)
  }

  useEffect(() => {
    loadSource()
  }, [])

  const deleteNode = (node: TreeNode) => {
    globalState.blockKeyboard = true
    Modal.confirm({
      title: i18n.format('removeItemTip'),
      content: node.todo.content,
      okText: i18n.format('confirm'),
      cancelText: i18n.format('cancel'),
      onOk: () => {
        node.todo.pendingDelete = true
        treeRef.current = clearDoneNode(
          treeRef.current,
          (node) => node.todo.pendingDelete,
        )
        updateTree()
        globalState.blockKeyboard = false
      },
      onCancel() {
        globalState.blockKeyboard = false
      },
    })
  }

  const createNewNode = (node: TreeNode, anchor?: TreeNode) => {
    createNode(() => node.children, anchor)
    updateTree()
    updateExpandKeys([node.key], 'push')
  }

  const pasteNode = async (node: TreeNode) => {
    const temp: TreeNode[] = await callService<Services, 'GetTemp'>('GetTemp', {
      key: KEY_TODO_TREE,
    })
    const tree = cloneTree(temp)
    if (addMode === 'top') {
      insertNodes(node.children, ...tree)
    } else {
      appendNodes(node.children, ...tree)
    }
    updateTree()
    updateExpandKeys([node.key], 'push')
  }

  const addSiblingNode = (node: TreeNode) => {
    const parent = findNodeParent(treeRef.current, node.key)
    if (parent) {
      createNewNode(parent, node)
    } else {
      createNode(() => treeRef.current, node)
      updateTree()
    }
  }

  const Item = ({ node }: { node: TreeNode }) => {
    const [_, setState] = useState({})
    useEffect(() => {
      const listener = () => setState({})
      events.push(listener)
      return () => {
        events = events.filter((l) => l !== listener)
      }
    }, [])
    const todo = node.todo

    let ops = <></>

    const itemOptions: OptionsBtnProps = {
      node,
      onPaste: pasteNode,
      onAddLink: (link) => {
        todo.link = link
        updateTree()
      },
      onAddComment: (tip) => {
        todo.tip = tip
        updateTree()
      },
      onCollapseAll: (node) => {
        const keys = getTreeKeys(node)
        const keysMap = keys.reduce((acc, k) => ({ ...acc, [k]: k }), {})
        const currentKeys = getArray(expandKeysRef.current)
        const nextKeys = currentKeys.filter((k) => !keysMap[k])
        updateExpandKeys(nextKeys, 'replace')
      },
      onExpandAll: (node) => {
        const keys = getTreeKeys(node)
        updateExpandKeys(keys, 'push')
      },
      onDelete: () => deleteNode(node),
    }
    const itemMenu = useCreateItemMenu(itemOptions)

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
            onSelect={(level) => {
              todo.level = level
              updateTree()
            }}
            options={Object.keys(TodoLevels).map((level) => ({
              label: `P${TodoLevels[level]}`,
              value: level,
            }))}
          />
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            onClick={() => createNewNode(node)}
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
          <ItemOptions {...itemOptions} />
        </>
      )
    }

    return (
      <Dropdown
        trigger={['contextMenu']}
        overlay={isInVscode ? itemMenu : <></>}
      >
        <Space className="todo">
          <TodoItem todo={todo} onChange={() => updateTree()} />
          {isInVscode && ops}
        </Space>
      </Dropdown>
    )
  }

  const createNode = (getContainer: () => TreeNode[], anchor?: TreeNode) => {
    const key = Date.now()

    const node: TreeNode = {
      key,
      children: [],
      todo: {
        content: i18n.format('item_placeholder'),
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

    if (anchor) {
      insertNodeSibling(
        getContainer(),
        anchor.key,
        node,
        addMode === 'bottom' ? 'after' : 'before',
      )
    } else {
      if (addMode === 'top') {
        insertNodes(getContainer(), node)
      } else {
        appendNodes(getContainer(), node)
      }
    }
  }

  const autoRefreshInterval = isInVscode ? null : 3000
  useInterval(() => {
    if (!isInVscode) {
      isMounted.current = false
      loadSource()
    }
  }, autoRefreshInterval)

  const save = async () => {
    isInVscode && nprogress.start()
    const storeVal: IStoreTodoTree = {
      tree: treeRef.current,
      expandKeys: expandKeysRef.current,
      schema:
        'https://github.com/Saber2pr/vsc-ext-todolist/blob/master/src/api/type.ts#L3',
      add_mode: addMode,
      virtual: virtualMode,
      showLine: showLine,
      playFontSize: playFontSize,
      webhook: webhook,
    }
    const tree = JSON.parse(JSON.stringify(storeVal))
    await callService<Services, 'Store'>('Store', {
      key: KEY_TODO_TREE,
      value: tree,
      path: params?.file,
    })
    isInVscode && nprogress.done()
    return {
      [KEY_TODO_TREE]: tree,
    }
  }

  // first render expandKeys
  useEffect(() => {
    // after tree rendered
    if (!isMounted.current) {
      updateExpandKeys(getArray(expandKeysRef.current), 'replace')
    }
  }, [treeRef.current])

  const isMounted = useRef(false)
  useEffect(() => {
    if (isMounted.current) {
      save()
    }
    if (loaded) {
      isMounted.current = true
    }
  }, [
    loaded,
    treeRef.current,
    expandKeysRef.current,
    addMode,
    virtualMode,
    showLine,
    playFontSize,
    webhook,
  ])

  const percent = useMemo(
    () => calcProgressV2(treeRef.current),
    [treeRef.current],
  )

  let TITLE = params?.name ?? 'Todo List'
  if (TITLE === '.todolistrc') {
    TITLE = 'Todo List'
  }

  // md modal
  const [showMdOptionsModal, setShowMdOptionsModal] = useState(false)

  const toolsWrapperRef = useRef<HTMLDivElement>()
  const todoTreeLength = getArray(treeRef.current).length

  // settings
  const { modal, setVisible } = useSettingsModal({
    options: {
      currentFile: params?.file,
    },
    initValues: {
      add_mode: addMode,
      virtual: virtualMode,
      displayFile: displayFileRef.current,
      showLine,
      playFontSize,
      webhook,
    },
    async onFinish(values) {
      const isChangeDisplay = values?.displayFile !== displayFileRef.current
      if (isChangeDisplay && values?.displayFile) {
        await callService<Services, 'SetConfig'>('SetConfig', {
          key: 'displayFile',
          value: values?.displayFile,
        })
        await callService<Services, 'reload'>('reload', null)
      }
      setMode(values?.add_mode)
      setVirtual(!!values?.virtual)
      setShowLine(!!values?.showLine)
      setPlayFontSize(values?.playFontSize || DEFAULT_PLAYFONTSIZE)
      setWebhook(values?.webhook)
      message.success(i18n.format('settingTip'))
      setVisible(false)
    },
    async onSaveAs() {
      const content = await save()
      await callService<Services, 'SaveFileAs'>('SaveFileAs', {
        title: i18n.format('save_file'),
        content: JSON.stringify(content),
        name: `${TITLE}.todo`,
      })
    },
    async onParseMd() {
      setShowMdOptionsModal(true)
    },
    async onPlay() {
      navigate(`/play?file=${APP_ARGS.file}&name=${APP_ARGS?.name}`)
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
          <Spin
            spinning={isInVscode ? !loaded : false}
            tip={i18n.format('loading')}
          >
            {todoTreeLength > 0 ? (
              <TodoTree
                showLine={showLine}
                virtualMode={virtualMode}
                titleRender={(node: TreeNode) => <Item node={node} />}
                expandedKeys={expandKeysRef.current}
                onExpand={(keys) => updateExpandKeys(keys, 'replace')}
                handleDrop={(data) => {
                  treeRef.current = data
                  updateTree()
                }}
                onKeydown={(key, node, event) => {
                  if (key === 'tab') {
                    createNewNode(node)
                  }
                  if (key === 'enter') {
                    addSiblingNode(node)
                  }
                  if (key === 'backspace' || key === 'delete') {
                    deleteNode(node)
                  }
                  const ctrl = event.ctrlKey || event.metaKey
                  if (ctrl) {
                    if (key === 'c' || key === 'C') {
                      copyNode(node)
                    }
                    if (key === 'v' || key === 'V') {
                      pasteNode(node)
                    }
                  }
                }}
                treeData={treeRef.current}
                itemOptions={null}
              />
            ) : loaded ? (
              <Empty description={i18n.format('null')} />
            ) : (
              <div style={{ height: 100 }}></div>
            )}
          </Spin>
        </div>
        {isInVscode && (
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
                      (node) => node.todo.done,
                    )
                    updateTree()
                  }}
                  okText={i18n.format('confirm')}
                  cancelText={i18n.format('cancel')}
                >
                  <Button type="text">{i18n.format('clearDone')}</Button>
                </Popconfirm>
                <ViewOptions
                  tree={getArray(treeRef.current)}
                  onUpdate={async () => {
                    isMounted.current = false
                    await loadSource()
                    message.success(i18n.format('updateTip'))
                  }}
                  onSort={async () => {
                    await loadSource(sortTree)
                    message.success(i18n.format('sort_tip'))
                  }}
                  onCollapseAll={() => {
                    updateExpandKeys([], 'replace')
                  }}
                  onExpandAll={() => {
                    const keys = getTreeKeys(...treeRef.current)
                    updateExpandKeys(keys, 'replace')
                  }}
                  onPaste={(copyTree) => {
                    const current = getArray(treeRef.current)
                    const newNodes = getArray(copyTree)
                    if (addMode === 'top') {
                      treeRef.current = newNodes.concat(current)
                    } else {
                      treeRef.current = current.concat(newNodes)
                    }
                    updateTree()
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
        )}
        <MdOptionModal
          visible={showMdOptionsModal}
          onCancel={() => setShowMdOptionsModal(false)}
          onOk={async (values) => {
            const tree = treeRef.current
            if (tree) {
              await callService<Services, 'SaveFile'>('SaveFile', {
                title: i18n.format('save_md'),
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
