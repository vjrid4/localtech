// Phase 4: WhatsApp Business API Integration

import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";

export interface WhatsAppMessage {
  to: string;
  type: "repair_update" | "estimate" | "invoice" | "reminder";
  data: Record<string, any>;
}

// Mock implementation - will integrate real WhatsApp API in Phase 4
export async function sendWhatsAppMessage(
  shopId: string,
  message: WhatsAppMessage
): Promise<{ success: boolean; messageId?: string }> {
  try {
    // TODO: Phase 4 - Integrate WhatsApp Business API
    // - Get shop's WhatsApp config from DB
    // - Format message template
    // - Send via WhatsApp API
    // - Track delivery status

    const config = await prisma.whatsAppConfig.findUnique({
      where: { repairShopId: shopId },
    });

    if (!config || !config.isActive) {
      return { success: false };
    }

    // Log message for now
    const logMessage = await prisma.whatsAppMessage.create({
      data: {
        repairShopId: shopId,
        recipientPhone: message.to,
        messageType: message.type,
        content: JSON.stringify(message.data),
        status: "SENT",
      },
    });

    return { success: true, messageId: logMessage.id };
  } catch (error) {
    console.error("WhatsApp message failed:", error);
    return { success: false };
  }
}

export async function sendRepairUpdate(
  shopId: string,
  customerPhone: string,
  repairId: string,
  status: string
): Promise<boolean> {
  // TODO: Generate repair update message with:
  // - Current repair status
  // - Estimated completion time
  // - Cost estimate (if available)
  // - Parts being used

  const message: WhatsAppMessage = {
    to: customerPhone,
    type: "repair_update",
    data: {
      repairId,
      status,
      message: `Your repair is now ${status}. We'll update you soon!`,
    },
  };

  const result = await sendWhatsAppMessage(shopId, message);
  return result.success;
}

export async function sendEstimate(
  shopId: string,
  customerPhone: string,
  estimateId: string
): Promise<boolean> {
  // TODO: Send estimate with:
  // - Device details
  // - Issue description
  // - Cost breakdown
  // - Timeline
  // - Approval request

  const message: WhatsAppMessage = {
    to: customerPhone,
    type: "estimate",
    data: {
      estimateId,
      message: "Please review and approve your repair estimate",
    },
  };

  const result = await sendWhatsAppMessage(shopId, message);
  return result.success;
}

export async function sendInvoice(
  shopId: string,
  customerPhone: string,
  invoiceId: string
): Promise<boolean> {
  // TODO: Send invoice with:
  // - Repair details
  // - Parts used with costs
  // - Labor charges
  // - Tax breakdown
  // - Total amount
  // - Payment methods
  // - Invoice PDF attachment

  const message: WhatsAppMessage = {
    to: customerPhone,
    type: "invoice",
    data: {
      invoiceId,
      message: "Your invoice is ready. Thank you for choosing us!",
    },
  };

  const result = await sendWhatsAppMessage(shopId, message);
  return result.success;
}

export async function setupWebhook(
  shopId: string,
  webhookUrl: string
): Promise<boolean> {
  // TODO: Phase 4
  // - Register webhook with WhatsApp Business API
  // - Store webhook token in DB
  // - Handle incoming messages
  // - Update to Prisma.whatsappconfig

  try {
    await prisma.whatsAppConfig.update({
      where: { repairShopId: shopId },
      data: {
        webhookUrl,
        webhookToken: randomBytes(32).toString("base64url"),
      },
    });

    return true;
  } catch {
    return false;
  }
}
