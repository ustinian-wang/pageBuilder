import { ComponentDefinition, Element } from '@/lib/types'

const formField = (id: string, label: string, placeholder?: string, controlType: 'input' | 'textarea' | 'select' | 'radio' = 'input'): Element => {
  const fieldBase: Element = {
    id: `${id}-wrapper`,
    type: 'container',
    props: {},
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: '100%',
    },
    children: [
      {
        id: `${id}-label`,
        type: 'text',
        props: {
          text: label,
        },
        style: {
          fontWeight: '600',
          color: '#111827',
        },
      },
    ],
  }

  const controlStyle = {
    width: '100%',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    padding: '8px 10px',
    backgroundColor: '#FFFFFF',
  }

  let control: Element
  switch (controlType) {
    case 'select':
      control = {
        id: `${id}-select`,
        type: 'list',
        props: {
          ordered: false,
          items: ['选项 A', '选项 B', '选项 C'],
        },
        style: {
          ...controlStyle,
          listStyle: 'none',
          margin: '0',
          padding: '8px 10px',
          backgroundColor: '#F9FAFB',
        },
      }
      break
    case 'radio':
      control = {
        id: `${id}-radio`,
        type: 'list',
        props: {
          ordered: false,
          items: ['选项 1', '选项 2'],
        },
        style: {
          ...controlStyle,
          listStyle: 'none',
          margin: '0',
          padding: '8px 10px',
          backgroundColor: '#F9FAFB',
        },
      }
      break
    default:
      control = {
        id: `${id}-input`,
        type: 'input',
        props: {
          placeholder: placeholder || '请输入',
        },
        style: controlStyle,
      }
  }

  return {
    ...fieldBase,
    children: [...(fieldBase.children || []), control],
  }
}

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
      props: {},
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      },
      children: [
        formField('composite-form-name', '姓名', '请输入姓名'),
        formField('composite-form-email', '邮箱', 'name@example.com'),
        formField('composite-form-type', '类型', undefined, 'select'),
        {
          id: 'composite-form-actions',
          type: 'container',
          props: {},
          style: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '8px',
          },
          children: [
            {
              id: 'composite-form-cancel',
              type: 'button',
              props: {
                text: '取消',
              },
              className: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              style: {
                padding: '10px 18px',
                borderRadius: '8px',
              },
            },
            {
              id: 'composite-form-submit',
              type: 'button',
              props: {
                text: '提交',
              },
              className: 'bg-blue-600 text-white hover:bg-blue-700',
              style: {
                padding: '10px 18px',
                borderRadius: '8px',
              },
            },
          ],
        },
      ],
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
