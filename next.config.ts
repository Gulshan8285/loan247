import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async redirects() {
    return [
      { source: "/personal-loan", destination: "/loans/personal-loan", permanent: true },
      { source: "/business-loan", destination: "/loans/business-loan", permanent: true },
      { source: "/home-loan", destination: "/loans/home-loan", permanent: true },
      { source: "/gold-loan", destination: "/loans/gold-loan", permanent: true },
      { source: "/education-loan", destination: "/loans/education-loan", permanent: true },
      { source: "/loan-against-property", destination: "/loans/loan-against-property", permanent: true },
      { source: "/eligibility-checker", destination: "/loans/eligibility-checker", permanent: true },
      { source: "/interest-rate", destination: "/loans/interest-rate", permanent: true },
      { source: "/documents-required", destination: "/loans/documents-required", permanent: true },
      { source: "/cibil-score-guide", destination: "/loans/cibil-score-guide", permanent: true },
      { source: "/loan-faq", destination: "/loans/loan-faq", permanent: true },
      { source: "/pm-mudra-loan", destination: "/loans/pm-mudra-loan", permanent: true },
    ];
  },
};

export default nextConfig;
