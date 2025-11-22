export const metadata = {
  title: '关于我们 - 轻食热量计算器',
  description: '了解轻食热量计算器的开发初衷和愿景。',
}

export default function About() {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">关于我们</h1>
      
      <div className="prose prose-lg text-gray-600 space-y-6">
        <p>
          欢迎来到<strong>轻食热量计算器</strong>！
        </p>
        
        <p>
          在这个快节奏的时代，健康饮食往往被忽视。我们经常听到"管住嘴，迈开腿"，但对于大多数人来说，"怎么吃"依然是一个巨大的难题。
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">我们的使命</h2>
        <p>
          我们开发这个工具的初衷很简单：<strong>让健康饮食变得简单、可量化。</strong>
        </p>
        <p>
          我们相信，减脂不应该是一场痛苦的修行，而是一种科学的生活方式。通过精准的数据和便捷的工具，我们希望帮助每一个人：
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>清晰地了解自己每一餐摄入的热量和营养。</li>
          <li>学会科学搭配，不再盲目节食。</li>
          <li>在享受美食的同时，也能拥有理想的身材。</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">为什么选择我们？</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>数据精准</strong>：我们的食材数据参考了权威营养数据库，并结合了市面上常见的轻食食材。</li>
          <li><strong>操作便捷</strong>：无需下载APP，打开网页即可使用，界面简洁直观。</li>
          <li><strong>完全免费</strong>：我们承诺核心功能永久免费，旨在为更多人提供帮助。</li>
        </ul>

        <p className="mt-8">
          健康是一场长跑，我们愿意做你路上的陪跑者。如果你有任何建议或反馈，欢迎随时联系我们。
        </p>
      </div>
    </div>
  )
}