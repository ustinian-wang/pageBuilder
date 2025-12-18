import {
  Element,
  ElementType,
  FormElementProps,
  FormFieldConfig,
  FormFieldOption,
  FormGroup,
  FormFieldDependency,
} from '../types'

type AntComponentPrefix = 'a' | 'fa'

interface VueGeneratorOptions {
  antPrefix?: AntComponentPrefix
}

interface GeneratedFormContext {
  formId: string
  props: FormElementProps
}

// Vue 2 代码生成器
export class VueGenerator {
  private indent = 0
  private indentSize = 2
  private formContexts: GeneratedFormContext[] = []
  private antPrefix: AntComponentPrefix

  constructor(options: VueGeneratorOptions = {}) {
    this.antPrefix = options.antPrefix || 'fa'
  }

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
        const serialized = JSON.stringify(value)
        return `:${key}='${serialized}'`
      })
      .filter(Boolean)
    return propEntries.length > 0 ? ' ' + propEntries.join(' ') : ''
  }

  private hasStructuredForm(element: Element): boolean {
    const fields = Array.isArray(element.props?.fields) ? element.props?.fields : []
    return element.type === 'form' && fields.length > 0
  }

  private getIndentFor(level: number): string {
    return ' '.repeat(level * this.indentSize)
  }

  private generateElementCode(
    element: Element,
    parentAutoFill: boolean = false
  ): string {
    const { type, props, style, className, children } = element

    // 表单元素需要单独处理，确保导出的代码包含字段结构
    if (this.hasStructuredForm(element)) {
      return this.generateStructuredForm(element, parentAutoFill)
    }
    
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

    // 处理 Ant Design 组件前缀
    if (type.startsWith('a-') || type.startsWith('fa-')) {
      const suffix = type.replace(/^(a|fa)-/, '')
      return `${this.antPrefix}-${suffix}`
    }

    return tagMap[type] || 'div'
  }

  private buildFormSections(fields: FormFieldConfig[], groups: FormGroup[]) {
    const map = new Map<string, FormFieldConfig[]>()
    fields.forEach(field => {
      const key = field.groupId || 'default'
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(field)
    })

    const sections: Array<{ id: string; group: FormGroup | null; fields: FormFieldConfig[] }> = []
    const defaultFields = map.get('default') || []
    if (map.has('default')) {
      map.delete('default')
    }

    groups.forEach(group => {
      const groupFields = map.get(group.id)
      if (groupFields && groupFields.length) {
        sections.push({ id: group.id, group, fields: groupFields })
        map.delete(group.id)
      }
    })

    if (defaultFields.length) {
      sections.push({ id: 'default', group: null, fields: defaultFields })
    }

    map.forEach((groupFields, key) => {
      if (groupFields.length) {
        sections.push({ id: key, group: null, fields: groupFields })
      }
    })

    return sections
  }

  private formatFormFieldLabel(label: string | undefined, showColon: boolean): string {
    const trimmed = (label || '').trim()
    if (!trimmed) return ''
    if (!showColon) return trimmed
    return /[:：]$/.test(trimmed) ? trimmed : `${trimmed}：`
  }

  private getFieldOptions(field: FormFieldConfig): FormFieldOption[] {
    if (Array.isArray(field.options) && field.options.length) {
      return field.options
    }
    const fromProps = field.componentProps?.options
    if (Array.isArray(fromProps) && fromProps.length) {
      return fromProps as FormFieldOption[]
    }
    return []
  }

  private formatHtmlAttributes(props: Record<string, any>): string {
    const entries = Object.entries(props)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? key : ''
        }
        if (typeof value === 'object') {
          const serialized = JSON.stringify(value).replace(/"/g, '&quot;')
          return `${key}="${serialized}"`
        }
        return `${key}="${value}"`
      })
      .filter(Boolean)
    return entries.length ? ' ' + entries.join(' ') : ''
  }

  private registerFormContext(formId: string, props: FormElementProps) {
    if (!this.formContexts.some(ctx => ctx.formId === formId)) {
      this.formContexts.push({
        formId,
        props,
      })
    }
  }

  private generateStructuredForm(element: Element, parentAutoFill: boolean): string {
    const formProps: FormElementProps = element.props || {}
    const fields = Array.isArray(formProps.fields) ? formProps.fields : []
    const groups = Array.isArray(formProps.groups) ? formProps.groups : []
    this.registerFormContext(element.id, formProps)
    let finalStyle = { ...(element.style || {}) }

    if (!finalStyle.display) {
      finalStyle.display = 'flex'
    }
    if (!finalStyle.flexDirection) {
      finalStyle.flexDirection = 'column'
    }
    if (!finalStyle.gap && typeof formProps.rowGap === 'number') {
      finalStyle.gap = `${formProps.rowGap}px`
    }
    if (parentAutoFill) {
      finalStyle = {
        ...finalStyle,
        flex: '1',
      }
    }

    const styleStr = this.formatStyle(finalStyle)
    const componentClass = this.getComponentClassName('form')
    const mergedClassName = this.mergeClassNames(componentClass, element.className)
    const classNameStr = ` class="${mergedClassName}"`

    const lines: string[] = []
    // 使用 div 替代 form，避免原生表单行为
    lines.push(`${this.indentStr()}<div data-form-id="${element.id}"${classNameStr}${styleStr}>`)
    this.indent++

    const sections = this.buildFormSections(fields, groups)
    sections.forEach(section => {
      const sectionStyle = this.formatStyle({
        display: 'flex',
        flexDirection: 'column',
        gap: `${formProps.fieldGap ?? 24}px`,
      })
      lines.push(`${this.indentStr()}<div class="pb-form-section"${sectionStyle}>`)
      this.indent++

      if (section.group) {
        lines.push(`${this.indentStr()}<div class="pb-form-group-heading">`)
        this.indent++
        lines.push(`${this.indentStr()}<p class="pb-form-group-title">${section.group.label}</p>`)
        if (section.group.description) {
          lines.push(`${this.indentStr()}<p class="pb-form-group-desc">${section.group.description}</p>`)
        }
        this.indent--
        lines.push(`${this.indentStr()}</div>`)
      }

      section.fields.forEach(field => {
        lines.push(...this.generateFormFieldBlock(field, formProps, element.id))
      })

      this.indent--
      lines.push(`${this.indentStr()}</div>`)
    })

    lines.push(...this.generateFormActions(formProps, element.id))

    this.indent--
    lines.push(`${this.indentStr()}</div>`)
    return lines.join('\n')
  }

  private generateFormFieldBlock(field: FormFieldConfig, formProps: FormElementProps, formId: string): string[] {
    const originalIndent = this.indent
    const lines: string[] = []
    const layoutDirection = formProps.layout === 'vertical' ? 'column' : 'row'
    const labelWidth = formProps.labelWidth ?? 122
    const labelMinHeight = formProps.labelMinHeight ?? 32
    const labelWrap = !!formProps.labelWrap
    const labelEllipsis = !!formProps.labelEllipsis
    const showLabelColon = formProps.labelColon !== false

    const rowStyle = this.formatStyle({
      display: 'flex',
      flexDirection: layoutDirection,
      alignItems: layoutDirection === 'row' ? 'center' : 'flex-start',
      gap: '12px',
      width: '100%',
    })
    const dependencyAttr = field.dependencies && field.dependencies.length ? ` data-field-dependencies='${JSON.stringify(field.dependencies)}'` : ''
    const wrappersAttrs = ` data-field-id="${field.id}" data-field-component="${field.component || 'unknown'}"${dependencyAttr}`
    lines.push(`${this.indentStr()}<div class="pb-form-field"${wrappersAttrs}${rowStyle}>`)
    this.indent++

    const labelClasses = ['pb-form-field-label']
    if (field.showLabel === false) {
      labelClasses.push('pb-form-field-label--hidden')
    }

    const labelStyleObj: Record<string, string> = {
      width: layoutDirection === 'row' ? `${labelWidth}px` : '100%',
      minHeight: `${labelMinHeight}px`,
      display: labelWrap ? 'block' : 'flex',
      alignItems: layoutDirection === 'row' ? 'center' : 'flex-start',
    }

    if (labelWrap) {
      labelStyleObj.whiteSpace = 'normal'
      labelStyleObj.wordBreak = 'break-word'
    } else if (labelEllipsis) {
      labelStyleObj.whiteSpace = 'nowrap'
      labelStyleObj.overflow = 'hidden'
      labelStyleObj.textOverflow = 'ellipsis'
    } else {
      labelStyleObj.whiteSpace = 'nowrap'
    }

    const labelStyle = this.formatStyle(labelStyleObj)
    const labelText = this.formatFormFieldLabel(field.label || field.name, showLabelColon)
    const requiredMark = field.required && field.showLabel !== false ? '<span class="pb-form-field-required">*</span>' : ''

    lines.push(
      `${this.indentStr()}<label class="${labelClasses.join(' ')}"${labelStyle}>${requiredMark}<span>${labelText}</span></label>`
    )

    const controlStyle = this.formatStyle({ flex: '1', width: '100%' })
    lines.push(`${this.indentStr()}<div class="pb-form-field-control"${controlStyle}>`)

    const controlLines = this.generateFormFieldControl(field, this.indent + 1, formId)
    controlLines.forEach(line => lines.push(line))

    if (field.validations && field.validations.length) {
      field.validations.forEach(rule => {
        const message = rule.message || `${field.label || field.name}校验`
        lines.push(`${this.indentStr()}  <p class="pb-form-field-hint">${message}</p>`)
      })
    }

    lines.push(`${this.indentStr()}</div>`)
    this.indent--
    lines.push(`${this.indentStr()}</div>`)
    this.indent = originalIndent
    return lines
  }

  private generateFormActions(formProps: FormElementProps, formId: string): string[] {
    const lines: string[] = []
    const variant = formProps.actionsVariant || 'default'
    const align = formProps.actionsAlign || (variant === 'default' ? 'right' : 'center')
    const justifyMap: Record<string, string> = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end',
    }
    const actionsGap = formProps.actionsGap ?? (variant === 'bar' ? 20 : 12)
    const padding = formProps.actionsPadding ?? (variant === 'bar' ? 20 : 12)
    const background = variant === 'bar' ? formProps.actionsBackground || '#f9fafb' : undefined

    const actionStyle: Record<string, string> = {
      display: 'flex',
      justifyContent: justifyMap[align] || 'flex-end',
      gap: `${actionsGap}px`,
      alignItems: 'center',
      marginTop: '12px',
    }

    if (variant === 'bar') {
      actionStyle.padding = `${padding}px`
      actionStyle.backgroundColor = background || 'transparent'
      actionStyle.borderTop = '1px solid #efefef'
    }

    // 生成表单数据对象名（驼峰命名）
    const formDataName = this.getFormDataName(formId)

    const styleStr = this.formatStyle(actionStyle)
    lines.push(`${this.indentStr()}<div class="pb-form-actions"${styleStr}>`)
    this.indent++
    // 提交按钮绑定 handleSubmit 方法
    lines.push(
      `${this.indentStr()}<${this.antPrefix}-button type="primary" @click="handleSubmit_${formDataName}" class="pb-form-submit">${formProps.submitLabel || '提交'}</${this.antPrefix}-button>`
    )
    // 取消按钮绑定 handleReset 方法
    lines.push(
      `${this.indentStr()}<${this.antPrefix}-button @click="handleReset_${formDataName}" class="pb-form-cancel">${formProps.cancelLabel || '取消'}</${this.antPrefix}-button>`
    )
    this.indent--
    lines.push(`${this.indentStr()}</div>`)
    return lines
  }

  // 根据表单ID生成数据对象名
  private getFormDataName(formId: string): string {
    // 移除非字母数字字符，转为驼峰命名
    return 'form_' + formId.replace(/[^a-zA-Z0-9]/g, '_')
  }

  private generateFormFieldControl(field: FormFieldConfig, indentLevel: number, formId: string): string[] {
    const component = field.component
    const controlProps: Record<string, any> = { ...(field.componentProps || {}) }
    const placeholder = controlProps.placeholder ?? field.placeholder
    if (placeholder !== undefined) {
      controlProps.placeholder = placeholder
    }
    const fieldName = field.name || field.id
    if (!controlProps.name) {
      controlProps.name = fieldName
    }

    const controlStyle = controlProps.style as Record<string, string | number> | undefined
    delete controlProps.style
    delete controlProps.defaultValue

    const options = this.getFieldOptions(field)

    // 生成 v-model 绑定路径
    const formDataName = this.getFormDataName(formId)
    const vModelPath = `${formDataName}.${fieldName}`

    switch (component) {
      case 'textarea':
        return this.generateFormControl('a-textarea', controlProps, controlStyle, indentLevel, vModelPath)
      case 'select':
        if (options.length && controlProps.options === undefined) {
          controlProps.options = options
        }
        return this.generateFormControl('a-select', controlProps, controlStyle, indentLevel, vModelPath)
      case 'radio':
        if (options.length && controlProps.options === undefined) {
          controlProps.options = options
        }
        return this.generateFormControl('a-radio-group', controlProps, controlStyle, indentLevel, vModelPath)
      case 'checkbox':
        if (options.length && controlProps.options === undefined) {
          controlProps.options = options
        }
        return this.generateFormControl('a-checkbox-group', controlProps, controlStyle, indentLevel, vModelPath)
      case 'number':
        return this.generateFormControl('a-input-number', controlProps, controlStyle, indentLevel, vModelPath)
      case 'date':
        return this.generateFormControl('a-date-picker', controlProps, controlStyle, indentLevel, vModelPath)
      case 'switch':
        return this.generateFormControl('a-switch', controlProps, controlStyle, indentLevel, vModelPath)
      case 'input':
      case 'text':
      case 'email':
      case 'password':
      case 'phone':
        return this.generateFormControl('a-input', controlProps, controlStyle, indentLevel, vModelPath)
      case 'a-input':
      case 'a-textarea':
      case 'a-select':
      case 'a-radio':
      case 'a-radio-group':
      case 'a-checkbox':
      case 'a-checkbox-group':
      case 'a-switch':
      case 'a-input-number':
      case 'a-date-picker':
        if (options.length && controlProps.options === undefined) {
          controlProps.options = options
        }
        return this.generateFormControl(component as ElementType, controlProps, controlStyle, indentLevel, vModelPath)
      default:
        return this.generateFormControl('a-input', controlProps, controlStyle, indentLevel, vModelPath)
    }
  }

  // 生成带 v-model 的表单控件
  private generateFormControl(
    type: ElementType,
    props: Record<string, any>,
    style: Record<string, string | number> | undefined,
    indentLevel: number,
    vModelPath: string
  ): string[] {
    const indent = this.getIndentFor(indentLevel)
    const tag = this.getElementTag(type, props)
    const propsStr = this.formatProps(props, false)
    const styleStr = this.formatStyle(style)
    return [`${indent}<${tag} v-model="${vModelPath}"${propsStr}${styleStr} />`]
  }

  private generatePseudoElementControl(
    type: ElementType,
    props: Record<string, any>,
    style: Record<string, string | number> | undefined,
    indentLevel: number
  ): string[] {
    const pseudoElement: Element = {
      id: `form-control-${type}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      props,
      style,
    }
    const savedIndent = this.indent
    this.indent = indentLevel
    const code = this.generateElementCode(pseudoElement, false)
    this.indent = savedIndent
    return code.split('\n')
  }

  private generateNativeTextarea(
    props: Record<string, any>,
    style: Record<string, string | number> | undefined,
    defaultValue: any,
    indentLevel: number
  ): string[] {
    const indent = this.getIndentFor(indentLevel)
    const attrStr = this.formatHtmlAttributes(props)
    const styleStr = this.formatStyle(style)
    const content = defaultValue ? String(defaultValue) : ''
    return [`${indent}<textarea${attrStr}${styleStr}>${content}</textarea>`]
  }

  private generateNativeSelect(
    props: Record<string, any>,
    style: Record<string, string | number> | undefined,
    options: FormFieldOption[],
    indentLevel: number,
    placeholder?: string
  ): string[] {
    const indent = this.getIndentFor(indentLevel)
    const attrStr = this.formatHtmlAttributes(props)
    const styleStr = this.formatStyle(style)
    const lines: string[] = []
    lines.push(`${indent}<select${attrStr}${styleStr}>`)
    const innerIndent = this.getIndentFor(indentLevel + 1)
    if (placeholder) {
      lines.push(`${innerIndent}<option value="" disabled selected hidden>${placeholder}</option>`)
    }
    options.forEach(opt => {
      lines.push(`${innerIndent}<option value="${opt.value}">${opt.label}</option>`)
    })
    lines.push(`${indent}</select>`)
    return lines
  }

  private generateNativeChoiceGroup(
    type: 'radio' | 'checkbox',
    props: Record<string, any>,
    style: Record<string, string | number> | undefined,
    options: FormFieldOption[],
    indentLevel: number
  ): string[] {
    const indent = this.getIndentFor(indentLevel)
    const attrStr = this.formatHtmlAttributes({ class: props.className })
    const styleStr = this.formatStyle(style)
    const lines: string[] = []
    lines.push(`${indent}<div class="pb-form-${type}-group"${attrStr}${styleStr}>`)
    const innerIndent = this.getIndentFor(indentLevel + 1)
    const name = props.name || ''
    options.forEach(opt => {
      const optionAttrs = this.formatHtmlAttributes({
        type,
        name,
        value: opt.value,
        disabled: (props.disabled as boolean) || opt.disabled,
      })
      lines.push(
        `${innerIndent}<label class="pb-form-${type}-option"><input${optionAttrs} /> <span>${opt.label}</span></label>`
      )
    })
    lines.push(`${indent}</div>`)
    return lines
  }

  private generateNativeSwitch(
    props: Record<string, any>,
    style: Record<string, string | number> | undefined,
    placeholder: string | undefined,
    indentLevel: number
  ): string[] {
    const indent = this.getIndentFor(indentLevel)
    const attrStr = this.formatHtmlAttributes({
      type: 'checkbox',
      name: props.name,
      disabled: props.disabled,
      checked: props.defaultChecked ?? props.checked,
    })
    const styleStr = this.formatStyle(style)
    const labelText = placeholder ? `<span>${placeholder}</span>` : ''
    return [`${indent}<label class="pb-form-switch"${styleStr}><input${attrStr} /> ${labelText}</label>`]
  }

  private isSelfClosingTag(tag: string): boolean {
    const selfClosingTags = ['input', 'img', 'hr', 'br']
    return selfClosingTags.includes(tag.toLowerCase())
  }

  generate(element: Element, componentName: string = 'GeneratedPage'): string {
    this.indent = 0
    this.formContexts = []

    const template = this.generateElementCode(element, false)
    const script = this.buildScript(componentName)

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

  private buildScript(componentName: string): string {
    if (!this.formContexts.length) {
      return `<script>
export default {
  name: '${componentName}',
  // Auto-generated by Page Builder
}
</script>`
    }

    // 生成表单数据对象和验证规则
    const dataLines: string[] = []
    const validationRules: string[] = []
    const submitMethods: string[] = []
    const resetMethods: string[] = []

    this.formContexts.forEach(context => {
      const formDataName = this.getFormDataName(context.formId)
      const fields = Array.isArray(context.props.fields) ? context.props.fields : []
      
      // 生成表单数据对象初始值
      const fieldDefaults: Record<string, string> = {}
      const fieldRules: Array<{ name: string; required: boolean; rules: Array<{ type: string; message: string }> }> = []
      
      fields.forEach(field => {
        const fieldName = field.name || field.id
        // 根据组件类型设置默认值
        switch (field.component) {
          case 'checkbox':
          case 'a-checkbox-group':
            fieldDefaults[fieldName] = '[]'
            break
          case 'switch':
          case 'a-switch':
            fieldDefaults[fieldName] = 'false'
            break
          case 'number':
          case 'a-input-number':
            fieldDefaults[fieldName] = 'null'
            break
          default:
            fieldDefaults[fieldName] = "''"
        }
        
        // 收集验证规则
        if (field.required || (field.validations && field.validations.length)) {
          const rules: Array<{ type: string; message: string }> = []
          if (field.required) {
            rules.push({ type: 'required', message: `${field.label || fieldName}不能为空` })
          }
          if (field.validations) {
            field.validations.forEach(v => {
              rules.push({ type: v.type, message: v.message || `${field.label || fieldName}格式不正确` })
            })
          }
          fieldRules.push({ name: fieldName, required: !!field.required, rules })
        }
      })
      
      // 生成 data 中的表单对象
      const fieldsStr = Object.entries(fieldDefaults)
        .map(([k, v]) => `        ${k}: ${v}`)
        .join(',\n')
      dataLines.push(`      ${formDataName}: {\n${fieldsStr}\n      }`)
      
      // 生成验证规则
      if (fieldRules.length) {
        const rulesStr = fieldRules.map(fr => {
          const ruleItems = fr.rules.map(r => `{ type: '${r.type}', message: '${r.message}' }`).join(', ')
          return `        ${fr.name}: [${ruleItems}]`
        }).join(',\n')
        validationRules.push(`      ${formDataName}Rules: {\n${rulesStr}\n      }`)
      }
      
      // 生成提交方法
      submitMethods.push(`    // 提交表单 ${formDataName}
    handleSubmit_${formDataName}() {
      // 执行验证
      const errors = this.validate_${formDataName}()
      if (errors.length > 0) {
        console.warn('[表单验证失败]', errors)
        this.$message ? this.$message.error(errors[0]) : alert(errors[0])
        return
      }
      // 获取表单数据
      const formData = { ...this.${formDataName} }
      console.log('[表单提交]', formData)
      // TODO: 在此处添加提交逻辑，如调用API
      this.$emit('submit', { formId: '${context.formId}', data: formData })
    }`)
      
      // 生成重置方法
      const resetFieldsStr = Object.entries(fieldDefaults)
        .map(([k, v]) => `      this.${formDataName}.${k} = ${v}`)
        .join('\n')
      resetMethods.push(`    // 重置表单 ${formDataName}
    handleReset_${formDataName}() {
${resetFieldsStr}
      console.log('[表单重置]', '${context.formId}')
    }`)
      
      // 生成验证方法
      if (fieldRules.length) {
        const validateChecks = fieldRules.map(fr => {
          const checks: string[] = []
          fr.rules.forEach(r => {
            if (r.type === 'required') {
              checks.push(`      if (!this.${formDataName}.${fr.name} && this.${formDataName}.${fr.name} !== 0) errors.push('${r.message}')`)
            } else if (r.type === 'email') {
              checks.push(`      if (this.${formDataName}.${fr.name} && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(this.${formDataName}.${fr.name})) errors.push('${r.message}')`)
            } else if (r.type === 'phone') {
              checks.push(`      if (this.${formDataName}.${fr.name} && !/^1[3-9]\\d{9}$/.test(this.${formDataName}.${fr.name})) errors.push('${r.message}')`)
            }
          })
          return checks.join('\n')
        }).join('\n')
        
        submitMethods.push(`    // 验证表单 ${formDataName}
    validate_${formDataName}() {
      const errors = []
${validateChecks}
      return errors
    }`)
      } else {
        submitMethods.push(`    // 验证表单 ${formDataName}（无验证规则）
    validate_${formDataName}() {
      return []
    }`)
      }
    })

    const allDataLines = [...dataLines, ...validationRules].join(',\n')
    const allMethods = [...submitMethods, ...resetMethods].join(',\n')

    return `<script>
export default {
  name: '${componentName}',
  data() {
    return {
${allDataLines}
    }
  },
  methods: {
${allMethods}
  }
}
</script>`
  }
}
