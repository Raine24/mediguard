import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({}));

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      // Delete any existing tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email: cleanEmail },
      });

      // Generate a secure random token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      await prisma.passwordResetToken.create({
        data: {
          email: cleanEmail,
          token,
          expiresAt,
        },
      });

      // Determine base URL
      const host = req.headers.get("host") || "medicintime.com";
      const protocol = host.includes("localhost") ? "http" : "https";
      const baseUrl = `${protocol}://${host}`;
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      // Send email via Resend
      await sendPasswordResetEmail({
        to: cleanEmail,
        name: user.name || "User",
        resetUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent to your inbox.",
    });
  } catch (error: any) {
    console.error("Error in forgot-password API:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request. Please try again." },
      { status: 500 }
    );
  }
}
