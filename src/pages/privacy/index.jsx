import React from "react";
import Header from "../../components/ui/Header";

function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header variant="compact" />
      <main
        id="main-content"
        className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-text-secondary"
      >
        <h1 className="text-3xl font-bold text-text-primary mb-4">Privacy Policy</h1>
        <p>
          Your privacy is important to us. This policy explains how CodeTracker collects,
          uses, and protects your information when you use our services.
        </p>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">Information We Collect</h2>
          <p>
            We collect only the information necessary to provide our services, such as
            your account details and usage data. We do not sell or rent your personal
            information to third parties.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">How We Use Information</h2>
          <p>
            The information we collect is used to operate and improve CodeTracker, to
            personalize your experience, and to communicate with you about updates or
            support requests.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">Data Security</h2>
          <p>
            We implement industry-standard measures to safeguard your data. However, no
            method of transmission over the internet is completely secure, and we cannot
            guarantee absolute security.
          </p>
        </section>
        <p>
          By using CodeTracker, you consent to this Privacy Policy. If you have any
          questions, please contact us at <a href="mailto:pranavpandey9550@gmail.com" className="text-primary underline">pranavpandey9550@gmail.com</a>.
        </p>
      </main>
    </div>
  );
}

export default PrivacyPolicy;