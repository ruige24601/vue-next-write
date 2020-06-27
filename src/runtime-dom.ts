export const nodeOps = {
  insert: (child, parent, anchor) => {
    if (anchor) {
      parent.insertBefore(child, anchor)
    } else {
      parent.appendChild(child)
    }
  },

  remove: child => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },

  createElement: tag => document.createElement(tag),

  setElementText: (el, text) => {
    el.textContent = text
  }
}

const onRe = /^on[^a-z]/
const isOn = key => onRe.test(key)
export function hostPatchProps(el, key, prev, next) {
  // 处理事件属性 onClick
  if (isOn(key)) {
    const name = key.slice(2).toLowerCase()
    prev && el.removeEventListener(name, prev)
    next && el.addEventListener(name, next)
  } else {
    // 其他属性
    if (next === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, next)
    }
  }
}
