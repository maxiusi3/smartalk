import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

// 简化的分析 hook，移除复杂依赖
export function useAnalytics() {
  return {
    trackButtonClick: (buttonId: string, context: string) => {
      console.log('Button clicked:', buttonId, context)
    },
    trackFunnelStep: (step: string, success: boolean, data?: any) => {
      console.log('Funnel step:', step, success, data)
    }
  }
}

export function usePageAnalytics(page: string, data?: any) {
  useEffect(() => {
    console.log('Page viewed:', page, data)
  }, [page, data])
}


