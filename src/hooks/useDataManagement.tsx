import { useCallback } from 'react'
import type { Starter, Recipe } from '../types'

interface DataManagementHookProps {
  starters: Starter[]
  recipes: Recipe[]
  setStarters: (starters: Starter[]) => void
  setRecipes: (recipes: Recipe[]) => void
}

export const useDataManagement = ({ 
  starters, 
  recipes, 
  setStarters, 
  setRecipes 
}: DataManagementHookProps) => {
  
  // Export all data to JSON file
  const exportData = useCallback(() => {
    const data = {
      starters,
      recipes,
      exportDate: new Date().toISOString(),
      version: '1.0',
      appName: 'Chimi\'s Bread Lab'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bread-lab-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [starters, recipes])

  // Import data from JSON file
  const importData = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          
          // Validate data structure
          if (data.starters && Array.isArray(data.starters)) {
            setStarters(data.starters)
          }
          
          if (data.recipes && Array.isArray(data.recipes)) {
            setRecipes(data.recipes)
          }
          
          resolve(true)
        } catch (error) {
          console.error('Error importing data:', error)
          resolve(false)
        }
      }
      
      reader.onerror = () => resolve(false)
      reader.readAsText(file)
    })
  }, [setStarters, setRecipes])

  // Clear all data (with confirmation)
  const clearAllData = useCallback(() => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all data? This action cannot be undone. Consider exporting your data first.'
    )
    
    if (confirmed) {
      setStarters([])
      setRecipes([])
      // Clear localStorage
      localStorage.removeItem('bread-lab-starters')
      localStorage.removeItem('bread-lab-recipes')
      return true
    }
    
    return false
  }, [setStarters, setRecipes])

  // Get storage usage info
  const getStorageInfo = useCallback(() => {
    const startersSize = JSON.stringify(starters).length
    const recipesSize = JSON.stringify(recipes).length
    const totalSize = startersSize + recipesSize
    
    return {
      starters: {
        count: starters.length,
        size: `${(startersSize / 1024).toFixed(2)} KB`
      },
      recipes: {
        count: recipes.length,
        size: `${(recipesSize / 1024).toFixed(2)} KB`
      },
      total: {
        size: `${(totalSize / 1024).toFixed(2)} KB`,
        percentage: `${((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2)}%` // Assuming 5MB localStorage limit
      }
    }
  }, [starters, recipes])

  return {
    exportData,
    importData,
    clearAllData,
    getStorageInfo
  }
}