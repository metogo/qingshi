// 对话分析与Calculator的集成补丁
// 单独管理，避免修改复杂的CalorieCalculator.js

export function setupDialogAnalysisListener(setSelectedFoods, setAiResponse, setDrawerState) {
  const handler = (event) => {
    const { foods, analysis } = event.detail;
    
    console.log('[对话分析] 收到结果:', event.detail);
    
    // 1. 填充食材
    setSelectedFoods(foods);
    
    // 2. 设置AI报告  
    setAiResponse(analysis);
    
    // 3. 展开抽屉
    setDrawerState('expanded');
  };

  window.addEventListener('meal-analyzed', handler);
  
  return () => window.removeEventListener('meal-analyzed', handler);
}