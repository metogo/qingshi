import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2">
            🥗 轻食热量计算器
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
              首页
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-primary transition-colors">
              健康资讯
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-primary transition-colors">
              关于我们
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}