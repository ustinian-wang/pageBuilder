import React from 'react'

type LayoutExampleType = 'top-fixed' | 'bottom-fixed' | 'left-fixed' | 'right-fixed'

interface LayoutExampleProps {
  type?: LayoutExampleType,
  onClick?: () => void,
  active?: boolean
}

export function LayoutExample(props: LayoutExampleProps) {
  let type: LayoutExampleType = props.type || 'top-fixed'
  if (!['top-fixed', 'bottom-fixed', 'left-fixed', 'right-fixed'].includes(type)) {
    type = 'top-fixed'
  }

  let outline = props.active ? '1px solid #007bff' : '1px solid rgb(209 213 219 / var(--tw-border-opacity, 1))'
  
  const wrapStyle: React.CSSProperties = {
    width: '70px',
    height: '70px',
    display: 'flex',
    flexDirection: 'column',
    outline: outline,
    boxSizing: 'border-box',
    padding: '8px',
    gap: '8px',
    borderRadius: '2px',
    cursor: 'pointer',
  }
  const wrapChildStyle : React.CSSProperties = {
    outline: outline,
    borderRadius: '2px',
    boxSizing: 'border-box',
  }
  const fixedSize = '30%'
  if (type === 'top-fixed') {
    return (
      <div style={wrapStyle} onClick={props.onClick}>
        <div style={{ height: fixedSize, ...wrapChildStyle }}></div>
        <div style={{ flex: 1, ...wrapChildStyle }}></div>
      </div>
    )
  } else if (type === 'bottom-fixed') {
    return (
      <div style={wrapStyle} onClick={props.onClick}>
        <div style={{ flex: 1, ...wrapChildStyle }}></div>
        <div style={{ height: fixedSize, ...wrapChildStyle }}></div>
      </div>
    )
  } else if (type === 'left-fixed') {
    // 横向布局
    const rowWrapStyle: React.CSSProperties = { ...wrapStyle, flexDirection: 'row' }
    return (
      <div style={rowWrapStyle} onClick={props.onClick}>
        <div style={{ width: fixedSize, ...wrapChildStyle }}></div>
        <div style={{ flex: 1, ...wrapChildStyle }}></div>
      </div>
    )
  } else {
    // right-fixed
    const rowWrapStyle: React.CSSProperties = { ...wrapStyle, flexDirection: 'row' }
    return (
      <div style={rowWrapStyle} onClick={props.onClick}>
        <div style={{ flex: 1, ...wrapChildStyle }}></div>
        <div style={{ width: fixedSize, ...wrapChildStyle }}></div>
      </div>
    )
  }
}

