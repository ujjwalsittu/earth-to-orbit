import { Resend } from "resend";
import { env } from "../config/env";
import logger from "../utils/logger";

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send email using Resend
 */
export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  try {
    const { to, subject, html, replyTo } = options;

    await resend.emails.send({
      from: `${env.COMPANY_NAME} <${env.COMPANY_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: replyTo || env.SUPPORT_EMAIL,
    });

    logger.info(`Email sent to ${Array.isArray(to) ? to.join(", ") : to}`);
  } catch (error: any) {
    logger.error("Failed to send email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send registration welcome email
 */
export const sendRegistrationEmail = async (
  email: string,
  firstName: string,
  organizationName: string
): Promise<void> => {
  const loginUrl = `${env.FRONTEND_URL}/login`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #3b82f6; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Welcome to ${env.COMPANY_NAME}</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #333; font-size: 16px; line-height: 26px;">Hi ${firstName},</p>
            <p style="color: #333; font-size: 16px; line-height: 26px;">
              Welcome to ${env.COMPANY_NAME}! Your account for <strong>${organizationName}</strong> has been successfully created.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 26px;">
              You can now access our platform to book aerospace labs, machinery, and components for your satellite development projects.
            </p>
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="color: #475569; font-size: 14px; margin: 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #475569; font-size: 14px; margin: 8px 0;"><strong>Organization:</strong> ${organizationName}</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${loginUrl}" style="background-color: #3b82f6; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: 600;">
                Login to Your Account
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            <p style="color: #64748b; font-size: 14px; line-height: 24px;">
              If you didn't create this account, please ignore this email or contact our support team.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Welcome to ${env.COMPANY_NAME}`,
    html,
  });
};

/**
 * Send request approved email
 */
export const sendRequestApprovedEmail = async (
  email: string,
  firstName: string,
  requestNumber: string,
  title: string,
  total: number,
  invoiceNumber: string,
  requestUrl: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #10b981; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Request Approved!</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #333; font-size: 16px; line-height: 26px;">Hi ${firstName},</p>
            <p style="color: #333; font-size: 16px; line-height: 26px;">
              Great news! Your booking request has been approved.
            </p>
            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid #86efac;">
              <p style="color: #065f46; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 16px 0 4px 0;">Request Number</p>
              <p style="color: #064e3b; font-size: 16px; font-weight: 600; margin: 0;">${requestNumber}</p>
              <p style="color: #065f46; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 16px 0 4px 0;">Title</p>
              <p style="color: #064e3b; font-size: 16px; font-weight: 600; margin: 0;">${title}</p>
              <p style="color: #065f46; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 16px 0 4px 0;">Total Amount</p>
              <p style="color: #064e3b; font-size: 20px; font-weight: 600; margin: 0;">₹${total.toLocaleString(
                "en-IN"
              )}</p>
              <p style="color: #065f46; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 16px 0 4px 0;">Invoice Number</p>
              <p style="color: #064e3b; font-size: 16px; font-weight: 600; margin: 0;">${invoiceNumber}</p>
            </div>
            <p style="color: #333; font-size: 16px; line-height: 26px;">
              Please proceed with payment to confirm your booking. The invoice is available in your dashboard.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${requestUrl}" style="background-color: #3b82f6; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: 600;">
                View Request & Pay
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            <p style="color: #64748b; font-size: 14px; line-height: 24px;">
              Questions? Contact us at <a href="mailto:${
                env.SUPPORT_EMAIL
              }" style="color: #3b82f6;">${env.SUPPORT_EMAIL}</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Request ${requestNumber} Approved - Payment Required`,
    html,
  });
};

/**
 * Send request rejected email
 */
export const sendRequestRejectedEmail = async (
  email: string,
  firstName: string,
  requestNumber: string,
  title: string,
  reason: string,
  requestUrl: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #ef4444; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Request Update Required</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #333; font-size: 16px; line-height: 26px;">Hi ${firstName},</p>
            <p style="color: #333; font-size: 16px; line-height: 26px;">
              We've reviewed your booking request and unfortunately cannot approve it at this time.
            </p>
            <div style="background-color: #fef2f2; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid #fecaca;">
              <p style="color: #991b1b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 16px 0 4px 0;">Request Number</p>
              <p style="color: #7f1d1d; font-size: 16px; font-weight: 600; margin: 0;">${requestNumber}</p>
              <p style="color: #991b1b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 16px 0 4px 0;">Title</p>
              <p style="color: #7f1d1d; font-size: 16px; font-weight: 600; margin: 0;">${title}</p>
            </div>
            <div style="background-color: #fffbeb; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #fde68a;">
              <p style="color: #92400e; font-size: 14px; font-weight: 700; margin-bottom: 8px;">Reason:</p>
              <p style="color: #78350f; font-size: 15px; line-height: 24px; margin: 0;">${reason}</p>
            </div>
            <p style="color: #333; font-size: 16px; line-height: 26px;">
              You can modify your request and resubmit it with updated details. Our team is here to help you find the best solution for your needs.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${requestUrl}" style="background-color: #3b82f6; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: 600;">
                Modify & Resubmit Request
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            <p style="color: #64748b; font-size: 14px; line-height: 24px;">
              Need help? Contact us at <a href="mailto:${env.SUPPORT_EMAIL}" style="color: #3b82f6;">${env.SUPPORT_EMAIL}</a> and we'll assist you in finding available slots.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Request ${requestNumber} - Action Required`,
    html,
  });
};

/**
 * Send payment confirmation email
 */
export const sendPaymentReceivedEmail = async (
  email: string,
  firstName: string,
  paymentId: string,
  amount: number,
  requestNumber: string,
  invoiceNumber: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #10b981; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Payment Received!</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #333; font-size: 16px; line-height: 26px;">Hi ${firstName},</p>
            <p style="color: #333; font-size: 16px; line-height: 26px;">
              We've successfully received your payment. Your booking is now confirmed!
            </p>
            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid #86efac;">
              <p style="color: #065f46; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 16px 0 4px 0;">Payment ID</p>
              <p style="color: #064e3b; font-size: 16px; font-weight: 600; margin: 0;">${paymentId}</p>
              <p style="color: #065f46; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 16px 0 4px 0;">Amount</p>
              <p style="color: #064e3b; font-size: 20px; font-weight: 600; margin: 0;">₹${amount.toLocaleString(
                "en-IN"
              )}</p>
              <p style="color: #065f46; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 16px 0 4px 0;">Request Number</p>
              <p style="color: #064e3b; font-size: 16px; font-weight: 600; margin: 0;">${requestNumber}</p>
              <p style="color: #065f46; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 16px 0 4px 0;">Invoice Number</p>
              <p style="color: #064e3b; font-size: 16px; font-weight: 600; margin: 0;">${invoiceNumber}</p>
            </div>
            <p style="color: #333; font-size: 16px; line-height: 26px;">
              Our team will reach out to you soon to coordinate the details of your booking.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            <p style="color: #64748b; font-size: 14px; line-height: 24px;">
              Questions? Contact us at <a href="mailto:${
                env.SUPPORT_EMAIL
              }" style="color: #3b82f6;">${env.SUPPORT_EMAIL}</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Payment Confirmed - ${paymentId}`,
    html,
  });
};

export default {
  sendEmail,
  sendRegistrationEmail,
  sendRequestApprovedEmail,
  sendRequestRejectedEmail,
  sendPaymentReceivedEmail,
};
