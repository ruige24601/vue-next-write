let activeEffect
export function effect(fn) {
  activeEffect = fn
  fn()
  // activeEffect = null
}

export function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // const res = target[key]
      const res = Reflect.get(target, key, receiver)
      track(target, key)
      return res
    },
    set(target, key, value, receiver) {
      // target[key] = value
      const res = Reflect.set(target, key, value, receiver)

      // activeEffect && activeEffect()
      trigger(target, key, value)
      return res
    }
  })
}

type Dep = Set<any>
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()
// target -> key -> deps
// {
//   state:{
//     count: [fn1, fn2]
//     name: [fn3, fn4]
//   }
// }
export function track(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  if (activeEffect && !deps.has(activeEffect)) {
    deps.add(activeEffect)
  }
}

export function trigger(target, key, val) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const effects = depsMap.get(key)
  effects && effects.forEach(effect => effect())
}
