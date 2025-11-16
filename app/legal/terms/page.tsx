import Link from "next/link"
import { Button } from "@/app/components/ui/button"

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for Recipe Health App"
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                ← Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Recipe Health App (&quot;the Service&quot;), you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to these Terms & Conditions, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Recipe Health App provides an AI-powered recipe generation platform with health tracking,
                smart fridge management, and personalized nutrition features. The Service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>AI recipe generation based on available ingredients</li>
                <li>Health and nutrition tracking</li>
                <li>Smart fridge and inventory management</li>
                <li>Meal planning and dietary goal tracking</li>
                <li>AI nutritionist chat assistance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                To access certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and accept all risks of unauthorized access</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law</li>
                <li>Violate or infringe upon the rights of others, including intellectual property rights</li>
                <li>Transmit any harmful, offensive, or objectionable content</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                <li>Use automated systems to access the Service without our express written permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription Plans</h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Plan</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  The Free Plan is available permanently and includes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Up to 50 fridge items</li>
                  <li>Up to 30 saved recipes</li>
                  <li>20 recipe generations per month</li>
                  <li>1 week meal plan at a time</li>
                  <li>30 AI chat messages per month</li>
                </ul>
              </div>
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Plan</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  The Premium Plan offers unlimited access to all features. Pricing and billing terms will be
                  clearly displayed during the upgrade process.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Health and Dietary Information</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
                <p className="text-gray-800 font-semibold mb-2">Important Disclaimer:</p>
                <p className="text-gray-700 leading-relaxed">
                  The nutritional information, recipes, and health recommendations provided by the Service are for
                  informational purposes only and should not be considered medical advice. Always consult with a
                  qualified healthcare provider or registered dietitian before making significant changes to your diet
                  or health routine. We are not responsible for any health issues that may arise from following recipes
                  or recommendations provided by the Service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service and its original content, features, and functionality are owned by Recipe Health App and are
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                User-generated content remains the property of the user, but you grant us a license to use, modify, and
                display such content in connection with the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Account Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We reserve the right to terminate or suspend your account and access to the Service at our sole discretion,
                without notice, for conduct that we believe:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violates these Terms & Conditions</li>
                <li>Is harmful to other users of the Service</li>
                <li>Is harmful to our business operations or reputation</li>
                <li>Violates applicable laws or regulations</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                You may also delete your account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, Recipe Health App shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or
                indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or replace these Terms & Conditions at any time. We will provide notice of
                any material changes by posting the new Terms & Conditions on this page and updating the &quot;Last updated&quot; date.
                Your continued use of the Service after any such changes constitutes your acceptance of the new Terms & Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms & Conditions shall be governed by and construed in accordance with the laws of the jurisdiction
                in which Recipe Health App operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p className="text-gray-700">Email: <a href="mailto:support@recipehealth.app" className="text-emerald-600 hover:underline">support@recipehealth.app</a></p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link href="/legal/privacy">
                <Button variant="outline">
                  View Privacy Policy
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button>
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
