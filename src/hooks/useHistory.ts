import { useState, useCallback, useRef } from 'react'

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)
  const maxHistorySize = useRef(50) // 最多保存50个历史记录

  // 当前状态
  const current = history[currentIndex]

  // 是否可以撤销
  const canUndo = currentIndex > 0

  // 是否可以重做
  const canRedo = currentIndex < history.length - 1

  // 添加新的历史记录
  const push = useCallback((newState: T) => {
    setHistory((prevHistory) => {
      // 如果当前不在历史记录的末尾，移除后面的记录
      const newHistory = prevHistory.slice(0, currentIndex + 1)
      
      // 添加新状态
      const updatedHistory = [...newHistory, newState]
      
      // 限制历史记录大小
      if (updatedHistory.length > maxHistorySize.current) {
        const trimmed = updatedHistory.slice(-maxHistorySize.current)
        setCurrentIndex(maxHistorySize.current - 1)
        return trimmed
      }
      
      setCurrentIndex(updatedHistory.length - 1)
      return updatedHistory
    })
  }, [currentIndex])

  // 撤销
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      return history[newIndex]
    }
    return current
  }, [currentIndex, history, current])

  // 重做
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      return history[newIndex]
    }
    return current
  }, [currentIndex, history, current])

  return {
    current,
    canUndo,
    canRedo,
    push,
    undo,
    redo,
    // 重置历史记录（用于加载新页面时）
    reset: useCallback((newState: T) => {
      setHistory([newState])
      setCurrentIndex(0)
    }, []),
  }
}

