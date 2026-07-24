import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { connectMongoDB } from "@/lib/mongodb";
import { LOAN_PRODUCTS, type LoanProduct } from "@/lib/loan-products";
import { slugify } from "@/lib/legal-pages";

export type LoanProductInput = Partial<LoanProduct>;

const DATA_FILE = process.env.VERCEL
  ? path.join("/tmp", "loan247-loan-products.json")
  : path.join(process.cwd(), "db", "loan-products.json");
const MONGO_COLLECTION = "loan247_loan_products";
const MONGO_DOCUMENT_ID = "current";

function normalizeList(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeFaqs(value: unknown): LoanProduct["faqs"] {
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        question: String(item?.question || "").trim(),
        answer: String(item?.answer || "").trim(),
      }))
      .filter((item) => item.question && item.answer);
  }

  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, ...answerParts] = line.split("|");
      return {
        question: String(question || "").trim(),
        answer: answerParts.join("|").trim(),
      };
    })
    .filter((item) => item.question && item.answer);
}

function normalizeCategory(value: unknown): LoanProduct["category"] {
  return value === "tool" || value === "guide" || value === "loan" ? value : "loan";
}

function normalizePurpose(value: unknown): LoanProduct["purpose"] | undefined {
  const purpose = String(value || "").trim();
  if (
    purpose === "Home" ||
    purpose === "Education" ||
    purpose === "Business" ||
    purpose === "Medical" ||
    purpose === "Travel" ||
    purpose === "Wedding" ||
    purpose === "Debt consolidation"
  ) {
    return purpose;
  }
  return undefined;
}

function normalizeProduct(product: Partial<LoanProduct>, index: number): LoanProduct {
  const title = String(product.title || "New Loan Category").trim();
  const slug = slugify(String(product.slug || title)) || `loan-category-${index + 1}`;
  const fallback = LOAN_PRODUCTS[index] || LOAN_PRODUCTS[0];

  return {
    id: String(product.id || randomUUID()),
    slug,
    title,
    shortTitle: String(product.shortTitle || title).trim(),
    category: normalizeCategory(product.category),
    description: String(product.description || fallback?.description || ""),
    summary: String(product.summary || product.description || fallback?.summary || ""),
    amount: String(product.amount || fallback?.amount || "Eligibility-based"),
    rate: String(product.rate || fallback?.rate || "Profile-based"),
    tenure: String(product.tenure || fallback?.tenure || "Offer-based"),
    processing: String(product.processing || fallback?.processing || "Displayed before application"),
    highlights: normalizeList(product.highlights).length
      ? normalizeList(product.highlights)
      : normalizeList(fallback?.highlights),
    documents: normalizeList(product.documents).length
      ? normalizeList(product.documents)
      : normalizeList(fallback?.documents),
    eligibility: normalizeList(product.eligibility).length
      ? normalizeList(product.eligibility)
      : normalizeList(fallback?.eligibility),
    faqs: normalizeFaqs(product.faqs).length ? normalizeFaqs(product.faqs) : normalizeFaqs(fallback?.faqs),
    purpose: normalizePurpose(product.purpose),
    visible: product.visible !== false,
    order: Number.isFinite(Number(product.order)) ? Number(product.order) : (index + 1) * 10,
    createdAt: String(product.createdAt || new Date().toISOString()),
    updatedAt: String(product.updatedAt || new Date().toISOString()),
  };
}

function sortProducts(products: LoanProduct[]) {
  return [...products].sort((a, b) => (a.order || 0) - (b.order || 0) || a.title.localeCompare(b.title));
}

async function ensureDataDir() {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
}

function canUseMongoStorage() {
  return Boolean(process.env.MONGODB_URI);
}

async function readMongoLoanProducts(): Promise<LoanProduct[] | null> {
  if (!canUseMongoStorage()) return null;

  const connection = await connectMongoDB();
  const database = connection.connection.db;
  if (!database) throw new Error("MongoDB database is not available.");

  const document = await database
    .collection(MONGO_COLLECTION)
    .findOne<{ key: string; products?: LoanProduct[] }>({ key: MONGO_DOCUMENT_ID });

  if (!document || !Array.isArray(document.products)) return null;
  return sortProducts(document.products.map(normalizeProduct));
}

async function writeMongoLoanProducts(products: LoanProduct[]) {
  if (!canUseMongoStorage()) return false;

  const connection = await connectMongoDB();
  const database = connection.connection.db;
  if (!database) throw new Error("MongoDB database is not available.");

  await database.collection(MONGO_COLLECTION).updateOne(
    { key: MONGO_DOCUMENT_ID },
    {
      $set: {
        key: MONGO_DOCUMENT_ID,
        products: sortProducts(products),
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

export async function readLoanProducts(): Promise<LoanProduct[]> {
  try {
    const mongoProducts = await readMongoLoanProducts();
    if (mongoProducts) return mongoProducts;
  } catch {
    /* fall back to file/default storage */
  }

  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return sortProducts(LOAN_PRODUCTS.map(normalizeProduct));
    return sortProducts(parsed.map(normalizeProduct));
  } catch {
    return sortProducts(LOAN_PRODUCTS.map(normalizeProduct));
  }
}

async function writeLoanProducts(products: LoanProduct[]) {
  try {
    if (await writeMongoLoanProducts(products)) return;
  } catch {
    /* fall back to file storage */
  }

  await ensureDataDir();
  await writeFile(DATA_FILE, JSON.stringify(sortProducts(products), null, 2));
}

export async function getVisibleLoanProducts() {
  const products = await readLoanProducts();
  return products.filter((product) => product.visible !== false);
}

export async function findLoanProduct(slug: string) {
  const normalizedSlug = slugify(slug);
  const products = await readLoanProducts();
  return products.find((product) => product.slug === normalizedSlug && product.visible !== false) || null;
}

export async function createLoanProduct(input: LoanProductInput) {
  const products = await readLoanProducts();
  const title = String(input.title || "New Loan Category").trim();
  const slug = slugify(String(input.slug || title));

  if (!slug) throw new Error("Loan URL is required.");
  if (products.some((product) => product.slug === slug)) {
    throw new Error("A loan category with this URL already exists.");
  }

  const timestamp = new Date().toISOString();
  const product = normalizeProduct(
    {
      ...input,
      id: randomUUID(),
      slug,
      title,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    products.length,
  );

  await writeLoanProducts([...products, product]);
  return product;
}

export async function updateLoanProduct(slug: string, input: LoanProductInput) {
  const currentSlug = slugify(slug);
  const products = await readLoanProducts();
  const index = products.findIndex((product) => product.slug === currentSlug);
  if (index < 0) throw new Error("Loan category not found.");

  const nextSlug = slugify(String(input.slug || products[index].slug));
  if (!nextSlug) throw new Error("Loan URL is required.");
  if (products.some((product, productIndex) => productIndex !== index && product.slug === nextSlug)) {
    throw new Error("A loan category with this URL already exists.");
  }

  const updated = normalizeProduct(
    {
      ...products[index],
      ...input,
      slug: nextSlug,
      updatedAt: new Date().toISOString(),
    },
    index,
  );

  products[index] = updated;
  await writeLoanProducts(products);
  return updated;
}

export async function deleteLoanProduct(slug: string) {
  const currentSlug = slugify(slug);
  const products = await readLoanProducts();
  const nextProducts = products.filter((product) => product.slug !== currentSlug);
  if (nextProducts.length === products.length) throw new Error("Loan category not found.");
  await writeLoanProducts(nextProducts);
}
