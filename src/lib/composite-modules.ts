import { ComponentDefinition, Element, FormFieldConfig } from '@/lib/types'

const createField = (config: Partial<FormFieldConfig> & { id: string; name: string; label: string }): FormFieldConfig => ({
  component: 'input',
  placeholder: '请输入',
  componentProps: {},
  options: [],
  validations: [],
  dependencies: [],
  required: false,
  ...config,
})

const compositeFormModule: Element = {
  id: 'composite-form-root',
  type: 'container',
  props: {},
  style: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  children: [
    {
      id: 'composite-form-heading',
      type: 'heading',
      props: {
        text: '表单模块',
        level: 3,
      },
      style: {
        margin: '0',
      },
    },
    {
      id: 'composite-form-description',
      type: 'paragraph',
      props: {
        text: '包含标题、描述、三个字段以及操作按钮的标准表单模版。',
      },
      style: {
        color: '#6B7280',
        margin: '0',
      },
    },
    {
      id: 'composite-form-body',
      type: 'form',
      props: {
        labelWidth: 122,
        labelWrap: true,
        labelEllipsis: true,
        layout: 'horizontal',
        rowGap: 18,
        submitLabel: '提交',
        cancelLabel: '取消',
        groups: [
          {
            id: 'basic-info',
            label: '基础信息',
            description: '填写姓名/邮箱/客户类型等基础内容',
          },
          {
            id: 'extra-info',
            label: '高级设置',
            description: '联动字段、校验示例',
          },
        ],
        fields: [
          createField({
            id: 'field-name',
            name: 'name',
            label: '姓名',
            placeholder: '请输入姓名',
            component: 'a-input',
            groupId: 'basic-info',
            required: true,
            validations: [
              { id: 'rule-name-length', type: 'string', min: 2, max: 20, message: '姓名需要 2-20 个字符' },
            ],
          }),
          createField({
            id: 'field-email',
            name: 'email',
            label: '邮箱',
            placeholder: 'name@example.com',
            component: 'input',
            groupId: 'basic-info',
            validations: [{ id: 'rule-email', type: 'email', message: '请输入有效的邮箱地址' }],
          }),
          createField({
            id: 'field-type',
            name: 'customerType',
            label: '客户类型',
            component: 'a-select',
            groupId: 'basic-info',
            options: [
              { label: '内部客户', value: 'internal' },
              { label: '外部客户', value: 'external' },
              { label: '合作伙伴', value: 'partner' },
            ],
            componentProps: { allowClear: true, placeholder: '请选择类型' },
          }),
          createField({
            id: 'field-notify',
            name: 'notify',
            label: '开通通知',
            component: 'a-switch',
            groupId: 'extra-info',
            componentProps: { defaultValue: true },
          }),
          createField({
            id: 'field-channel',
            name: 'channel',
            label: '通知方式',
            component: 'a-radio',
            groupId: 'extra-info',
            options: [
              { label: '短信', value: 'sms' },
              { label: '邮件', value: 'email' },
              { label: '站内信', value: 'inbox' },
            ],
            dependencies: [
              {
                id: 'dep-channel',
                sourceFieldId: 'field-notify',
                operator: 'equals',
                value: true,
                action: 'enable',
              },
            ],
          }),
          createField({
            id: 'field-remark',
            name: 'remark',
            label: '备注说明',
            component: 'textarea',
            placeholder: '当客户类型为“外部客户”时显示',
            groupId: 'extra-info',
            dependencies: [
              {
                id: 'dep-remark',
                sourceFieldId: 'field-type',
                operator: 'equals',
                value: 'external',
                action: 'show',
              },
            ],
          }),
        ],
      },
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      },
    },
  ],
}

export const compositeModules: ComponentDefinition[] = [
  {
    type: 'composite-form-module',
    label: '表单模块',
    icon: '🧾',
    category: 'composite',
    description: '标题+描述+输入区+操作条的一体化表单',
    elementData: compositeFormModule,
  },
]
