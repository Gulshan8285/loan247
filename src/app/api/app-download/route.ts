import { stat, readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_APP_FILE = "download/loan247.apk";
const APK_MIME = "application/vnd.android.package-archive";

function getDownloadUrl() {
  return process.env.APP_DOWNLOAD_URL || process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL || "";
}

function getAppFilePath() {
  return path.join(process.cwd(), "download", "loan247.apk");
}

function unavailableResponse() {
  return Response.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "https://loan247.online"));
}

export async function HEAD() {
  const downloadUrl = getDownloadUrl();

  if (downloadUrl) {
    return new Response(null, {
      status: 302,
      headers: { Location: downloadUrl },
    });
  }

  try {
    const filePath = getAppFilePath();
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return new Response(null, { status: 404 });
    }

    return new Response(null, {
      status: 200,
      headers: {
        "Content-Type": APK_MIME,
        "Content-Length": String(fileStat.size),
        "Content-Disposition": 'attachment; filename="loan247.apk"',
      },
    });
  } catch {
    return new Response(null, {
      status: 404,
      headers: {
        "X-LOAN247-Download": "pwa-install",
      },
    });
  }
}

export async function GET() {
  const downloadUrl = getDownloadUrl();

  if (downloadUrl) {
    return Response.redirect(downloadUrl, 302);
  }

  try {
    const filePath = getAppFilePath();
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return unavailableResponse();
    }

    const file = await readFile(filePath);

    return new Response(file, {
      headers: {
        "Content-Type": APK_MIME,
        "Content-Length": String(fileStat.size),
        "Content-Disposition": 'attachment; filename="loan247.apk"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return unavailableResponse();
  }
}
