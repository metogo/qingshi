// 健康数据计算和存储工具库

/**
 * 活动水平配置
 */
export const ACTIVITY_LEVELS = [
  { value: 1.2, label: '久坐（基本不运动）', description: '办公室工作，很少或没有体育锻炼' },
  { value: 1.375, label: '轻度活动', description: '每周进行1-3天的轻度运动或锻炼' },
  { value: 1.55, label: '中度活动', description: '每周进行3-5天的中等强度运动' },
  { value: 1.725, label: '非常活跃', description: '每周进行6-7天的高强度运动' },
  { value: 1.9, label: '极其活跃', description: '专业运动员或从事重体力劳动' },
];

/**
 * BMI 分类标准（世界卫生组织）
 */
export const BMI_CATEGORIES = [
  { min: 0, max: 18.5, label: '偏瘦', color: '#3498DB', advice: '建议适当增加营养摄入' },
  { min: 18.5, max: 24, label: '正常', color: '#2ECC71', advice: '保持当前状态，继续健康饮食' },
  { min: 24, max: 28, label: '超重', color: '#F39C12', advice: '建议适度控制饮食，增加运动' },
  { min: 28, max: 100, label: '肥胖', color: '#E74C3C', advice: '建议咨询专业营养师，制定减重计划' },
];

/**
 * 计算BMR（基础代谢率）- Harris-Benedict公式
 * @param {Object} params - 用户参数
 * @param {string} params.sex - 性别 ('male' 或 'female')
 * @param {number} params.weight - 体重(kg)
 * @param {number} params.height - 身高(cm)
 * @param {number} params.age - 年龄(岁)
 * @returns {number} BMR值
 */
export function calculateBMR({ sex, weight, height, age }) {
  if (sex === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

/**
 * 计算TDEE（每日总热量消耗）
 * @param {number} bmr - 基础代谢率
 * @param {number} activityLevel - 活动系数
 * @returns {number} TDEE值
 */
export function calculateTDEE(bmr, activityLevel) {
  return bmr * activityLevel;
}

/**
 * 计算BMI（体质指数）
 * @param {number} weight - 体重(kg)
 * @param {number} height - 身高(cm)
 * @returns {number} BMI值
 */
export function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * 根据BMI值获取分类信息
 * @param {number} bmi - BMI值
 * @returns {Object} 分类信息
 */
export function getBMICategory(bmi) {
  return BMI_CATEGORIES.find(cat => bmi >= cat.min && bmi < cat.max) || BMI_CATEGORIES[1];
}

/**
 * 计算建议的蛋白质摄入量（基于体重）
 * @param {number} weight - 体重(kg)
 * @param {string} goal - 目标 ('maintain' | 'lose' | 'gain')
 * @returns {number} 建议蛋白质克数
 */
export function calculateProteinGoal(weight, goal = 'maintain') {
  const proteinPerKg = {
    'maintain': 1.2,  // 维持：1.2g/kg
    'lose': 1.6,      // 减脂：1.6g/kg
    'gain': 2.0,      // 增肌：2.0g/kg
  };
  return weight * (proteinPerKg[goal] || proteinPerKg.maintain);
}

/**
 * 保存用户健康数据到localStorage
 * @param {Object} userData - 用户健康数据
 */
export function saveUserProfile(userData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userHealthProfile', JSON.stringify(userData));
  }
}

/**
 * 从localStorage读取用户健康数据
 * @returns {Object|null} 用户健康数据
 */
export function getUserProfile() {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('userHealthProfile');
    return data ? JSON.parse(data) : null;
  }
  return null;
}

/**
 * 清除用户健康数据
 */
export function clearUserProfile() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userHealthProfile');
  }
}

/**
 * 计算完整的健康报告
 * @param {Object} params - 用户参数
 * @returns {Object} 完整健康报告
 */
export function generateHealthReport(params) {
  const bmr = calculateBMR(params);
  const tdee = calculateTDEE(bmr, params.activityLevel);
  const bmi = calculateBMI(params.weight, params.height);
  const bmiCategory = getBMICategory(bmi);
  const proteinGoal = calculateProteinGoal(params.weight, params.goal || 'maintain');
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    bmi: parseFloat(bmi.toFixed(1)),
    bmiCategory,
    proteinGoal: Math.round(proteinGoal),
    userParams: params,
  };
}