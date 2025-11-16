import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="text-2xl">🍳</span>
              Recipe Health
            </Link>
            <p className="text-sm text-gray-600">
              AI-powered recipe generation and health tracking platform.
              Transform your kitchen into a healthy lifestyle hub.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="text-gray-600 hover:text-emerald-600">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-emerald-600">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/fridge" className="text-gray-600 hover:text-emerald-600">
                  Smart Fridge
                </Link>
              </li>
              <li>
                <Link href="/meal-planning" className="text-gray-600 hover:text-emerald-600">
                  Meal Planning
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-emerald-600">
                  Help Center
                </Link>
              </li>
              <li>
                <a href="mailto:support@recipehealth.app" className="text-gray-600 hover:text-emerald-600">
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-emerald-600">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-gray-600 hover:text-emerald-600">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-gray-600 hover:text-emerald-600">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-600 hover:text-emerald-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-gray-600 hover:text-emerald-600">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/disclaimer" className="text-gray-600 hover:text-emerald-600">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {currentYear} Recipe Health. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link href="/legal/terms" className="text-sm text-gray-600 hover:text-emerald-600">
                Terms
              </Link>
              <Link href="/legal/privacy" className="text-sm text-gray-600 hover:text-emerald-600">
                Privacy
              </Link>
              <a
                href="mailto:privacy@recipehealth.app"
                className="text-sm text-gray-600 hover:text-emerald-600"
              >
                Data Rights
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
