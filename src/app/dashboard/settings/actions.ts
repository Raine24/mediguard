"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: {
  name: string;
  timezone: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: formData.name,
      timezone: formData.timezone,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function requestPasswordReset() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // In a real app, send an email/WhatsApp here.
  // We'll just simulate it.
  
  return { success: true };
}

export async function deactivateAccount() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Soft delete or anonymize depending on compliance.
  // For now, we'll just delete the user record to simulate a wipe.
  await prisma.user.delete({
    where: { id: session.user.id }
  });

  // Client will handle sign out redirect
  return { success: true };
}

export async function initiatePhoneChange(newPhone: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const payload = JSON.stringify({
    phone: newPhone,
    code: otp,
    expires: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: payload }
  });

  // Send the OTP using Bird.com Template
  const { sendWhatsAppTemplate } = await import('@/lib/bird');
  const response = await sendWhatsAppTemplate(newPhone, "verification_code", [otp]);

  if (response.status === "failed") {
    throw new Error(response.error || "Failed to send WhatsApp template.");
  }

  return { success: true };
}

export async function verifyPhoneChange(code: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true }
  });

  if (!user?.twoFactorSecret) {
    throw new Error("No pending verification found.");
  }

  let payload;
  try {
    payload = JSON.parse(user.twoFactorSecret);
  } catch (e) {
    throw new Error("Invalid verification payload.");
  }

  if (Date.now() > payload.expires) {
    throw new Error("Verification code expired.");
  }

  if (payload.code !== code) {
    throw new Error("Invalid verification code.");
  }

  // Update the phone number and clear the secret
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone: payload.phone,
        whatsappVerified: true,
        twoFactorSecret: null
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error("This phone number is already registered to another account.");
    }
    throw new Error("Failed to update phone number. Please try again.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  
  return { success: true };
}
