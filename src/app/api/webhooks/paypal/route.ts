import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Import PayPal SDK or simple Axios client for PayPal
// For webhooks, we usually just verify the webhook signature

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    console.log('PayPal Webhook Received:', event.event_type);

    // TODO: Verify PayPal Webhook Signature for production security

    if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subscriptionId = event.resource.id;
      // We would ideally map this back to our local user by passing a custom_id 
      // during checkout, but let's assume we find the subscription via PayPal sub ID
      
      const subscription = await prisma.subscription.findUnique({
        where: { paypalSubscriptionId: subscriptionId },
        include: { user: true }
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            startDate: new Date(event.resource.start_time),
            // Defaulting expiry to 1 month from now for testing; in real life PayPal handles recurrence,
            // but we track expiry internally to pause reminders if they cancel
            expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
          }
        });

        // Trigger WhatsApp Welcome Message
        // (Implementation for WhatsApp will go here, or we enqueue it)
        console.log(`Sending Welcome WhatsApp to ${subscription.user.phone}`);
      }
    }
    
    // Handle cancellations
    if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' || event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED') {
      const subscriptionId = event.resource.id;
      await prisma.subscription.updateMany({
        where: { paypalSubscriptionId: subscriptionId },
        data: {
          status: 'INACTIVE', // Wait for expiry to pause completely, or pause immediately
        }
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('PayPal Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
