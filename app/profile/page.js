'use client'

import React, { useState, useEffect } from 'react'
import { User, Activity, TrendingUp, Scale, Ruler, Calendar, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { 
  ACTIVITY_LEVELS, 
  generateHealthReport, 
  saveUserProfile, 
  getUserProfile,
  getBMICategory 
} from '../../lib/health'

// 健康报告模态窗口
function HealthReportModal({ isOpen, onClose, report, onAdopt }) {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* 标题区 */}
        <div className="bg-gradient-to-r from-primary via-primary-light to-ai-blue p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">✨ 您的专属健康报告</h2>
          <p className="text-sm text-white/90">基于科学公式的个性化分析</p>
        </div>
        
        {/* 内容区 */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-220px)] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* BMI 卡片 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border-2 border-blue-200">
              <div className="text-sm text-text-secondary mb-2">体质指数 BMI</div>
              <div className="text-4xl font-bold mb-2" style={{ color: report.bmiCategory.color }}>
                {report.bmi}
              </div>
              <div className="text-sm font-semibold mb-1" style={{ color: report.bmiCategory.color }}>
                {report.bmiCategory.label}
              </div>
              <div className="text-xs text-text-secondary">
                {report.bmiCategory.advice}
              </div>
            </div>
            
            {/* BMR 卡片 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border-2 border-purple-200">
              <div className="text-sm text-text-secondary mb-2">基础代谢率</div>
              <div className="text-4xl font-bold text-ai-purple mb-2">
                {report.bmr}
              </div>
              <div className="text-xs text-text-secondary leading-relaxed">
                身体在完全静止状态下维持生命所需的最低热量
              </div>
            </div>
            
            {/* TDEE 卡片 - 最重要 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border-2 border-primary/30 md:col-span-1">
              <div className="text-sm text-text-secondary mb-2">每日建议摄入</div>
              <div className="text-4xl font-bold text-primary mb-2">
                {report.tdee}
              </div>
              <div className="text-xs text-primary font-semibold mb-1">kcal/天</div>
              <div className="text-xs text-text-secondary leading-relaxed">
                基于您当前活动水平，建议的每日总热量摄入
              </div>
            </div>
          </div>
          
          {/* 蛋白质目标 */}
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🥚</span>
              <span className="font-semibold text-text-primary">每日蛋白质目标</span>
            </div>
            <div className="text-2xl font-bold text-primary">{report.proteinGoal}g</div>
            <div className="text-xs text-text-secondary mt-1">
              基于体重 {report.userParams.weight}kg，建议摄入 {(report.proteinGoal / report.userParams.weight).toFixed(1)}g/kg
            </div>
          </div>
          
          {/* 健康提示 */}
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div>
                <div className="font-semibold text-text-primary mb-1">温馨提示</div>
                <ul className="text-xs text-text-secondary space-y-1 leading-relaxed">
                  <li>• 以上数据仅供参考，不能替代专业医疗建议</li>
                  <li>• 如需减脂，建议在TDEE基础上减少300-500kcal</li>
                  <li>• 如需增肌，建议在TDEE基础上增加300-500kcal</li>
                  <li>• 建议定期更新身体数据以获得准确的目标值</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部操作区 */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
          <button
            onClick={() => {
              onAdopt(report);
              onClose();
            }}
            className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            ✅ 采纳为我的每日目标
          </button>
          <button
            onClick={onClose}
            className="w-full bg-white text-text-secondary py-3 px-6 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            暂时不了
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    sex: 'male',
    age: 25,
    height: 170,
    weight: 65,
    activityLevel: 1.375,
    goal: 'maintain', // maintain, lose, gain
  });

  const [showReport, setShowReport] = useState(false);
  const [healthReport, setHealthReport] = useState(null);
  const [saved, setSaved] = useState(false);

  // 加载已保存的数据
  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setFormData(profile);
      setSaved(true);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleCalculate = () => {
    const report = generateHealthReport(formData);
    setHealthReport(report);
    setShowReport(true);
  };

  const handleAdoptGoal = (report) => {
    const profileData = {
      ...formData,
      bmr: report.bmr,
      tdee: report.tdee,
      bmi: report.bmi,
      proteinGoal: report.proteinGoal,
      updatedAt: new Date().toISOString(),
    };
    saveUserProfile(profileData);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-bg-light py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* 返回按钮 */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>返回首页</span>
        </Link>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <User className="text-primary" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">我的身体数据</h1>
          </div>
          <p className="text-text-secondary">输入您的身体数据，获取个性化营养目标</p>
        </div>

        {/* 数据输入表单 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* 基础信息 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              基础信息
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 性别 */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">性别</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleInputChange('sex', 'male')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      formData.sex === 'male'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    👨 男性
                  </button>
                  <button
                    onClick={() => handleInputChange('sex', 'female')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      formData.sex === 'female'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    👩 女性
                  </button>
                </div>
              </div>

              {/* 年龄 */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">
                  <Calendar size={16} className="inline mr-1" />
                  年龄
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    min="10"
                    max="120"
                    className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold text-text-primary"
                  />
                  <span className="text-text-secondary font-medium">岁</span>
                </div>
              </div>

              {/* 身高 */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">
                  <Ruler size={16} className="inline mr-1" />
                  身高
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                    min="100"
                    max="250"
                    className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold text-text-primary"
                  />
                  <span className="text-text-secondary font-medium">cm</span>
                </div>
              </div>

              {/* 体重 */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">
                  <Scale size={16} className="inline mr-1" />
                  体重
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 0)}
                    min="30"
                    max="300"
                    className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold text-text-primary"
                  />
                  <span className="text-text-secondary font-medium">kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* 活动水平 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              活动水平
            </h2>
            
            <div className="space-y-3">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleInputChange('activityLevel', level.value)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                    formData.activityLevel === level.value
                      ? 'bg-primary/5 border-primary text-text-primary shadow-md'
                      : 'bg-gray-50 border-gray-100 text-text-secondary hover:border-gray-200'
                  }`}
                >
                  <div className="font-semibold mb-1">{level.label}</div>
                  <div className="text-xs opacity-75">{level.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 目标 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              健康目标
            </h2>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleInputChange('goal', 'lose')}
                className={`p-4 rounded-xl transition-all duration-200 border-2 ${
                  formData.goal === 'lose'
                    ? 'bg-primary/5 border-primary shadow-md'
                    : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">📉</div>
                <div className="font-semibold text-text-primary">减脂</div>
                <div className="text-xs text-text-secondary mt-1">1.6g/kg蛋白质</div>
              </button>
              <button
                onClick={() => handleInputChange('goal', 'maintain')}
                className={`p-4 rounded-xl transition-all duration-200 border-2 ${
                  formData.goal === 'maintain'
                    ? 'bg-primary/5 border-primary shadow-md'
                    : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">➡️</div>
                <div className="font-semibold text-text-primary">维持</div>
                <div className="text-xs text-text-secondary mt-1">1.2g/kg蛋白质</div>
              </button>
              <button
                onClick={() => handleInputChange('goal', 'gain')}
                className={`p-4 rounded-xl transition-all duration-200 border-2 ${
                  formData.goal === 'gain'
                    ? 'bg-primary/5 border-primary shadow-md'
                    : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">📈</div>
                <div className="font-semibold text-text-primary">增肌</div>
                <div className="text-xs text-text-secondary mt-1">2.0g/kg蛋白质</div>
              </button>
            </div>
          </div>

          {/* 计算按钮 */}
          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-4 px-6 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <TrendingUp size={24} />
            <span>计算我的健康数据</span>
          </button>

          {/* 保存提示 */}
          {saved && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm text-center border border-green-200 animate-in fade-in duration-300">
              ✅ 您的数据已保存，计算器已使用您的个性化目标
            </div>
          )}
        </div>
      </div>

      {/* 健康报告模态窗口 */}
      <HealthReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        report={healthReport}
        onAdopt={handleAdoptGoal}
      />
    </div>
  );
}