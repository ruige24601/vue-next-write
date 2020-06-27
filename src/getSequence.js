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
      c = (u + v) / 2 | 0
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

console.log(getSequence([1, 2, 5, 3, 0, 4]))
// 最长上升子序列 [1,2,3,4]

// 输出索引 [0,1,3,5]