import { Mail, MapPin } from 'lucide-react'

export const metadata = {
  title: '联系我们 - 轻食热量计算器',
  description: '有任何问题或建议？欢迎联系我们。',
}

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">联系我们</h1>
      
      <p className="text-gray-600 mb-8 text-lg">
        我们非常重视您的反馈。如果您在使用过程中遇到任何问题，或者有任何改进建议，请随时通过以下方式联系我们。
      </p>

      <div className="space-y-6">
        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">电子邮箱</h3>
            <p className="text-gray-600 mb-2">
              对于一般的咨询、合作意向或技术支持，请发送邮件至：
            </p>
            <a href="mailto:support@qingshi.app" className="text-primary font-medium hover:underline text-lg">
              support@qingshi.app
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">办公地址</h3>
            <p className="text-gray-600">
              北京市朝阳区<br />
              (仅作为注册地址，不接待访客)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">常见问题</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">计算器的数据准确吗？</h3>
            <p className="text-gray-600 text-sm">
              我们的数据来源于权威营养数据库，但具体食材的热量可能会因产地、品种和烹饪方式而略有差异，数据仅供参考。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">我可以提交新的食材吗？</h3>
            <p className="text-gray-600 text-sm">
              当然！如果您发现常用的食材缺失，欢迎通过邮件告诉我们，我们会尽快添加。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}