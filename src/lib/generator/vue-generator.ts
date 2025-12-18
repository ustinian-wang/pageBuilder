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
    const formEventAttrs = ` data-form-id="${element.id}" @submit.prevent="handleFormSubmit('${element.id}')" @reset.prevent="handleFormReset('${element.id}')"`
    lines.push(`${this.indentStr()}<form${formEventAttrs}${classNameStr}${styleStr}>`)
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
        lines.push(...this.generateFormFieldBlock(field, formProps))
      })

      this.indent--
      lines.push(`${this.indentStr()}</div>`)
    })

    lines.push(...this.generateFormActions(formProps))

    this.indent--
    lines.push(`${this.indentStr()}</form>`)
    return lines.join('\n')
  }

  private generateFormFieldBlock(field: FormFieldConfig, formProps: FormElementProps): string[] {
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

    const controlLines = this.generateFormFieldControl(field, this.indent + 1)
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

  private generateFormActions(formProps: FormElementProps): string[] {
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

    const styleStr = this.formatStyle(actionStyle)
    lines.push(`${this.indentStr()}<div class="pb-form-actions"${styleStr}>`)
    this.indent++
    lines.push(
      `${this.indentStr()}<button type="submit" class="pb-form-submit">${formProps.submitLabel || '提交'}</button>`
    )
    lines.push(
      `${this.indentStr()}<button type="button" class="pb-form-cancel">${formProps.cancelLabel || '取消'}</button>`
    )
    this.indent--
    lines.push(`${this.indentStr()}</div>`)
    return lines
  }

  private generateFormFieldControl(field: FormFieldConfig, indentLevel: number): string[] {
    const component = field.component
    const controlProps: Record<string, any> = { ...(field.componentProps || {}) }
    const placeholder = controlProps.placeholder ?? field.placeholder
    if (placeholder !== undefined) {
      controlProps.placeholder = placeholder
    }
    if (!controlProps.name) {
      controlProps.name = field.name || field.id
    }
    if (field.required && component !== 'switch') {
      controlProps.required = controlProps.required ?? true
    }

    const controlStyle = controlProps.style as Record<string, string | number> | undefined
    delete controlProps.style

    const defaultValue = controlProps.defaultValue
    delete controlProps.defaultValue

    const options = this.getFieldOptions(field)

    switch (component) {
      case 'textarea':
        return this.generatePseudoElementControl('a-textarea', controlProps, controlStyle, indentLevel)
      case 'select':
        if (options.length && controlProps.options === undefined) {
          controlProps.options = options
        }
        return this.generatePseudoElementControl('a-select', controlProps, controlStyle, indentLevel)
      case 'radio':
        if (options.length && controlProps.options === undefined) {
          controlProps.options = options
        }
        return this.generatePseudoElementControl('a-radio-group', controlProps, controlStyle, indentLevel)
      case 'checkbox':
        if (options.length && controlProps.options === undefined) {
          controlProps.options = options
        }
        return this.generatePseudoElementControl('a-checkbox-group', controlProps, controlStyle, indentLevel)
      case 'number':
        return this.generatePseudoElementControl('a-input-number', controlProps, controlStyle, indentLevel)
      case 'date':
        return this.generatePseudoElementControl('a-date-picker', controlProps, controlStyle, indentLevel)
      case 'switch':
        return this.generatePseudoElementControl('a-switch', controlProps, controlStyle, indentLevel)
      case 'input':
      case 'text':
      case 'email':
      case 'password':
      case 'phone':
        // 普通输入框统一使用 Ant Design Input
        return this.generatePseudoElementControl('a-input', controlProps, controlStyle, indentLevel)
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
        return this.generatePseudoElementControl(component as ElementType, controlProps, controlStyle, indentLevel)
      default:
        // 默认也使用 Ant Design Input
        return this.generatePseudoElementControl('a-input', controlProps, controlStyle, indentLevel)
    }
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
  // Each element has a pb-{type} class name for easy searching and locating in code
}
</script>`
    }

    const formConfigs = this.formContexts.map(context => ({
      formId: context.formId,
      fields: Array.isArray(context.props.fields)
        ? context.props.fields.map(field => ({
            id: field.id,
            name: field.name,
            component: field.component,
            dependencies: field.dependencies || [],
          }))
        : [],
    }))

    const formsJson = JSON.stringify(formConfigs, null, 2)
      .split('\n')
      .map(line => '      ' + line)
      .join('\n')

    return `<script>
export default {
  name: '${componentName}',
  data() {
    return {
      formValues: {},
      formConfigs: ${formsJson.replace(/^      /, '')},
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.formConfigs.forEach(config => {
        this.$set ? this.$set(this.formValues, config.formId, {}) : (this.formValues[config.formId] = {})
        this.attachFormListeners(config.formId)
        this.applyDependencies(config.formId)
      })
    })
  },
  beforeDestroy() {
    this.formConfigs.forEach(config => this.detachFormListeners(config.formId))
  },
  methods: {
    attachFormListeners(formId) {
      const formEl = this.getFormElement(formId)
      if (!formEl) return
      const handler = () => this.handleFormInteraction(formId)
      formEl.__pbFormHandler = handler
      formEl.addEventListener('input', handler)
      formEl.addEventListener('change', handler)
    },
    detachFormListeners(formId) {
      const formEl = this.getFormElement(formId)
      if (!formEl || !formEl.__pbFormHandler) return
      formEl.removeEventListener('input', formEl.__pbFormHandler)
      formEl.removeEventListener('change', formEl.__pbFormHandler)
      delete formEl.__pbFormHandler
    },
    getFormElement(formId) {
      if (!this.$el) return null
      return this.$el.querySelector('[data-form-id="' + formId + '"]')
    },
    handleFormInteraction(formId) {
      const values = this.collectFormValues(formId)
      if (this.$set) {
        this.$set(this.formValues, formId, values)
      } else {
        this.formValues[formId] = values
      }
      this.applyDependencies(formId)
    },
    collectFormValues(formId) {
      const formEl = this.getFormElement(formId)
      if (!formEl) return {}
      const formData = new FormData(formEl)
      const result = {}
      formData.forEach((value, key) => {
        const normalized = typeof value === 'string' ? value : ''
        if (result[key] === undefined) {
          result[key] = normalized
        } else if (Array.isArray(result[key])) {
          result[key].push(normalized)
        } else {
          result[key] = [result[key], normalized]
        }
      })
      return result
    },
    handleFormSubmit(formId) {
      const values = this.collectFormValues(formId)
      if (this.$set) {
        this.$set(this.formValues, formId, values)
      } else {
        this.formValues[formId] = values
      }
      console.log('[Form Submit]', formId, values)
      if (this.$emit) {
        this.$emit('form-submit', { formId, values })
      }
    },
    handleFormReset(formId) {
      const formEl = this.getFormElement(formId)
      if (formEl) {
        formEl.reset()
      }
      if (this.$set) {
        this.$set(this.formValues, formId, {})
      } else {
        this.formValues[formId] = {}
      }
      this.$nextTick(() => this.applyDependencies(formId))
    },
    applyDependencies(formId) {
      const formEl = this.getFormElement(formId)
      if (!formEl) return
      const values = this.formValues[formId] || {}
      const fieldNodes = formEl.querySelectorAll('[data-field-id]')
      fieldNodes.forEach(node => {
        const depsText = node.getAttribute('data-field-dependencies')
        if (!depsText) return
        let visible = true
        let disabled = false
        try {
          const depList = JSON.parse(depsText)
          depList.forEach(dep => {
            const matches = this.evaluateDependency(dep, values)
            if (dep.action === 'hide' && matches) {
              visible = false
            }
            if (dep.action === 'show') {
              visible = matches
            }
            if (dep.action === 'disable' && matches) {
              disabled = true
            }
            if (dep.action === 'enable') {
              disabled = !matches ? disabled : false
            }
          })
        } catch (error) {
          console.warn('Failed to parse dependencies', error)
        }
        node.style.display = visible ? '' : 'none'
        this.setFieldDisabled(node, disabled)
      })
    },
    evaluateDependency(dep, values) {
      const sourceValue = values[dep.sourceFieldId]
      const expected = dep.value
      switch (dep.operator) {
        case 'equals':
          return JSON.stringify(sourceValue) === JSON.stringify(expected)
        case 'notEquals':
          return JSON.stringify(sourceValue) !== JSON.stringify(expected)
        case 'includes':
          if (Array.isArray(sourceValue)) {
            if (Array.isArray(expected)) {
              return expected.every(val => sourceValue.includes(val))
            }
            return sourceValue.includes(expected)
          }
          if (typeof sourceValue === 'string' && typeof expected === 'string') {
            return sourceValue.includes(expected)
          }
          return false
        case 'in':
          if (Array.isArray(expected)) {
            return expected.includes(sourceValue)
          }
          return sourceValue === expected
        default:
          return false
      }
    },
    setFieldDisabled(node, disabled) {
      const controls = node.querySelectorAll('input, select, textarea, button, .ant-select, .ant-radio-group, .ant-checkbox-group')
      controls.forEach(control => {
        if ('disabled' in control) {
          control.disabled = disabled
        } else if (disabled) {
          control.classList.add('pb-field-disabled')
        } else {
          control.classList.remove('pb-field-disabled')
        }
      })
    },
  },
}
</script>`
  }
}
