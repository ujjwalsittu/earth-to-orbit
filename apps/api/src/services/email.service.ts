import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export class EmailService {
  private resend?: Resend;

  constructor() {
    if (env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY);
    }
  }

  /**
   * Send email
   */
  async sendEmail(payload: EmailPayload): Promise<void> {
    if (!this.resend) {
      logger.warn('Resend not configured, skipping email send');
      logger.info({ payload }, 'Email would have been sent');
      return;
    }

    try {
      await this.resend.emails.send({
        from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo,
      });

      logger.info({ to: payload.to, subject: payload.subject }, 'Email sent successfully');
    } catch (error) {
      logger.error({ error, payload }, 'Failed to send email');
      throw error;
    }
  }

  /**
   * Send request submitted email (to admin)
   */
  async sendRequestSubmittedEmail(
    adminEmail: string,
    requestNumber: string,
    organizationName: string,
    requestTitle: string
  ): Promise<void> {
    await this.sendEmail({
      to: adminEmail,
      subject: `New Request Submitted: ${requestNumber}`,
      html: `
        <h2>New Request Submitted</h2>
        <p><strong>Request Number:</strong> ${requestNumber}</p>
        <p><strong>Organization:</strong> ${organizationName}</p>
        <p><strong>Title:</strong> ${requestTitle}</p>
        <p>Please review and approve this request in the admin dashboard.</p>
      `,
      text: `New Request Submitted: ${requestNumber} from ${organizationName}`,
    });
  }

  /**
   * Send request approved email (to customer)
   */
  async sendRequestApprovedEmail(
    customerEmail: string,
    requestNumber: string,
    scheduledStart: Date,
    scheduledEnd: Date,
    siteLocation: string,
    invoiceNumber: string
  ): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      subject: `Request Approved: ${requestNumber}`,
      html: `
        <h2>Your Request Has Been Approved!</h2>
        <p><strong>Request Number:</strong> ${requestNumber}</p>
        <p><strong>Scheduled Start:</strong> ${scheduledStart.toLocaleString()}</p>
        <p><strong>Scheduled End:</strong> ${scheduledEnd.toLocaleString()}</p>
        <p><strong>Location:</strong> ${siteLocation}</p>
        <p><strong>Invoice:</strong> ${invoiceNumber}</p>
        <p>Please proceed with payment to confirm your booking.</p>
      `,
      text: `Your request ${requestNumber} has been approved. Scheduled from ${scheduledStart} to ${scheduledEnd} at ${siteLocation}.`,
    });
  }

  /**
   * Send request rejected email
   */
  async sendRequestRejectedEmail(
    customerEmail: string,
    requestNumber: string,
    reason: string
  ): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      subject: `Request Rejected: ${requestNumber}`,
      html: `
        <h2>Request Rejected</h2>
        <p><strong>Request Number:</strong> ${requestNumber}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please contact us if you have any questions.</p>
      `,
      text: `Your request ${requestNumber} has been rejected. Reason: ${reason}`,
    });
  }

  /**
   * Send resubmission requested email
   */
  async sendResubmitRequestedEmail(
    customerEmail: string,
    requestNumber: string,
    reason: string
  ): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      subject: `Resubmission Required: ${requestNumber}`,
      html: `
        <h2>Resubmission Required</h2>
        <p><strong>Request Number:</strong> ${requestNumber}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please update and resubmit your request.</p>
      `,
      text: `Resubmission required for ${requestNumber}. Reason: ${reason}`,
    });
  }

  /**
   * Send payment received email
   */
  async sendPaymentReceivedEmail(
    customerEmail: string,
    invoiceNumber: string,
    amount: number,
    paymentNumber: string
  ): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      subject: `Payment Received: ${invoiceNumber}`,
      html: `
        <h2>Payment Received</h2>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Payment Number:</strong> ${paymentNumber}</p>
        <p><strong>Amount:</strong> ₹${amount.toFixed(2)}</p>
        <p>Thank you for your payment!</p>
      `,
      text: `Payment of ₹${amount} received for invoice ${invoiceNumber}`,
    });
  }

  /**
   * Send extension requested email (to admin)
   */
  async sendExtensionRequestedEmail(
    adminEmail: string,
    requestNumber: string,
    organizationName: string,
    additionalHours: number,
    reason: string
  ): Promise<void> {
    await this.sendEmail({
      to: adminEmail,
      subject: `Extension Requested: ${requestNumber}`,
      html: `
        <h2>Extension Requested</h2>
        <p><strong>Request Number:</strong> ${requestNumber}</p>
        <p><strong>Organization:</strong> ${organizationName}</p>
        <p><strong>Additional Hours:</strong> ${additionalHours}h</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please review this extension request.</p>
      `,
      text: `Extension of ${additionalHours}h requested for ${requestNumber} by ${organizationName}`,
    });
  }

  /**
   * Send extension approved email (to customer)
   */
  async sendExtensionApprovedEmail(
    customerEmail: string,
    requestNumber: string,
    additionalHours: number,
    newInvoiceNumber: string
  ): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      subject: `Extension Approved: ${requestNumber}`,
      html: `
        <h2>Extension Approved</h2>
        <p><strong>Request Number:</strong> ${requestNumber}</p>
        <p><strong>Additional Hours:</strong> ${additionalHours}h</p>
        <p><strong>Invoice:</strong> ${newInvoiceNumber}</p>
        <p>Please proceed with payment for the extension.</p>
      `,
      text: `Extension of ${additionalHours}h approved for ${requestNumber}`,
    });
  }
}
