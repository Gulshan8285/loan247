import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export const AUTH_COOKIE_NAME = "loan247_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AuthenticatedUser = {
  id: string;
  phone: string;
  firebaseUid: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  isVerified: boolean;
};

export function isValidIndianPhone(phone: string) {
  return /^\+91[6-9]\d{9}$/.test(phone);
}

export function isValidOtp(otp: string) {
  return /^\d{6}$/.test(otp);
}

function getFirebaseAdminAuth() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Firebase Admin credentials are required");
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return getAuth();
}

function toAuthenticatedUser(user: {
  _id: unknown;
  phone: string;
  firebaseUid: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  isVerified: boolean;
}): AuthenticatedUser {
  return {
    id: String(user._id),
    phone: user.phone,
    firebaseUid: user.firebaseUid,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLogin: user.lastLogin.toISOString(),
    isVerified: user.isVerified,
  };
}

export async function verifyIdToken(idToken: string) {
  return getFirebaseAdminAuth().verifyIdToken(idToken);
}

export async function createSessionCookie(idToken: string) {
  return getFirebaseAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
  });
}

export async function createOrUpdateUser(decodedToken: DecodedIdToken) {
  const phone = decodedToken.phone_number;

  if (!phone || !isValidIndianPhone(phone)) {
    throw new Error("Only verified +91 Indian mobile numbers are allowed");
  }

  await connectMongoDB();

  const now = new Date();
  const user = await User.findOneAndUpdate(
    {
      $or: [{ firebaseUid: decodedToken.uid }, { phone }],
    },
    {
      $set: {
        phone,
        firebaseUid: decodedToken.uid,
        lastLogin: now,
        isVerified: true,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  if (!user) {
    throw new Error("Unable to create user");
  }

  return toAuthenticatedUser(user);
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!session) return null;

  try {
    const decoded = await getFirebaseAdminAuth().verifySessionCookie(session, true);
    await connectMongoDB();

    const user = await User.findOne({ firebaseUid: decoded.uid }).lean();
    return user ? toAuthenticatedUser(user) : null;
  } catch {
    return null;
  }
}
