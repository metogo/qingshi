import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ToastContainer from '../components/Toast'

export const metadata = {
  title: '轻食热量计算器 - 科学减脂，健康饮食',
  description: '专业的轻食热量计算工具，帮助您科学规划饮食，轻松实现减脂目标。提供常见食材热量查询、营养搭配建议。',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  )
}