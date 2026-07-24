import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { GetObjectCommand, PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import { slugify } from "@/lib/legal-pages";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  coverImage: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostInput = Partial<
  Pick<BlogPost, "slug" | "title" | "excerpt" | "content" | "author" | "coverImage" | "published" | "order">
>;

const DATA_FILE = path.join(process.cwd(), "db", "blog-posts.json");
const DEFAULT_S3_KEY = "content/blog-posts.json";

function s3StorageConfig() {
  const bucket = process.env.APPLICATIONS_S3_BUCKET || "";
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1";
  const key = process.env.BLOG_POSTS_S3_KEY || DEFAULT_S3_KEY;

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

function normalizePost(post: Partial<BlogPost>, index: number): BlogPost {
  const title = String(post.title || "New Blog Post").trim();
  const slug = slugify(String(post.slug || title)) || `blog-post-${index + 1}`;
  const timestamp = new Date().toISOString();

  return {
    id: String(post.id || randomUUID()),
    slug,
    title,
    excerpt: String(post.excerpt || "").trim(),
    content: String(post.content || "").trim(),
    author: String(post.author || "LOAN247 Team").trim(),
    coverImage: String(post.coverImage || "").trim(),
    published: post.published !== false,
    order: Number.isFinite(Number(post.order)) ? Number(post.order) : (index + 1) * 10,
    createdAt: String(post.createdAt || timestamp),
    updatedAt: String(post.updatedAt || timestamp),
  };
}

function sortPosts(posts: BlogPost[]) {
  return [...posts].sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff) return orderDiff;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

async function readS3Posts(): Promise<BlogPost[] | null> {
  const config = s3StorageConfig();
  if (!config) return null;

  try {
    const response = await s3Client(config.region).send(
      new GetObjectCommand({ Bucket: config.bucket, Key: config.key }),
    );
    const raw = await streamToText(response.Body);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? sortPosts(parsed.map(normalizePost)) : [];
  } catch (error) {
    if (
      error instanceof S3ServiceException &&
      (error.name === "NoSuchKey" || error.$metadata.httpStatusCode === 404)
    ) {
      return [];
    }
    throw error;
  }
}

async function writeS3Posts(posts: BlogPost[]) {
  const config = s3StorageConfig();
  if (!config) return false;

  await s3Client(config.region).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: config.key,
      Body: JSON.stringify(sortPosts(posts), null, 2),
      ContentType: "application/json",
      ServerSideEncryption: "AES256",
    }),
  );
  return true;
}

async function ensureDataDir() {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
}

async function readLocalPosts() {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortPosts(parsed.map(normalizePost)) : [];
  } catch {
    return [];
  }
}

async function writePosts(posts: BlogPost[]) {
  if (await writeS3Posts(posts)) return;
  await ensureDataDir();
  await writeFile(DATA_FILE, JSON.stringify(sortPosts(posts), null, 2));
}

export async function readBlogPosts() {
  try {
    const s3Posts = await readS3Posts();
    if (s3Posts) {
      if (s3Posts.length > 0) return s3Posts;
      const localPosts = await readLocalPosts();
      if (localPosts.length > 0) {
        await writeS3Posts(localPosts);
        return localPosts;
      }
      return s3Posts;
    }
  } catch {
    /* fall back to local storage */
  }

  return readLocalPosts();
}

export async function getPublishedBlogPosts() {
  const posts = await readBlogPosts();
  return posts.filter((post) => post.published);
}

export async function findBlogPost(slug: string) {
  const normalizedSlug = slugify(slug);
  const posts = await readBlogPosts();
  return posts.find((post) => post.slug === normalizedSlug && post.published) || null;
}

export async function createBlogPost(input: BlogPostInput) {
  const posts = await readBlogPosts();
  const title = String(input.title || "New Blog Post").trim();
  const slug = slugify(String(input.slug || title));

  if (!slug) throw new Error("Blog URL is required.");
  if (posts.some((post) => post.slug === slug)) {
    throw new Error("A blog post with this URL already exists.");
  }

  const timestamp = new Date().toISOString();
  const post = normalizePost(
    {
      ...input,
      id: randomUUID(),
      slug,
      title,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    posts.length,
  );

  await writePosts([...posts, post]);
  return post;
}

export async function updateBlogPost(slug: string, input: BlogPostInput) {
  const currentSlug = slugify(slug);
  const posts = await readBlogPosts();
  const index = posts.findIndex((post) => post.slug === currentSlug);
  if (index < 0) throw new Error("Blog post not found.");

  const nextSlug = slugify(String(input.slug || posts[index].slug));
  if (!nextSlug) throw new Error("Blog URL is required.");
  if (posts.some((post, postIndex) => postIndex !== index && post.slug === nextSlug)) {
    throw new Error("A blog post with this URL already exists.");
  }

  const updated = normalizePost(
    {
      ...posts[index],
      ...input,
      slug: nextSlug,
      updatedAt: new Date().toISOString(),
    },
    index,
  );

  posts[index] = updated;
  await writePosts(posts);
  return updated;
}

export async function deleteBlogPost(slug: string) {
  const currentSlug = slugify(slug);
  const posts = await readBlogPosts();
  const nextPosts = posts.filter((post) => post.slug !== currentSlug);
  if (nextPosts.length === posts.length) throw new Error("Blog post not found.");
  await writePosts(nextPosts);
}
