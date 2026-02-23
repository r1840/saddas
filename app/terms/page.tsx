import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Start
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 24, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed text-muted-foreground">
              By accessing and using CryptoVest, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="leading-relaxed text-muted-foreground">
              CryptoVest provides a cryptocurrency trading simulation platform that allows users to practice trading with virtual funds. All trades and transactions on this platform are simulated and do not involve real cryptocurrency or real money.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="leading-relaxed text-muted-foreground mb-3">
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Being at least 18 years of age</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Trading Platform</h2>
            <p className="leading-relaxed text-muted-foreground">
              CryptoVest provides access to real-time cryptocurrency market data and a comprehensive trading platform. Users are responsible for managing their own accounts and making informed trading decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Market Data</h2>
            <p className="leading-relaxed text-muted-foreground">
              Market data is provided by third-party services and is for informational purposes only. While we strive for accuracy, we do not guarantee the completeness or reliability of market information and are not responsible for any trading decisions made based on this data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
            <p className="leading-relaxed text-muted-foreground mb-3">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the platform for any illegal purposes</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Create multiple accounts to circumvent platform limitations</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="leading-relaxed text-muted-foreground">
              The service and its original content, features, and functionality are owned by CryptoVest and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
            <p className="leading-relaxed text-muted-foreground">
              The service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. We do not warrant that the service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="leading-relaxed text-muted-foreground">
              CryptoVest shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="leading-relaxed text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page. Your continued use of the platform after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <p className="leading-relaxed text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us through our support channels.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
