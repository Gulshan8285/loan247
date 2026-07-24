import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { connectMongoDB } from "@/lib/mongodb";

export type LegalPageCategory = "company" | "legal" | "support";

export type LegalPage = {
  id: string;
  slug: string;
  title: string;
  menuLabel: string;
  description: string;
  content: string;
  category: LegalPageCategory;
  visible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type LegalPageInput = Partial<
  Pick<
    LegalPage,
    "slug" | "title" | "menuLabel" | "description" | "content" | "category" | "visible" | "order"
  >
>;

const DATA_FILE = process.env.VERCEL
  ? path.join("/tmp", "loan247-legal-pages.json")
  : path.join(process.cwd(), "db", "legal-pages.json");
const MONGO_COLLECTION = "loan247_legal_pages";
const MONGO_DOCUMENT_ID = "current";

export const COMPANY_CONTACT = {
  email: "support@loan247.online",
  phones: ["9319903728", "8810381949"],
  gst: "06IFSPK3336A1ZG",
  msme: "UDYAM-HR-05-0004197",
};

const now = "2026-07-23T00:00:00.000Z";

export const DEFAULT_LEGAL_PAGES: LegalPage[] = [
  {
    id: "default-about-us",
    slug: "about-us",
    title: "About Us",
    menuLabel: "About Us",
    description: "Know more about LOAN247 and our customer support information.",
    category: "company",
    visible: true,
    order: 10,
    createdAt: now,
    updatedAt: now,
    content: `LOAN247 is a digital lending assistance platform focused on helping customers complete a simple online personal-loan application journey.

Our goal is to make loan application support quick, transparent, and easy to access. We help customers submit their details, verify basic information, and connect with the next step in the loan process.

Customer support
Email: support@loan247.online
Phone: 9319903728, 8810381949

Business verification details
GSTIN: 06IFSPK3336A1ZG
MSME/Udyam Registration: UDYAM-HR-05-0004197`,
  },
  {
    id: "default-contact-us",
    slug: "contact-us",
    title: "Contact Us",
    menuLabel: "Contact Us",
    description: "Reach LOAN247 support for questions about your application.",
    category: "support",
    visible: true,
    order: 20,
    createdAt: now,
    updatedAt: now,
    content: `For any support request, application question, payment query, or data request, please contact LOAN247 support.

Email: support@loan247.online
Phone: 9319903728
Alternate Phone: 8810381949

Support hours
Our support team reviews requests on all working days and responds as quickly as possible.

Business details
GSTIN: 06IFSPK3336A1ZG
MSME/Udyam Registration: UDYAM-HR-05-0004197`,
  },
  {
    id: "default-privacy-policy",
    slug: "privacy-policy",
    title: "Privacy Policy",
    menuLabel: "Privacy Policy",
    description: "How LOAN247 collects, uses, stores, and protects customer information.",
    category: "legal",
    visible: true,
    order: 30,
    createdAt: now,
    updatedAt: now,
    content: `This Privacy Policy explains how LOAN247 collects, uses, stores, and protects information submitted through our website.

Information we collect
We may collect your name, phone number, email address, date of birth, address, PAN, bank details, employment details, income details, loan requirement, device information, and application activity.

How we use information
We use customer information to process loan applications, verify identity, perform eligibility checks, communicate application updates, provide support, prevent fraud, improve services, and comply with applicable legal or regulatory requirements.

Data sharing
We may share information with lending partners, verification partners, payment partners, technology service providers, and legal or regulatory authorities when required. We do not sell customer personal data.

Data security
We use reasonable technical and organizational safeguards to protect customer data from unauthorized access, misuse, loss, or alteration.

Contact for privacy requests
Email: support@loan247.online
Phone: 9319903728, 8810381949`,
  },
  {
    id: "default-terms-conditions",
    slug: "terms-conditions",
    title: "Terms & Conditions",
    menuLabel: "Terms & Conditions",
    description: "Terms for using the LOAN247 website and loan application services.",
    category: "legal",
    visible: true,
    order: 40,
    createdAt: now,
    updatedAt: now,
    content: `By using the LOAN247 website, you agree to these Terms & Conditions.

Eligibility
You must provide accurate and complete information while applying. Any incorrect, incomplete, or misleading information may lead to rejection, cancellation, or further verification.

Service scope
LOAN247 provides a digital application and assistance experience. Loan approval, amount, tenure, interest, disbursal, and rejection decisions may depend on eligibility, verification, credit checks, lender policies, and applicable laws.

Customer responsibility
You are responsible for reviewing all information before submission, keeping your contact details updated, and ensuring that payment or bank information entered on the website is correct.

Fees and payments
Any displayed processing, service, or convenience fee must be reviewed before payment. Payment of any fee does not guarantee loan approval or disbursal.

Changes to terms
LOAN247 may update these terms from time to time. Continued use of the website means you accept the updated terms.`,
  },
  {
    id: "default-disclaimer",
    slug: "disclaimer",
    title: "Disclaimer",
    menuLabel: "Disclaimer",
    description: "Important disclaimers about loan approval, fees, and website information.",
    category: "legal",
    visible: true,
    order: 50,
    createdAt: now,
    updatedAt: now,
    content: `The information on the LOAN247 website is provided for general application assistance and customer convenience.

No approval guarantee
Submitting an application or paying any service fee does not guarantee loan approval, disbursal, or a specific loan amount.

Eligibility and verification
Loan decisions may depend on customer eligibility, document verification, credit profile, bank verification, lender policies, and other checks.

Fee disclaimer
Any service or processing fee is charged for application processing, verification, platform usage, or related services. Unless specifically stated in the Refund Policy or required by law, such fees may be non-refundable.

Customer confirmation
By continuing on the website, you confirm that you have read and understood the relevant terms, privacy policy, refund policy, and disclaimers.`,
  },
  {
    id: "default-refund-policy",
    slug: "refund-policy",
    title: "Refund Policy",
    menuLabel: "Refund Policy",
    description: "Refund rules for LOAN247 service or processing fees.",
    category: "legal",
    visible: true,
    order: 60,
    createdAt: now,
    updatedAt: now,
    content: `This Refund Policy explains how refund requests are handled for any service, processing, or convenience fee paid through LOAN247.

General rule
Fees paid for application processing, verification, platform services, or convenience services are generally non-refundable after the service has started or the application has been processed.

When a refund may be reviewed
A refund request may be reviewed if there is a duplicate payment, technical payment failure, incorrect debit with no service access, or any case where applicable law requires a refund.

How to request a refund
Email support@loan247.online with your name, phone number, payment date, payment amount, transaction reference, and reason for the refund request.

Review timeline
Eligible requests will be reviewed and responded to within a reasonable time. Approved refunds, if any, will be processed to the original payment method where possible.`,
  },
  {
    id: "default-cookie-policy",
    slug: "cookie-policy",
    title: "Cookie Policy",
    menuLabel: "Cookie Policy",
    description: "How LOAN247 uses cookies and similar technologies.",
    category: "legal",
    visible: true,
    order: 70,
    createdAt: now,
    updatedAt: now,
    content: `LOAN247 may use cookies, local storage, pixels, and similar technologies to operate and improve the website.

Why we use cookies
Cookies may help remember user preferences, maintain session continuity, improve website performance, analyze usage, protect against fraud, and support service functionality.

Types of cookies
We may use essential cookies, preference cookies, analytics cookies, and security cookies.

Managing cookies
You can control or delete cookies through your browser settings. Some website features may not work properly if essential cookies are disabled.

Contact
For cookie-related questions, email support@loan247.online.`,
  },
  {
    id: "default-aml-kyc-policy",
    slug: "aml-kyc-policy",
    title: "AML/KYC Policy",
    menuLabel: "AML/KYC Policy",
    description: "Identity verification and anti-money laundering checks for application safety.",
    category: "legal",
    visible: true,
    order: 80,
    createdAt: now,
    updatedAt: now,
    content: `LOAN247 may follow identity verification and anti-fraud checks to support safe application processing.

KYC information
Customers may be asked to provide name, phone number, email, PAN, address, bank details, income details, and other information needed for verification.

AML and fraud checks
Applications may be reviewed for suspicious activity, duplicate identities, inaccurate information, payment misuse, or other risk indicators.

Customer responsibility
Customers must provide true, accurate, and updated information. False or misleading information may result in rejection, account restriction, or reporting where legally required.

Record keeping
Verification records may be retained as required for operational, legal, compliance, and dispute-resolution purposes.`,
  },
  {
    id: "default-grievance-redressal",
    slug: "grievance-redressal",
    title: "Grievance Redressal",
    menuLabel: "Grievance Redressal",
    description: "How customers can raise concerns or complaints with LOAN247.",
    category: "support",
    visible: true,
    order: 90,
    createdAt: now,
    updatedAt: now,
    content: `LOAN247 aims to resolve customer concerns in a fair and timely manner.

How to raise a grievance
Email support@loan247.online with your full name, registered phone number, application reference if available, payment details if applicable, and a clear description of the issue.

Phone support
You may also contact us at 9319903728 or 8810381949.

Review process
Our support team will review your concern, may request additional details, and will try to provide a suitable response or resolution as soon as possible.

Escalation
If your concern is not resolved, reply to the same email thread with the word Escalation and include the earlier complaint details.`,
  },
  {
    id: "default-data-deletion-policy",
    slug: "data-deletion-policy",
    title: "Data Deletion Policy",
    menuLabel: "Data Deletion Policy",
    description: "How customers can request deletion of personal data from LOAN247.",
    category: "legal",
    visible: true,
    order: 100,
    createdAt: now,
    updatedAt: now,
    content: `Customers may request deletion of personal data submitted to LOAN247, subject to legal, compliance, fraud-prevention, accounting, dispute-resolution, and operational retention requirements.

How to request deletion
Email support@loan247.online from your registered email address or include your registered phone number. Mention Data Deletion Request in the subject.

Details to include
Include your full name, phone number, email address, application reference if available, and the specific data you want deleted.

Verification
We may verify your identity before processing the request to protect customer information from unauthorized deletion.

Retention exceptions
Some records may be retained where required by law, compliance obligations, fraud prevention, accounting records, payment disputes, or legitimate business needs.

Response
We will review and respond to deletion requests within a reasonable time.`,
  },
];

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeCategory(value: unknown): LegalPageCategory {
  return value === "company" || value === "support" || value === "legal" ? value : "legal";
}

function normalizePage(page: Partial<LegalPage>, index: number): LegalPage {
  const title = String(page.title || "Untitled Page").trim();
  const slug = slugify(String(page.slug || title)) || `page-${index + 1}`;
  const timestamp = new Date().toISOString();

  return {
    id: String(page.id || randomUUID()),
    slug,
    title,
    menuLabel: String(page.menuLabel || title).trim(),
    description: String(page.description || ""),
    content: String(page.content || ""),
    category: normalizeCategory(page.category),
    visible: page.visible !== false,
    order: Number.isFinite(Number(page.order)) ? Number(page.order) : (index + 1) * 10,
    createdAt: String(page.createdAt || timestamp),
    updatedAt: String(page.updatedAt || timestamp),
  };
}

function sortPages(pages: LegalPage[]) {
  return [...pages].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

async function ensureDataDir() {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
}

function canUseMongoStorage() {
  return Boolean(process.env.MONGODB_URI);
}

async function readMongoLegalPages(): Promise<LegalPage[] | null> {
  if (!canUseMongoStorage()) return null;

  const connection = await connectMongoDB();
  const database = connection.connection.db;
  if (!database) throw new Error("MongoDB database is not available.");

  const document = await database
    .collection(MONGO_COLLECTION)
    .findOne<{ key: string; pages?: LegalPage[] }>({ key: MONGO_DOCUMENT_ID });

  if (!document || !Array.isArray(document.pages)) return null;
  return sortPages(document.pages.map(normalizePage));
}

async function writeMongoLegalPages(pages: LegalPage[]) {
  if (!canUseMongoStorage()) return false;

  const connection = await connectMongoDB();
  const database = connection.connection.db;
  if (!database) throw new Error("MongoDB database is not available.");

  await database.collection(MONGO_COLLECTION).updateOne(
    { key: MONGO_DOCUMENT_ID },
    {
      $set: {
        key: MONGO_DOCUMENT_ID,
        pages: sortPages(pages),
        updatedAt: new Date().toISOString(),
      },
      $setOnInsert: {
        createdAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );

  return true;
}

export async function readLegalPages(): Promise<LegalPage[]> {
  try {
    const mongoPages = await readMongoLegalPages();
    if (mongoPages) return mongoPages;
  } catch {
    /* fall back to file/default storage */
  }

  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return sortPages(DEFAULT_LEGAL_PAGES);
    return sortPages(parsed.map(normalizePage));
  } catch {
    return sortPages(DEFAULT_LEGAL_PAGES);
  }
}

async function writeLegalPages(pages: LegalPage[]) {
  try {
    if (await writeMongoLegalPages(pages)) return;
  } catch {
    /* fall back to file storage */
  }

  await ensureDataDir();
  await writeFile(DATA_FILE, JSON.stringify(sortPages(pages), null, 2));
}

export async function getVisibleLegalPages() {
  const pages = await readLegalPages();
  return pages.filter((page) => page.visible);
}

export async function findLegalPage(slug: string) {
  const normalizedSlug = slugify(slug);
  const pages = await readLegalPages();
  return pages.find((page) => page.slug === normalizedSlug && page.visible) || null;
}

export async function createLegalPage(input: LegalPageInput) {
  const pages = await readLegalPages();
  const title = String(input.title || "New Page").trim();
  const slug = slugify(String(input.slug || title));

  if (!slug) throw new Error("Page URL is required.");
  if (pages.some((page) => page.slug === slug)) throw new Error("A page with this URL already exists.");

  const timestamp = new Date().toISOString();
  const page = normalizePage(
    {
      ...input,
      id: randomUUID(),
      slug,
      title,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    pages.length,
  );

  await writeLegalPages([...pages, page]);
  return page;
}

export async function updateLegalPage(slug: string, input: LegalPageInput) {
  const currentSlug = slugify(slug);
  const pages = await readLegalPages();
  const index = pages.findIndex((page) => page.slug === currentSlug);
  if (index < 0) throw new Error("Page not found.");

  const nextSlug = slugify(String(input.slug || pages[index].slug));
  if (!nextSlug) throw new Error("Page URL is required.");
  if (pages.some((page, pageIndex) => pageIndex !== index && page.slug === nextSlug)) {
    throw new Error("A page with this URL already exists.");
  }

  const updated = normalizePage(
    {
      ...pages[index],
      ...input,
      slug: nextSlug,
      updatedAt: new Date().toISOString(),
    },
    index,
  );

  pages[index] = updated;
  await writeLegalPages(pages);
  return updated;
}

export async function deleteLegalPage(slug: string) {
  const currentSlug = slugify(slug);
  const pages = await readLegalPages();
  const nextPages = pages.filter((page) => page.slug !== currentSlug);
  if (nextPages.length === pages.length) throw new Error("Page not found.");
  await writeLegalPages(nextPages);
}
