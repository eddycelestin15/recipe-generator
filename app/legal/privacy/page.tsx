import Link from "next/link"
import { Button } from "@/app/components/ui/button"

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Recipe Health App"
}

export default function PrivacyPage() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Recipe Health App (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read
                this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access
                the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Register for an account (name, email address, password)</li>
                <li>Complete your user profile (age, gender, height, weight, activity level)</li>
                <li>Set up dietary preferences and health goals</li>
                <li>Use our AI features and chat services</li>
                <li>Upload photos or images to the Service</li>
                <li>Contact us for support or feedback</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Health and Dietary Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We collect health-related information you provide, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Dietary restrictions and allergies</li>
                <li>Nutrition and health goals</li>
                <li>Food preferences and dislikes</li>
                <li>Meal logs and nutrition tracking data</li>
                <li>Weight and fitness tracking information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Usage Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We automatically collect certain information when you use the Service:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Device information (device type, operating system, browser type)</li>
                <li>Usage data (pages visited, features used, time spent on the Service)</li>
                <li>IP address and general location information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.4 Third-Party Authentication</h3>
              <p className="text-gray-700 leading-relaxed">
                When you sign up using Google or GitHub OAuth, we receive your name, email address, and profile picture
                from these services. We do not receive your password from these third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide, maintain, and improve the Service</li>
                <li>Create and manage your account</li>
                <li>Generate personalized recipe recommendations</li>
                <li>Track your nutrition and health progress</li>
                <li>Provide AI-powered features like recipe generation and nutritionist chat</li>
                <li>Send you notifications about your account and Service updates</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for the Service to function properly (authentication, security)</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use the Service</li>
                <li><strong>Marketing Cookies:</strong> Track your activity to provide relevant content</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                You can control cookies through your browser settings, but disabling certain cookies may limit your ability
                to use some features of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How We Share Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (hosting, analytics, payment processing)</li>
                <li><strong>AI Services:</strong> With Google Gemini AI for recipe generation and chat features (data is processed according to Google&apos;s privacy policy)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition of all or part of our business</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights (GDPR Compliance)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you are located in the European Economic Area (EEA), you have certain data protection rights:
              </p>
              <div className="bg-blue-50 p-6 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">Right to Access</p>
                  <p className="text-gray-700 text-sm">Request a copy of the personal data we hold about you</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Right to Rectification</p>
                  <p className="text-gray-700 text-sm">Request correction of inaccurate or incomplete data</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Right to Erasure</p>
                  <p className="text-gray-700 text-sm">Request deletion of your personal data (&quot;right to be forgotten&quot;)</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Right to Restrict Processing</p>
                  <p className="text-gray-700 text-sm">Request limitation of how we process your data</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Right to Data Portability</p>
                  <p className="text-gray-700 text-sm">Request transfer of your data to another service</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Right to Object</p>
                  <p className="text-gray-700 text-sm">Object to processing of your personal data</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Right to Withdraw Consent</p>
                  <p className="text-gray-700 text-sm">Withdraw consent for data processing at any time</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, please contact us using the information provided in Section 11.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Encryption of data in transit using SSL/TLS</li>
                <li>Secure password storage using bcrypt hashing</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure cloud infrastructure (MongoDB, Vercel)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive
                to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide you with
                the Service. If you delete your account, we will delete or anonymize your personal information within 30 days,
                except where we are required to retain it for legal, accounting, or security purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service is not intended for children under the age of 13. We do not knowingly collect personal information
                from children under 13. If you are a parent or guardian and believe your child has provided us with personal
                information, please contact us, and we will delete such information from our systems.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
                the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this
                Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you have any questions about this Privacy Policy or our data practices, or if you wish to exercise your
                privacy rights, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> <a href="mailto:privacy@recipehealth.app" className="text-emerald-600 hover:underline">privacy@recipehealth.app</a>
                </p>
                <p className="text-gray-700">
                  <strong>Data Protection Officer:</strong> <a href="mailto:dpo@recipehealth.app" className="text-emerald-600 hover:underline">dpo@recipehealth.app</a>
                </p>
              </div>
            </section>

            <section className="bg-emerald-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Privacy Matters</h2>
              <p className="text-gray-700 leading-relaxed">
                We are committed to transparency and protecting your privacy. Your trust is important to us, and we
                continuously work to ensure your data is handled securely and responsibly.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link href="/legal/terms">
                <Button variant="outline">
                  View Terms & Conditions
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
