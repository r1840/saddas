import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Powrót do strony głównej
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">Polityka prywatności</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 24, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="leading-relaxed text-muted-foreground">
              CryptoVest respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our cryptocurrency trading simulation platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="leading-relaxed text-muted-foreground mb-3">
              We collect the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Account Information:</strong> Nazwa użytkownika, email address, date of birth, and password (encrypted)</li>
              <li><strong>Trading Activity:</strong> Simulated transactions, portfolio holdings, and trading history</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, and interaction patterns</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and session data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="leading-relaxed text-muted-foreground mb-3">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide and maintain the trading simulation service</li>
              <li>Manage your account and authenticate your identity</li>
              <li>Track your simulated portfolio and trading history</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate important updates and changes to the service</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
            <p className="leading-relaxed text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your password is encrypted using industry-standard hashing algorithms, and we use secure session management to protect your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <p className="leading-relaxed text-muted-foreground mb-3">
              We use third-party services to enhance our platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>CoinGecko API:</strong> Provides real-time cryptocurrency market data</li>
              <li>These services have their own privacy policies and we encourage you to review them</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p className="leading-relaxed text-muted-foreground">
              We use cookies and similar tracking technologies to maintain your session and improve your experience. Session cookies are essential for the platform to function properly and are deleted when you log out or close your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Sharing</h2>
            <p className="leading-relaxed text-muted-foreground mb-3">
              We do not sell your personal information. We may share your data only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
            <p className="leading-relaxed text-muted-foreground mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access and review your personal data</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Object to processing of your personal data</li>
              <li>Export your trading history and portfolio data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
            <p className="leading-relaxed text-muted-foreground">
              We retain your personal information for as long as your account is active or as needed to provide services. If you request account deletion, we will remove your data within 30 days, except where we are required to retain it for legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="leading-relaxed text-muted-foreground">
              Our service is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we discover that a child has provided us with personal information, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
            <p className="leading-relaxed text-muted-foreground">
              Your information may be transferred to and maintained on servers located outside your jurisdiction. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Polityka prywatności</h2>
            <p className="leading-relaxed text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p className="leading-relaxed text-muted-foreground">
              If you have questions about this Polityka prywatności or wish to exercise your privacy rights, please contact us through our support channels. We will respond to your request within 30 days.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
