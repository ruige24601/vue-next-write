export function render(vnode, container) {
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  const { type, props, children } = vnode
  let el = document.createElement(type)

  el.textContent = children

  container.appendChild(el)
}
