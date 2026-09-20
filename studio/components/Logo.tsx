import React from 'react'

// 工作區圖示：只用 logo 的圓形標記。
// 完整的橫式 logo 塞進這個方形小框會糊掉，而且旁邊本來就有學會名稱。
export function Logo() {
  return (
    <img
      src="/static/mark.png"
      alt=""
      style={{ height: 22, width: 22, display: 'block' }}
    />
  )
}
