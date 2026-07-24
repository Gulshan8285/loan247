export type LoanProduct = {
  id?: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: "loan" | "tool" | "guide";
  description: string;
  summary: string;
  amount: string;
  rate: string;
  tenure: string;
  processing: string;
  highlights: string[];
  documents: string[];
  eligibility: string[];
  faqs: { question: string; answer: string }[];
  purpose?: "Home" | "Education" | "Business" | "Medical" | "Travel" | "Wedding" | "Debt consolidation";
  visible?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    slug: "personal-loan",
    title: "Personal Loan",
    shortTitle: "Personal",
    category: "loan",
    description: "Apply online for a personal loan with quick eligibility checks and simple documentation.",
    summary: "Instant funds for medical needs, travel, wedding, bills, or any urgent personal expense.",
    amount: "Rs. 5,000 to Rs. 8,00,000",
    rate: "Starting 12% p.a.",
    tenure: "6 to 60 months",
    processing: "One-time refundable verification fee may apply",
    purpose: "Medical",
    highlights: ["Fast online journey", "Minimal documents", "Flexible EMI options", "Direct bank transfer"],
    documents: ["PAN card", "Aadhaar or address proof", "Bank statement", "Income proof"],
    eligibility: ["Indian resident", "Age 21 years or above", "Stable income source", "Active bank account"],
    faqs: [
      { question: "How fast can I apply?", answer: "The online application can be completed in a few minutes." },
      { question: "Will applying affect my credit score?", answer: "The initial journey is designed to avoid credit score impact." },
    ],
  },
  {
    slug: "business-loan",
    title: "Business Loan",
    shortTitle: "Business",
    category: "loan",
    description: "Working capital and growth finance options for small businesses and self-employed applicants.",
    summary: "Funds for stock, equipment, daily operations, marketing, or seasonal business needs.",
    amount: "Rs. 25,000 to Rs. 8,00,000",
    rate: "Starting 14% p.a.",
    tenure: "6 to 48 months",
    processing: "Transparent charges shown before submission",
    purpose: "Business",
    highlights: ["For shop owners and self-employed users", "Simple bank verification", "Quick decision flow", "EMI-friendly repayment"],
    documents: ["PAN card", "Business proof", "Bank statement", "Address proof"],
    eligibility: ["Business vintage preferred", "Active bank account", "Regular monthly transactions", "Valid PAN"],
    faqs: [
      { question: "Can small shop owners apply?", answer: "Yes, eligible small business owners can apply online." },
      { question: "Is collateral required?", answer: "Most small-ticket online offers are unsecured, based on eligibility." },
    ],
  },
  {
    slug: "home-loan",
    title: "Home Loan",
    shortTitle: "Home",
    category: "loan",
    description: "Home loan guidance for purchase, construction, renovation, and balance transfer needs.",
    summary: "Compare repayment plans and prepare documents before choosing the right home finance option.",
    amount: "Based on property and income eligibility",
    rate: "Lender-specific rate",
    tenure: "Up to long-term repayment options",
    processing: "Charges depend on lender policy",
    purpose: "Home",
    highlights: ["Property purchase support", "Renovation guidance", "Document checklist", "EMI planning"],
    documents: ["PAN card", "Income proof", "Property papers", "Bank statement"],
    eligibility: ["Stable income", "Valid property documents", "Age and repayment fit", "Banking history"],
    faqs: [
      { question: "Can I check EMI first?", answer: "Yes, use the EMI calculator before starting your application." },
      { question: "Are property documents needed?", answer: "Yes, property papers are normally required for home loan processing." },
    ],
  },
  {
    slug: "gold-loan",
    title: "Gold Loan",
    shortTitle: "Gold",
    category: "loan",
    description: "Gold-backed loan information for quick liquidity against eligible gold ornaments.",
    summary: "Understand eligibility, documents, repayment, and valuation before applying.",
    amount: "Depends on gold value",
    rate: "Lender-specific rate",
    tenure: "Short to medium-term options",
    processing: "As per lender and valuation",
    highlights: ["Gold valuation guidance", "Fast document checklist", "Flexible repayment", "Secure process"],
    documents: ["PAN card", "Aadhaar or address proof", "Gold ownership details", "Bank details"],
    eligibility: ["Eligible gold ornaments", "Valid KYC", "Indian resident", "Active phone number"],
    faqs: [
      { question: "Is CIBIL mandatory for gold loan?", answer: "Gold loans are primarily backed by gold value, but lender checks may apply." },
      { question: "How is amount decided?", answer: "The eligible amount depends on valuation and lender loan-to-value rules." },
    ],
  },
  {
    slug: "education-loan",
    title: "Education Loan",
    shortTitle: "Education",
    category: "loan",
    description: "Education finance guidance for tuition fees, course expenses, and study-related needs.",
    summary: "Plan education costs with documents, eligibility, and EMI information in one place.",
    amount: "Based on course and eligibility",
    rate: "Lender-specific rate",
    tenure: "Course-linked repayment options",
    processing: "As shown before application",
    purpose: "Education",
    highlights: ["Course expense planning", "Student-friendly checklist", "Co-applicant guidance", "EMI estimates"],
    documents: ["Admission proof", "PAN/KYC", "Fee structure", "Co-applicant income proof"],
    eligibility: ["Confirmed admission preferred", "Valid KYC", "Repayment capacity", "Bank account"],
    faqs: [
      { question: "Can students apply?", answer: "Students may apply with required documents and co-applicant details where needed." },
      { question: "What expenses are covered?", answer: "Tuition and eligible study-related expenses may be considered." },
    ],
  },
  {
    slug: "loan-against-property",
    title: "Loan Against Property",
    shortTitle: "Property",
    category: "loan",
    description: "Understand secured loan options against residential or commercial property.",
    summary: "Use property value to explore larger-ticket finance with structured repayment.",
    amount: "Based on property valuation",
    rate: "Lender-specific secured rate",
    tenure: "Medium to long-term options",
    processing: "Valuation and legal charges may apply",
    purpose: "Business",
    highlights: ["Property-backed finance", "Higher amount potential", "Business and personal use", "Structured EMI planning"],
    documents: ["Property papers", "PAN/KYC", "Income proof", "Bank statement"],
    eligibility: ["Clear property title", "Repayment capacity", "Valid KYC", "Ownership proof"],
    faqs: [
      { question: "Is property verification required?", answer: "Yes, legal and valuation checks are normally part of the process." },
      { question: "Can business owners apply?", answer: "Yes, eligible business owners can explore loan against property options." },
    ],
  },
  {
    slug: "eligibility-checker",
    title: "Eligibility Checker",
    shortTitle: "Eligibility",
    category: "tool",
    description: "Check your basic loan eligibility before filling the full application.",
    summary: "Review age, income, documents, bank details, and repayment fit before applying.",
    amount: "Eligibility-based",
    rate: "Depends on profile",
    tenure: "Depends on approved offer",
    processing: "No hidden steps",
    highlights: ["Quick profile check", "Document readiness", "Income fit", "Bank account validation"],
    documents: ["PAN card", "Mobile number", "Income details", "Bank details"],
    eligibility: ["Age 21+", "Valid PAN", "Indian mobile number", "Active bank account"],
    faqs: [
      { question: "Is this a final approval?", answer: "No, final approval depends on lender checks and submitted documents." },
      { question: "Can I apply after checking?", answer: "Yes, use Apply Now to continue the same online journey." },
    ],
  },
  {
    slug: "interest-rate",
    title: "Interest Rate Page",
    shortTitle: "Rates",
    category: "guide",
    description: "Learn how loan interest rates, tenure, and EMI affect your total repayment.",
    summary: "Compare monthly EMI, total interest, and repayment amount before applying.",
    amount: "As per selected loan",
    rate: "Starting 12% p.a. for eligible profiles",
    tenure: "6 to 60 months",
    processing: "Displayed before payment",
    highlights: ["Rate basics", "EMI effect", "Tenure comparison", "Transparent repayment"],
    documents: ["PAN card", "Income proof", "Bank statement", "Address proof"],
    eligibility: ["Profile-based rate", "Income fit", "Credit and banking checks", "Valid KYC"],
    faqs: [
      { question: "Does lower EMI always mean cheaper loan?", answer: "Not always. Longer tenure can reduce EMI but increase total interest." },
      { question: "Where can I calculate EMI?", answer: "Use the EMI calculator on the home page before applying." },
    ],
  },
  {
    slug: "documents-required",
    title: "Loan Documents Required",
    shortTitle: "Documents",
    category: "guide",
    description: "Keep loan documents ready before starting your LOAN247 application.",
    summary: "A simple checklist for KYC, income, banking, address, and loan-specific documents.",
    amount: "Applies to all loan types",
    rate: "Profile-based",
    tenure: "Offer-based",
    processing: "Document verification may apply",
    highlights: ["KYC checklist", "Income proof list", "Bank details", "Faster processing"],
    documents: ["PAN card", "Aadhaar/address proof", "Bank statement", "Income proof"],
    eligibility: ["Readable documents", "Matching applicant details", "Active bank account", "Valid mobile number"],
    faqs: [
      { question: "Is PAN required?", answer: "PAN is generally required for financial verification." },
      { question: "Can I submit later?", answer: "Keeping documents ready helps avoid delays." },
    ],
  },
  {
    slug: "cibil-score-guide",
    title: "CIBIL Score Guide",
    shortTitle: "CIBIL",
    category: "guide",
    description: "Understand how CIBIL score can affect loan eligibility, amount, and processing.",
    summary: "Learn what score means, why it matters, and how to prepare before applying.",
    amount: "Score and income based",
    rate: "May vary by credit profile",
    tenure: "Offer-based",
    processing: "Verification fee may apply for low-score cases",
    highlights: ["Score basics", "Eligibility impact", "Low-score guidance", "Repayment tips"],
    documents: ["PAN card", "Mobile number", "Bank statement", "Income proof"],
    eligibility: ["Valid PAN", "Accurate personal details", "Active phone number", "Repayment capacity"],
    faqs: [
      { question: "What is a good CIBIL score?", answer: "Higher scores generally improve approval chances and offer quality." },
      { question: "Can low CIBIL users apply?", answer: "They can apply, but final options depend on lender checks." },
    ],
  },
  {
    slug: "loan-faq",
    title: "Loan FAQ",
    shortTitle: "FAQ",
    category: "guide",
    description: "Answers to common questions about LOAN247 applications, EMI, documents, and support.",
    summary: "Quick answers for application status, documents, verification fee, repayment, and support.",
    amount: "Question-based",
    rate: "Question-based",
    tenure: "Question-based",
    processing: "Question-based",
    highlights: ["Application help", "Payment help", "Document answers", "Support details"],
    documents: ["PAN card", "Mobile number", "Bank details", "Income details"],
    eligibility: ["Depends on selected loan", "Valid KYC", "Income fit", "Bank verification"],
    faqs: [
      { question: "How do I contact support?", answer: "Use support@loan247.online or the contact details in the footer." },
      { question: "Is the processing fee refundable?", answer: "It may be refundable if the loan is not disbursed, subject to policy review." },
    ],
  },
  {
    slug: "pm-mudra-loan",
    title: "PM Mudra Loan",
    shortTitle: "Mudra",
    category: "loan",
    description: "Pradhan Mantri Mudra Yojana (PMMY) guidance for micro and small business finance.",
    summary: "Learn about Shishu, Kishor, and Tarun categories before starting your business loan journey.",
    amount: "As per PMMY category and eligibility",
    rate: "As per lender guidelines",
    tenure: "Lender-specific repayment",
    processing: "As per lender policy",
    purpose: "Business",
    highlights: ["PMMY category guidance", "Micro business support", "Document checklist", "Apply online journey"],
    documents: ["PAN card", "Aadhaar/KYC", "Business proof", "Bank statement"],
    eligibility: ["Micro or small business need", "Valid KYC", "Business activity details", "Repayment ability"],
    faqs: [
      { question: "What is PM Mudra Loan?", answer: "It is a government-backed scheme framework for eligible micro and small business borrowers." },
      { question: "Can I apply from LOAN247?", answer: "You can start the online journey and prepare your details for eligible business finance options." },
    ],
  },
];

export function getLoanProduct(slug: string | null | undefined) {
  return LOAN_PRODUCTS.find((product) => product.slug === slug) || null;
}
