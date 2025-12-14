import { Element, ElementType } from '../types'

// Vue 2 代码生成器
export class VueGenerator {
  private indent = 0
  private indentSize = 2

  private indentStr(): string {
    return ' '.repeat(this.indent * this.indentSize)
  }

  private formatStyle(style?: Record<string, string | number>): string {
    if (!style || Object.keys(style).length === 0) {
      return ''
    }
    const styleEntries = Object.entries(style).map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}: ${typeof value === 'number' ? `${value}px` : value}`
    })
    return ` style="${styleEntries.join('; ')}"`
  }

  /**
   * 生成组件类名（用于代码搜索定位）
   * 格式：pb-{type}，例如：pb-button, pb-container
   */
  private getComponentClassName(type: ElementType): string {
    return `pb-${type}`
  }

  /**
   * 合并类名（组件类名 + 用户自定义类名）
   */
  private mergeClassNames(componentClass: string, userClassName?: string): string {
    const classes = [componentClass]
    if (userClassName) {
      classes.push(userClassName)
    }
    return classes.join(' ')
  }

  private formatProps(props: Record<string, any>, excludeClassName: boolean = true): string {
    const propEntries = Object.entries(props)
      .filter(([key, value]) => {
        // 排除 className，因为它已经在 classNameStr 中处理了
        if (excludeClassName && key === 'className') {
          return false
        }
        return value !== undefined && value !== null && value !== ''
      })
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? key : ''
        }
        if (typeof value === 'string') {
          return `${key}="${value}"`
        }
        return `:${key}="${JSON.stringify(value)}"`
      })
      .filter(Boolean)
    return propEntries.length > 0 ? ' ' + propEntries.join(' ') : ''
  }

  private generateElementCode(
    element: Element,
    parentAutoFill: boolean = false
  ): string {
    const { type, props, style, className, children } = element
    
    // 特殊处理 a-tabs 组件：使用 a-tab-pane 方式生成
    if (type === 'a-tabs' && props?.items && Array.isArray(props.items)) {
      return this.generateTabsCode(element, parentAutoFill)
    }
    
    // 处理容器自动填充样式
    let finalStyle = { ...style }
    if (type === 'container' && props?.autoFill) {
      finalStyle = {
        ...finalStyle,
        display: 'flex',
        width: finalStyle.width || '100%',
        height: finalStyle.height || '100%',
      }
      
      if (props.flexDirection) {
        finalStyle.flexDirection = props.flexDirection
      }
      
      if (props.justifyContent) {
        finalStyle.justifyContent = props.justifyContent
      }
      
      if (props.alignItems) {
        finalStyle.alignItems = props.alignItems
      }
      
      // 处理 gap
      if (props.gap !== undefined && props.gap !== null && props.gap !== '') {
        const gapValue = String(props.gap)
        // 如果gap是纯数字，添加px单位；否则使用原始值
        finalStyle.gap = /^\d+$/.test(gapValue) ? `${gapValue}px` : gapValue
      }
    }
    
    // 如果父容器启用了自动填充，子元素需要 flex: 1
    if (parentAutoFill) {
      finalStyle = {
        ...finalStyle,
        flex: '1',
      }
    }
    
    const styleStr = this.formatStyle(finalStyle)
    
    // 生成组件类名（pb-{type}）并合并用户自定义类名
    // 每个组件都有 pb-{type} 类名，方便代码搜索定位
    const componentClass = this.getComponentClassName(type)
    const mergedClassName = this.mergeClassNames(componentClass, className)
    const classNameStr = ` class="${mergedClassName}"`
    
    const propsStr = this.formatProps(props || {}, true)

    let tag = this.getElementTag(type, props || {})
    let isSelfClosing = this.isSelfClosingTag(tag)

    // 如果有子元素或文本内容，不是自闭合标签
    if (children && children.length > 0) {
      isSelfClosing = false
    }
    if ((props && props.text) || (props && props.content)) {
      isSelfClosing = false
    }

    if (isSelfClosing) {
      return `${this.indentStr()}<${tag}${propsStr}${classNameStr}${styleStr} />`
    }

    const openTag = `${this.indentStr()}<${tag}${propsStr}${classNameStr}${styleStr}>`
    const closeTag = `${this.indentStr()}</${tag}>`

    let content = ''

    // 处理文本内容
    if (props && props.text) {
      content += `\n${this.indentStr()}  ${props.text}`
    } else if (props && props.content) {
      content += `\n${this.indentStr()}  ${props.content}`
    }

    // 处理子元素
    if (children && children.length > 0) {
      this.indent++
      const isAutoFill = type === 'container' && props?.autoFill === true
      for (const child of children) {
        content += '\n' + this.generateElementCode(child, isAutoFill)
      }
      this.indent--
    }

    if (content) {
      return `${openTag}${content}\n${closeTag}`
    }

    return `${openTag}${closeTag}`
  }

  /**
   * 生成 a-tabs 组件的代码
   * 使用 a-tab-pane 子组件方式，每个 tab 的内容都会生成
   */
  private generateTabsCode(
    element: Element,
    parentAutoFill: boolean = false
  ): string {
    const { props, style, className } = element
    
    // 处理样式
    let finalStyle = { ...style }
    if (parentAutoFill) {
      finalStyle = {
        ...finalStyle,
        flex: '1',
      }
    }
    const styleStr = this.formatStyle(finalStyle)
    
    // 生成组件类名
    const componentClass = this.getComponentClassName('a-tabs')
    const mergedClassName = this.mergeClassNames(componentClass, className)
    const classNameStr = ` class="${mergedClassName}"`
    
    // 准备 tabs 的 props（排除 items，因为我们要用 a-tab-pane 方式）
    const tabsProps = { ...props }
    delete tabsProps.items
    const propsStr = this.formatProps(tabsProps, true)
    
    const tag = 'fa-tabs'
    const openTag = `${this.indentStr()}<${tag}${propsStr}${classNameStr}${styleStr}>`
    const closeTag = `${this.indentStr()}</${tag}>`
    
    let content = ''
    
    // 为每个 item 生成 a-tab-pane
    if (props.items && Array.isArray(props.items)) {
      this.indent++
      for (const item of props.items) {
        const tabKey = item.key || `tab-${Math.random().toString(36).slice(2, 11)}`
        const tabLabel = item.label || 'Tab'
        
        // 生成 a-tab-pane 的 props（key 需要单独处理，因为它是 Vue 的特殊属性）
        const tabPaneProps: Record<string, any> = {
          tab: tabLabel,
        }
        
        // 添加其他 tab 相关的 props（如果有）
        if (item.disabled !== undefined) {
          tabPaneProps.disabled = item.disabled
        }
        if (item.closable !== undefined) {
          tabPaneProps.closable = item.closable
        }
        
        const tabPanePropsStr = this.formatProps(tabPaneProps, true)
        // key 属性需要单独添加，因为它是 Vue 的特殊属性
        const tabPaneOpenTag = `${this.indentStr()}<fa-tab-pane key="${tabKey}"${tabPanePropsStr}>`
        const tabPaneCloseTag = `${this.indentStr()}</fa-tab-pane>`
        
        // 生成 tab 内容（item.children）
        let tabContent = ''
        if (item.children && Array.isArray(item.children) && item.children.length > 0) {
          this.indent++
          const isAutoFill = false // tab 内容区域通常不需要 autoFill
          for (const child of item.children) {
            tabContent += '\n' + this.generateElementCode(child, isAutoFill)
          }
          this.indent--
        }
        
        if (tabContent) {
          content += `\n${tabPaneOpenTag}${tabContent}\n${tabPaneCloseTag}`
        } else {
          content += `\n${tabPaneOpenTag}${tabPaneCloseTag}`
        }
      }
      this.indent--
    }
    
    if (content) {
      return `${openTag}${content}\n${closeTag}`
    }
    
    return `${openTag}${closeTag}`
  }

  private getElementTag(type: ElementType, props: Record<string, any>): string {
    const tagMap: Record<string, string> = {
      container: 'div',
      text: 'span',
      button: 'button',
      input: 'input',
      image: 'img',
      card: 'div',
      divider: 'hr',
      heading: 'h1',
      paragraph: 'p',
      list: 'ul',
      form: 'form',
    }

    // 根据 type 和 props 决定具体标签
    if (type === 'heading') {
      return props?.level ? `h${props.level}` : 'h1'
    }
    if (type === 'list') {
      return props?.ordered ? 'ol' : 'ul'
    }

    // 处理 Ant Design 组件：将 a- 前缀替换为 fa-
    if (type.startsWith('a-')) {
      return type.replace(/^a-/, 'fa-')
    }

    return tagMap[type] || 'div'
  }

  private isSelfClosingTag(tag: string): boolean {
    const selfClosingTags = ['input', 'img', 'hr', 'br']
    return selfClosingTags.includes(tag.toLowerCase())
  }

  generate(element: Element, componentName: string = 'GeneratedPage'): string {
    this.indent = 0

    const template = this.generateElementCode(element, false)
    const script = `<script>
export default {
  name: '${componentName}',
  // Auto-generated by Page Builder
  // Each element has a pb-{type} class name for easy searching and locating in code
}
</script>`

    const style = `<style scoped>
/* Auto-generated styles */
/* Component class names follow the pattern: pb-{type} (e.g., pb-button, pb-container) */
</style>`

    return `<template>
${template}
</template>

${script}

${style}
`.trim()
  }

  generateFromConfig(elements: Element[], componentName: string = 'GeneratedPage'): string {
    // 如果只有一个根元素，直接生成
    if (elements.length === 1) {
      return this.generate(elements[0], componentName)
    }

    // 多个根元素，包裹在一个容器中
    const container: Element = {
      id: 'root-container',
      type: 'container',
      props: {},
      children: elements,
    }

    return this.generate(container, componentName)
  }
}
