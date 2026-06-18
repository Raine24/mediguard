"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerAffiliate(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const country = formData.get("country") as string;
  const promotionMethod = formData.get("promotionMethod") as string;
  const payoutMethod = formData.get("payoutMethod") as string;
  const payoutDetails = formData.get("payoutDetails") as string;

  if (!name || !email || !password || !country || !promotionMethod || !payoutMethod || !payoutDetails) {
    return { error: "All fields are required." };
  }

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { affiliateProfile: true }
    });

    if (user && user.affiliateProfile) {
      return { error: "An affiliate account with this email already exists." };
    }

    // Generate a unique referral code based on their name
    const baseCode = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().substring(0, 8);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const refCode = `${baseCode}${randomSuffix}`;

    let userId = user?.id;

    if (!user) {
      // Create user if they don't exist
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          phone: "AFFILIATE_" + Date.now(), // dummy phone since phone is unique
          country,
          role: "AFFILIATE"
        }
      });
      userId = newUser.id;
    } else {
      // Update existing user role to include affiliate
      await prisma.user.update({
        where: { id: userId },
        data: { role: "AFFILIATE" }
      });
    }

    // Fetch system default for commission type
    let defaultCommissionType = "RECURRING";
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "affiliate_commission_type_default" }
    });
    if (setting) {
      defaultCommissionType = setting.value;
    }

    // Create the affiliate profile
    await prisma.affiliateProfile.create({
      data: {
        userId: userId!,
        refCode,
        status: "PENDING",
        promotionMethod,
        payoutMethod,
        payoutDetails,
        commissionType: defaultCommissionType,
      }
    });

    return { success: true, message: "Application submitted successfully! Our team will review your application." };

  } catch (error: any) {
    console.error("Affiliate registration error:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}
