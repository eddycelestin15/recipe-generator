import Link from "next/link"
import { useTranslations } from "next-intl"

export default function Footer() {
  const t = useTranslations()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="text-2xl">🍳</span>
              {t('footer.brand')}
            </Link>
            <p className="text-sm text-gray-600">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.product')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.features')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.pricing')}
                </Link>
              </li>
              <li>
                <Link href="/fridge" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.smartFridge')}
                </Link>
              </li>
              <li>
                <Link href="/meal-planning" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.mealPlanning')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <a href="mailto:support@recipehealth.app" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.contactUs')}
                </a>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.feedback')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.cookies')}
                </Link>
              </li>
              <li>
                <Link href="/legal/disclaimer" className="text-gray-600 hover:text-emerald-600">
                  {t('footer.disclaimer')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              {t('footer.copyright', { year: currentYear })}
            </p>

            <div className="flex items-center gap-6">
              <Link href="/legal/terms" className="text-sm text-gray-600 hover:text-emerald-600">
                {t('footer.termsShort')}
              </Link>
              <Link href="/legal/privacy" className="text-sm text-gray-600 hover:text-emerald-600">
                {t('footer.privacyShort')}
              </Link>
              <a
                href="mailto:privacy@recipehealth.app"
                className="text-sm text-gray-600 hover:text-emerald-600"
              >
                {t('footer.dataRights')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
