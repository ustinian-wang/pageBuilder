'use client'

import { UndoOutlined, RedoOutlined } from '@ant-design/icons'

interface ActionMenuProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

export function ActionMenu({ canUndo, canRedo, onUndo, onRedo }: ActionMenuProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`
          px-3 py-2 rounded-lg shadow-md
          flex items-center gap-2
          transition-all duration-200
          ${
            canUndo
              ? 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-lg cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
        title="撤销 (Ctrl+Z)"
      >
        <UndoOutlined className="text-base" />
        <span className="text-sm font-medium">撤销</span>
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`
          px-3 py-2 rounded-lg shadow-md
          flex items-center gap-2
          transition-all duration-200
          ${
            canRedo
              ? 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-lg cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
        title="重做 (Ctrl+Y)"
      >
        <RedoOutlined className="text-base" />
        <span className="text-sm font-medium">重做</span>
      </button>
    </div>
  )
}

