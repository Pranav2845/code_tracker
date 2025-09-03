import React from "react";
import Header from "../../components/ui/Header";

function Support() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header variant="compact" />
      <main
        id="main-content"
        className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-text-secondary"
      >
        <h1 className="text-3xl font-bold text-text-primary mb-4">Support</h1>
        <p>
          Need help with CodeTracker? Our team is here to assist you with any questions or
          issues you may encounter.
        </p>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">Get Assistance</h2>
          <p>
            Browse our documentation and FAQs to find quick answers. If you still need
            help, reach out and we'll respond as soon as possible.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">Contact Support</h2>
          <p>
            Email us at <a href="mailto:pranavpandey9550@gmail.com" className="text-primary underline">pranavpandey9550@gmail.com</a> with a detailed
            description of your issue. Please include screenshots or reproduction steps
            when applicable.
          </p>
        </section>
        <p>
          We appreciate your feedback and use it to improve the CodeTracker experience for
          everyone.
        </p>
      </main>
    </div>
  );
}

export default Support;