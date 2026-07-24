import { getVisibleLoanProducts } from "@/lib/loan-products-store";
import { readSiteSettings } from "@/lib/site-settings";

const SITE_URL = "https://www.loan247.online";

export async function HomeJsonLd() {
  const loanProducts = await getVisibleLoanProducts();
  const settings = await readSiteSettings();
  const sameAs = Object.values(settings.socialLinks).filter(Boolean);
  const loanServices = loanProducts.map((product) => ({
    "@type": "Service",
    "@id": `${SITE_URL}/loans/${product.slug}#service`,
    name: product.title,
    serviceType: product.title,
    url: `${SITE_URL}/loans/${product.slug}`,
    description: product.description,
    provider: { "@id": `${SITE_URL}/#financialservice` },
    areaServed: "IN",
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "LOAN247",
        url: SITE_URL,
        logo: `${SITE_URL}/images/loan247-logo-card.jpg`,
        sameAs,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+91-9319903728",
          email: "support@loan247.online",
          contactType: "customer support",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
      },
      {
        "@type": "FinancialService",
        "@id": `${SITE_URL}/#financialservice`,
        name: "LOAN247",
        url: SITE_URL,
        image: `${SITE_URL}/images/hero-loan.png`,
        description: "LOAN247 helps customers apply online for personal loans and other finance products.",
        priceRange: "Rs. 59 processing fee where applicable",
        areaServed: "IN",
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "LOAN247 finance pages",
          itemListElement: loanServices.map((service) => ({
            "@type": "Offer",
            itemOffered: service,
          })),
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "100000",
          bestRating: "5",
        },
        review: [
          {
            "@type": "Review",
            author: { "@type": "Person", name: "Rajesh Kumar" },
            reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
            reviewBody: "Fast online loan process and helpful service during an emergency.",
          },
          {
            "@type": "Review",
            author: { "@type": "Person", name: "Priya Sharma" },
            reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
            reviewBody: "Simple process with clear EMI calculation and cooperative support.",
          },
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
        name: "LOAN247",
        url: SITE_URL,
        email: "support@loan247.online",
        telephone: "+91-9319903728",
        taxID: "06IFSPK3336A1ZG",
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "LOAN247",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: settings.homePage.seoTitle,
        description: settings.homePage.seoDescription,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${SITE_URL}/#breadcrumb` },
        mainEntity: { "@id": `${SITE_URL}/#financialservice` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Which loan categories are available on LOAN247?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "LOAN247 includes personal, business, home, gold, education, loan against property, PM Mudra, eligibility, rate, document, CIBIL, and FAQ pages.",
            },
          },
          {
            "@type": "Question",
            name: "Can I apply after choosing a category?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Open a loan category, tap Apply Now, and continue with Google login and the same application process.",
            },
          },
        ],
      },
      {
        "@type": "Article",
        "@id": `${SITE_URL}/loans/pm-mudra-loan#article`,
        headline: "PM Mudra Loan (Pradhan Mantri Mudra Yojana - PMMY)",
        description: "Guidance for PM Mudra Loan categories, documents, eligibility, and business loan application readiness.",
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        dateModified: "2026-07-23",
        mainEntityOfPage: `${SITE_URL}/loans/pm-mudra-loan`,
      },
      ...loanServices,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
