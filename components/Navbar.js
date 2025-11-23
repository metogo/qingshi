import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold flex items-center gap-2 group">
            <span className="text-2xl">🥗</span>
            <span className="text-primary">轻</span>
            <span className="text-text-primary">食热量计算器</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium"
            >
              首页
            </Link>
            <Link
              href="/calendar"
              className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium flex items-center gap-1"
            >
              <span>📅</span>
              热量日历
            </Link>
            <Link
              href="/profile"
              className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium flex items-center gap-1"
            >
              <span>👤</span>
              个人设置
            </Link>
            <Link
              href="/blog"
              className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium"
            >
              健康资讯
            </Link>
            <Link
              href="/about"
              className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium"
            >
              关于我们
            </Link>
          </div>
          
          {/* 移动端菜单按钮 */}
          <button className="md:hidden text-text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}