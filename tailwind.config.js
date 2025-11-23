/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 主色调 - 健康活力绿
        primary: '#2ECC71',
        'primary-light': '#58D68D',
        'primary-dark': '#27AE60',
        
        // 点缀色 - AI科技感
        'ai-blue': '#5DADE2',
        'ai-purple': '#8E44AD',
        
        // 背景色
        'bg-light': '#F4F6F7',
        'bg-white': '#FFFFFF',
        
        // 文字色
        'text-primary': '#34495E',
        'text-secondary': '#7F8C8D',
        
        // 警示色
        'danger': '#E74C3C',
        
        // 营养素配色（用于环形图）
        'nutrient': {
          'protein': '#2ECC71',  // 蛋白质 - 绿色
          'carbs': '#F39C12',    // 碳水 - 黄色
          'fat': '#5DADE2',      // 脂肪 - 蓝色
        }
      },
      fontFamily: {
        sans: [
          'PingFang SC',
          'Source Han Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif'
        ],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}