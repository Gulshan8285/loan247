import { stat, readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_APP_FILE = "download/loan247.apk";
const APK_MIME = "application/vnd.android.package-archive";
const FALLBACK_FILENAME = "loan247-app.html";

function createFallbackLauncher() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LOAN247 App</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #f8fafc;
        color: #111827;
        font-family: Arial, sans-serif;
      }
      main {
        width: min(92vw, 420px);
        padding: 28px;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        background: #ffffff;
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
      }
      h1 {
        margin: 0 0 10px;
        font-size: 28px;
      }
      p {
        margin: 0 0 18px;
        color: #4b5563;
        line-height: 1.55;
      }
      a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        width: 100%;
        border-radius: 12px;
        background: #059669;
        color: #ffffff;
        font-weight: 700;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>LOAN247 App</h1>
      <p>Your LOAN247 web app launcher has been downloaded. Open the button below to continue your loan application securely.</p>
      <a href="/">Open LOAN247</a>
    </main>
  </body>
</html>`;
}

function getDownloadUrl() {
  return process.env.APP_DOWNLOAD_URL || process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL || "";
}

function getAppFilePath() {
  return path.join(process.cwd(), "download", "loan247.apk");
}

function unavailableResponse() {
  return new Response(createFallbackLauncher(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${FALLBACK_FILENAME}"`,
      "Cache-Control": "private, no-store",
      "X-LOAN247-Download": "fallback-launcher",
    },
  });
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
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${FALLBACK_FILENAME}"`,
        "X-LOAN247-Download": "fallback-launcher",
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
