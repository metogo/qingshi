export const metadata = {
  title: '隐私政策 - 轻食热量计算器',
  description: '轻食热量计算器的隐私政策。',
}

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">隐私政策</h1>
      
      <div className="prose prose-lg text-gray-600 space-y-6">
        <p className="text-sm text-gray-500">最后更新日期：2023年11月22日</p>

        <p>
          轻食热量计算器（以下简称"我们"）非常重视您的隐私。本隐私政策旨在说明我们如何收集、使用和保护您的个人信息。
        </p>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">1. 信息收集</h2>
        <p>
          <strong>我们不收集任何个人身份信息。</strong>
        </p>
        <p>
          我们的计算器工具完全在您的浏览器本地运行。您输入的食材选择、份量等数据仅存储在您的设备内存中，刷新页面后即会丢失，不会上传到我们的服务器。
        </p>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">2. Cookie 和本地存储</h2>
        <p>
          我们目前不使用 Cookie 或本地存储（Local Storage）来追踪您的行为或存储您的偏好。
        </p>
        <p>
          未来如果我们引入用户账户或保存食谱的功能，可能会使用 Cookie 来维持您的登录状态，届时我们会更新本隐私政策并通知您。
        </p>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">3. 第三方服务</h2>
        <p>
          为了优化网站体验和进行流量分析，我们可能会使用第三方的统计工具（如 Google Analytics）。这些工具可能会收集匿名的访问数据，如您的浏览器类型、访问时间、访问页面等，但无法识别您的个人身份。
        </p>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">4. 广告</h2>
        <p>
          我们可能会在网站上展示第三方广告（如 Google AdSense）。这些广告服务商可能会使用 Cookie 来根据您对本网站和其他网站的访问情况向您展示广告。
        </p>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">5. 政策变更</h2>
        <p>
          我们保留随时修改本隐私政策的权利。任何变更都会在本页面上发布，并更新"最后更新日期"。建议您定期查看本页面以了解最新信息。
        </p>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">6. 联系我们</h2>
        <p>
          如果您对本隐私政策有任何疑问，请通过 <a href="/contact" className="text-primary hover:underline">联系我们</a> 页面与我们取得联系。
        </p>
      </div>
    </div>
  )
}