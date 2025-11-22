import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white mt-auto border-t border-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">轻食热量计算器</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              专注于为您提供科学、便捷的饮食热量计算服务，助您轻松管理身材，享受健康生活。
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">快速链接</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-primary">热量计算器</Link></li>
              <li><Link href="/blog" className="hover:text-primary">健康资讯</Link></li>
              <li><Link href="/about" className="hover:text-primary">关于我们</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">法律信息</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/privacy" className="hover:text-primary">隐私政策</Link></li>
              <li><Link href="/contact" className="hover:text-primary">联系我们</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} 轻食热量计算器. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}