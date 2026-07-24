import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { GetObjectCommand, PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";

export type SocialLinkKey = "twitter" | "linkedin" | "facebook" | "instagram" | "youtube";

export type HomePageSettings = {
  seoTitle: string;
  seoDescription: string;
  badgeText: string;
  headline: string;
  amountText: string;
  description: string;
  trustLine: string;
};

export type SiteSettings = {
  socialLinks: Record<SocialLinkKey, string>;
  homePage: HomePageSettings;
  updatedAt: string;
};

export type SiteSettingsInput = Partial<{
  socialLinks: Partial<Record<SocialLinkKey, string>>;
  homePage: Partial<HomePageSettings>;
}>;

const DATA_FILE = path.join(process.cwd(), "db", "site-settings.json");
const DEFAULT_S3_KEY = "content/site-settings.json";

const DEFAULT_SETTINGS: SiteSettings = {
  socialLinks: {
    twitter: "https://twitter.com/loan247online",
    linkedin: "https://www.linkedin.com/company/loan247-online",
    facebook: "",
    instagram: "",
    youtube: "",
  },
  homePage: {
    seoTitle: "LOAN247 - Personal Loan Application Online",
    seoDescription: "Apply for a LOAN247 personal loan through a simple, secure, mobile-friendly online application journey.",
    badgeText: "Welcome to LOAN247",
    headline: "Instant Personal Loans",
    amountText: "Up to Rs. 8,00,000",
    description:
      "Get approved in minutes with minimal documentation. Quick disbursement directly to your bank account - available 24/7.",
    trustLine: "RBI Registered NBFC · Bank-grade encryption · No impact on credit score",
  },
  updatedAt: "2026-07-24T00:00:00.000Z",
};

function s3StorageConfig() {
  const bucket = process.env.APPLICATIONS_S3_BUCKET || "";
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1";
  const key = process.env.SITE_SETTINGS_S3_KEY || DEFAULT_S3_KEY;

  if (!bucket) return null;
  return { bucket, region, key };
}

function s3Client(region: string) {
  return new S3Client({ region });
}

async function streamToText(stream: unknown): Promise<string> {
  if (!stream) return "";
  const streamWithTransform = stream as { transformToString?: () => Promise<string> };
  if (typeof streamWithTransform.transformToString === "function") {
    return streamWithTransform.transformToString();
  }

  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function normalizeSettings(settings: Partial<SiteSettings> | undefined): SiteSettings {
  const socialLinks: Partial<Record<SocialLinkKey, string>> = settings?.socialLinks || {};
  const homePage: Partial<HomePageSettings> = settings?.homePage || {};
  return {
    socialLinks: {
      twitter: String(socialLinks.twitter || DEFAULT_SETTINGS.socialLinks.twitter),
      linkedin: String(socialLinks.linkedin || DEFAULT_SETTINGS.socialLinks.linkedin),
      facebook: String(socialLinks.facebook || ""),
      instagram: String(socialLinks.instagram || ""),
      youtube: String(socialLinks.youtube || ""),
    },
    homePage: {
      seoTitle: String(homePage.seoTitle || DEFAULT_SETTINGS.homePage.seoTitle),
      seoDescription: String(homePage.seoDescription || DEFAULT_SETTINGS.homePage.seoDescription),
      badgeText: String(homePage.badgeText || DEFAULT_SETTINGS.homePage.badgeText),
      headline: String(homePage.headline || DEFAULT_SETTINGS.homePage.headline),
      amountText: String(homePage.amountText || DEFAULT_SETTINGS.homePage.amountText),
      description: String(homePage.description || DEFAULT_SETTINGS.homePage.description),
      trustLine: String(homePage.trustLine || DEFAULT_SETTINGS.homePage.trustLine),
    },
    updatedAt: String(settings?.updatedAt || new Date().toISOString()),
  };
}

async function readS3Settings(): Promise<SiteSettings | null> {
  const config = s3StorageConfig();
  if (!config) return null;

  try {
    const response = await s3Client(config.region).send(
      new GetObjectCommand({ Bucket: config.bucket, Key: config.key }),
    );
    const raw = await streamToText(response.Body);
    return normalizeSettings(JSON.parse(raw || "{}"));
  } catch (error) {
    if (
      error instanceof S3ServiceException &&
      (error.name === "NoSuchKey" || error.$metadata.httpStatusCode === 404)
    ) {
      return DEFAULT_SETTINGS;
    }
    throw error;
  }
}

async function writeS3Settings(settings: SiteSettings) {
  const config = s3StorageConfig();
  if (!config) return false;

  await s3Client(config.region).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: config.key,
      Body: JSON.stringify(settings, null, 2),
      ContentType: "application/json",
      ServerSideEncryption: "AES256",
    }),
  );
  return true;
}

async function ensureDataDir() {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
}

async function readLocalSettings() {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return normalizeSettings(JSON.parse(raw || "{}"));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function writeSettings(settings: SiteSettings) {
  if (await writeS3Settings(settings)) return;
  await ensureDataDir();
  await writeFile(DATA_FILE, JSON.stringify(settings, null, 2));
}

export async function readSiteSettings() {
  try {
    const s3Settings = await readS3Settings();
    if (s3Settings) return s3Settings;
  } catch {
    /* fall back to local settings */
  }

  return readLocalSettings();
}

export async function updateSiteSettings(input: SiteSettingsInput) {
  const current = await readSiteSettings();
  const next = normalizeSettings({
    ...current,
    socialLinks: {
      ...current.socialLinks,
      ...(input.socialLinks || {}),
    },
    homePage: {
      ...current.homePage,
      ...(input.homePage || {}),
    },
    updatedAt: new Date().toISOString(),
  });

  await writeSettings(next);
  return next;
}
