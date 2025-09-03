import React from "react";
import Header from "../../components/ui/Header";

function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header variant="compact" />
      <main
        id="main-content"
        className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-text-secondary"
      >
        <h1 className="text-3xl font-bold text-[#E5E5E5] mb-4">
          Terms of Service
        </h1>

        <p>
          Welcome to CodeTracker. By accessing or using our application, you
          agree to comply with these Terms of Service. Please read them
          carefully.
        </p>

        {/* Section: Use of Service */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-[#E5E5E5]">
            Use of Service
          </h2>
          <p>
            You may use CodeTracker only for lawful purposes and in accordance
            with these terms. You are responsible for maintaining the
            confidentiality of your account and for any activity that occurs
            under your credentials.
          </p>
        </section>

        {/* Section: User Conduct */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-[#E5E5E5]">
            User Conduct
          </h2>
          <p>
            Users shall not attempt to disrupt our service, gain unauthorized
            access, or misuse any data provided by CodeTracker. Violation of
            these rules may result in suspension or termination of access.
          </p>
        </section>

        {/* Section: Disclaimer */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-[#E5E5E5]">Disclaimer</h2>
          <p>
            CodeTracker is provided on an "as is" basis without warranties of
            any kind. We do not guarantee the accuracy or availability of
            external contest data and are not liable for any damages arising
            from the use of the service.
          </p>
        </section>

        {/* Section: Use of the Website */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-[#E5E5E5]">
            Use of the Website
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              We use your profile information to display your data. By
              continuing to use our site, you consent to us using your profile
              information.
            </li>
            <li>
              The content on this website is for your general information and
              use only. It is subject to change without notice.
            </li>
            <li>
              Neither we nor any third parties provide any warranty or guarantee
              as to the accuracy, timeliness, performance, completeness, or
              suitability of the information and materials found or offered on
              this website for any particular purpose. You acknowledge that such
              information and materials may contain inaccuracies or errors, and
              we expressly exclude liability for any such inaccuracies or errors
              to the fullest extent permitted by law.
            </li>
            <li>
              Your use of any information or materials on this website is
              entirely at your own risk, for which we shall not be liable. It is
              your responsibility to ensure that any products, services, or
              information available through this website meet your specific
              requirements.
            </li>
          </ul>
        </section>

        {/* Section: Intellectual Property */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-[#E5E5E5]">
            Intellectual Property
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              This website contains material that is owned by or licensed to us.
              This material includes, but is not limited to, the design, layout,
              look, appearance, and graphics. Reproduction is prohibited other
              than in accordance with the copyright notice, which forms part of
              these terms and conditions.
            </li>
            <li>
              All trademarks reproduced in this website which are not the
              property of, or licensed to, the operator are acknowledged on the
              website.
            </li>
            <li>
              Unauthorized use of this website may give rise to a claim for
              damages and/or be a criminal offense.
            </li>
          </ul>
        </section>

        {/* Section: Links to Other Websites */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-[#E5E5E5]">
            Links to Other Websites
          </h2>
          <p>
            From time to time, this website may include links to other websites.
            These links are provided for your convenience to provide further
            information. They do not signify that we endorse the website(s). We
            have no responsibility for the content of the linked website(s).
          </p>
        </section>

        {/* Section: Limitation of Liability */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-[#E5E5E5]">
            Limitation of Liability
          </h2>
          <p>
            We as a merchant shall be under no liability whatsoever in respect
            of any loss or damage arising directly or indirectly out of the
            decline of authorization for any transaction, on account of the
            cardholder having exceeded the preset limit mutually agreed by us
            with our acquiring bank from time to time.
          </p>
        </section>

        {/* Section: Governing Law */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-[#E5E5E5]">
            Governing Law
          </h2>
          <p>
            Your use of this website and any dispute arising out of such use of
            the website is subject to the laws of India or other regulatory
            authority.
          </p>
        </section>

        {/* Section: Contact Information */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-[#E5E5E5]">
            Contact Information
          </h2>
          <p>
            For any questions or concerns regarding these terms and conditions,
            please contact us at{" "}
            <a
              href="mailto:pranavpandey9550@gmail.com"
              className="text-primary underline"
            >
              pranavpandey9550@gmail.com
            </a>
            .
          </p>
          <p>
            <strong>TRADE NAME:</strong> PRANAV PANDEY
          </p>
        </section>

        <p>
          By continuing to use CodeTracker you acknowledge that you have read
          and agree to these Terms of Service. If you do not agree, please
          discontinue use of the application.
        </p>
      </main>
    </div>
  );
}

export default TermsOfService;
