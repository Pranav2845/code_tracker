import React from "react";
import Header from "../../components/ui/Header";

function Contact() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header variant="compact" />
      <main
        id="main-content"
        className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-text-secondary"
      >
        <h1 className="text-3xl font-bold text-text-primary mb-4">Contact Us</h1>
        <p>
          We would love to hear from you. Whether you have a question, feedback, or a
          partnership opportunity, feel free to reach out.
        </p>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">Email</h2>
          <p>
            General inquiries: <a href="mailto:pranavpandey9550@gmail.com" className="text-primary underline">pranavpandey9550@gmail.com</a>
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">Social</h2>
          <p>
  Follow us on{" "}
  <a
    href="https://github.com/Pranav2845"
    className="text-primary underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    GitHub
  </a>
  ,{" "}
  <a
    href="https://twitter.com"
    className="text-primary underline ml-1"
    target="_blank"
    rel="noopener noreferrer"
  >
    Twitter
  </a>{" "}
  and{" "}
  <a
    href="https://www.linkedin.com/in/pranav-pandey001"
    className="text-primary underline ml-1"
    target="_blank"
    rel="noopener noreferrer"
  >
    LinkedIn
  </a>{" "}
  for updates.
</p>

        </section>
        <p>
          For bug reports or feature requests, please open an issue on our GitHub
          repository. Your input helps make CodeTracker better.
        </p>
      </main>
    </div>
  );
}

export default Contact;