import { nodeOps, hostPatchProps } from './runtime-dom'
import { effect } from './reactivity'
import { E2BIG } from 'constants'

export * from './reactivity'
export * from './runtime-dom'

let rootContainer
export function render(vnode, container) {
  patch(container._vnode || null, vnode, container)
  container._vnode = vnode // 下载渲染时, container._vnode就成为了旧节点
}

// n1 : 旧的虚拟节点
// n2 : 新的虚拟节点
function patch(n1, n2, container) {
  if (typeof n2.type === 'string') {
    processElment(n1, n2, container)
  } else if (typeof n2.type === 'object') {
    mountComponent(n2, container)
  }
}

function mountComponent(vnode, container) {
  const instance = {
    vnode,
    type: vnode.type,
    render: null, // setup() 的返回结果
    subTree: null
  }

  const Component = instance.type
  instance.render = Component.setup()

  effect(() => {
    instance.subTree = instance.render && instance.render()

    if (container === rootContainer) {
      container.childNodes[0] && nodeOps.remove(container.childNodes[0])
    }
    patch(null, instance.subTree, container)
  })
}

function processElment(n1, n2, container) {
  if (n1 === null) {
    mountElement(n2, container)
  } else {
    patchElement(n1, n2, container)
  }
}

function patchElement(n1, n2, container) {
  const el = (n2.el = n1.el)
  const oldProps = n1.props
  const newProps = n2.props
  // 比较属性
  patchProps(el, n2, oldProps, newProps)
  // 比较子节点

  patchChildren(n1, n2, el)
}

function patchChildren(n1, n2, container) {
  const c1 = n1 && n1.children
  const c2 = n2.children
  if (typeof c2 === 'string') {
    // array -> string
    if (Array.isArray(c1)) {
      unmountChildren(c1)
    }
    // string -> string
    if (c1 !== c2) {
      nodeOps.setElementText(container, c2)
    }
  } else {
    // c2: array
    // string -> array
    if (typeof c1 === 'string') {
      nodeOps.setElementText(container, '')
      mountChildren(c2, container)
    }
    // array -> array
    patchKeyedChildren(c1, c2, container)
  }
}

function patchKeyedChildren(c1, c2, container) {
  let i
  let e1 = c1.length - 1
  let e2 = c2.length - 1
  const keyToNewIndexMap = new Map()
  for (i = 0; i <= e2; i++) {
    const nextChild = c2[i]
    keyToNewIndexMap.set(nextChild.props.key, i)
  }

  const newIndexToOldIndexMap = new Array(e2 + 1)
  for (i = 0; i <= e2; i++) newIndexToOldIndexMap[i] = -1
  for (i = 0; i <= e1; i++) {
    const prevChild = c1[i]
    let newIndex = keyToNewIndexMap.get(prevChild.props.key)
    if (newIndex === undefined) {
      // 删除
      unmount(prevChild)
    } else {
      newIndexToOldIndexMap[newIndex] = i
      // 更新，但不移动位置
      patch(prevChild, c2[newIndex], container)
    }
  }

  const sequence = getSequence(newIndexToOldIndexMap)
  let j = sequence.length - 1
  for (i = e2; i >= 0; i--) {
    const newChild = c2[i]

    const anchor = i + 1 <= e2 ? c2[i + 1].el : null
    if (newIndexToOldIndexMap[i] === -1) {
      // 新增
      patch(null, newChild, container)
    } else {
      if (i == sequence[j]) {
        j--
      } else {
        move(newChild, container, anchor)
      }
    }
  }
}

function move(vnode, container, anchor) {
  nodeOps.insert(vnode.el, container, anchor)
}

function unmountChildren(children) {
  for (let i = 0; i < children.length; i++) {
    unmount(children[i])
  }
}

function unmount(child) {
  nodeOps.remove(child.el)
}

function patchProps(el, n2, oldProps, newProps) {
  if (oldProps !== newProps) {
    // 新的属性有，就渲染
    for (const key in newProps) {
      const next = newProps[key]
      const prev = oldProps[key]
      if (next !== prev) {
        hostPatchProps(el, key, prev, next)
      }
    }
    // 旧的属性有，但新的属性没有，就删除
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProps(el, key, oldProps[key], null)
      }
    }
  }
}

function mountElement(vnode, container) {
  const { type, props, children } = vnode
  let el = (vnode.el = nodeOps.createElement(type))

  if (props) {
    for (const key in props) {
      hostPatchProps(el, key, null, props[key])
    }
  }

  if (typeof children === 'string') {
    nodeOps.setElementText(el, children)
  } else if (Array.isArray(children)) {
    mountChildren(children, el)
  }

  nodeOps.insert(el, container, null)
}

function mountChildren(children, container) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    patch(null, child, container)
  }
}

// https://leetcode-cn.com/problems/longest-increasing-subsequence/

function getSequence(arr) {
  const p = arr.slice()
  // 子序列的索引 [0,1,3,5]
  const result = [0]

  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    // 在末尾插入数据
    j = result[result.length - 1]
    if (arr[j] < arrI) {
      p[i] = j
      result.push(i)
      continue
    }
    // 更新数组
    u = 0
    v = result.length - 1
    while (u < v) {
      c = ((u + v) / 2) | 0
      if (arr[result[c]] < arrI) {
        u = c + 1
      } else {
        v = c
      }
    }
    if (u > 0) {
      p[i] = result[u - 1]
    }
    result[u] = i
  }

  u = result.length - 1
  v = result[u]
  while (u >= 0) {
    result[u] = v
    v = p[v]
    u--
  }

  return result
}
