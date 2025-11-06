import { DateTime } from 'luxon';
import { Invoice } from '../models/Invoice';
import { Request as RequestDoc } from '../models/Request';
import { Organization } from '../models/Organization';
import { InvoiceStatus, IInvoiceLineItem } from '@e2o/types';
import { generateSequentialNumber } from '../utils/generate-number';
import { env } from '../config/env';
import { NotFoundError } from '../utils/api-error';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export class BillingService {
  /**
   * Generate invoice from approved request
   */
  async generateInvoiceFromRequest(requestId: string): Promise<any> {
    const request = await RequestDoc.findById(requestId)
      .populate('organizationId')
      .populate('machineryItems.labId')
      .populate('componentItems.componentId')
      .populate('assistanceItems.staffId');

    if (!request) {
      throw new NotFoundError('Request not found');
    }

    const organization = await Organization.findById(request.organizationId);
    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    // Get last invoice number
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const invoiceNumber = generateSequentialNumber('INV', lastInvoice?.invoiceNumber);

    const lineItems: IInvoiceLineItem[] = [];

    // Add machinery items
    for (const item of request.machineryItems) {
      lineItems.push({
        type: 'MACHINERY',
        description: `${(item.labId as any).name} - ${item.durationHours}h`,
        quantity: item.durationHours,
        unitPrice: item.rateSnapshot,
        subtotal: item.subtotal,
        total: item.subtotal,
      });
    }

    // Add component items
    for (const item of request.componentItems) {
      lineItems.push({
        type: 'COMPONENT',
        description: `${(item.componentId as any).name} x ${item.quantity}`,
        quantity: item.quantity,
        unitPrice: item.priceSnapshot,
        subtotal: item.subtotal,
        total: item.subtotal,
      });
    }

    // Add assistance items
    for (const item of request.assistanceItems) {
      const staffName = item.staffId ? `${(item.staffId as any).firstName} ${(item.staffId as any).lastName}` : item.skillRequired;
      lineItems.push({
        type: 'ASSISTANCE',
        description: `${staffName} - ${item.hours}h`,
        quantity: item.hours,
        unitPrice: item.rateSnapshot || 0,
        subtotal: item.subtotal,
        total: item.subtotal,
      });
    }

    const subtotal = request.totals.subtotal;
    const taxPercent = env.GST_PERCENT;
    const taxAmount = (subtotal * taxPercent) / 100;
    const total = subtotal + taxAmount;

    const dueDate = DateTime.now().plus({ days: 30 }).toJSDate();

    const invoice = new Invoice({
      invoiceNumber,
      requestId: request._id,
      organizationId: request.organizationId,
      lineItems,
      subtotal,
      taxPercent,
      taxAmount,
      total,
      currency: 'INR',
      status: InvoiceStatus.PENDING,
      dueDate,
      billingAddress: {
        organizationName: organization.name,
        gstNumber: organization.gstNumber,
        address: organization.address.street,
        city: organization.address.city,
        state: organization.address.state,
        postalCode: organization.address.postalCode,
        country: organization.address.country,
      },
    });

    await invoice.save();
    return invoice;
  }

  /**
   * Generate invoice PDF
   */
  async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
    const invoice = await Invoice.findById(invoiceId)
      .populate('organizationId')
      .populate('requestId');

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .text('Earth To Orbit', 50, 50)
        .fontSize(10)
        .text('B2B Aerospace Platform', 50, 75)
        .moveDown();

      // Invoice details
      doc
        .fontSize(16)
        .text(`INVOICE ${invoice.invoiceNumber}`, 50, 120)
        .fontSize(10)
        .text(`Date: ${DateTime.fromJSDate(invoice.createdAt).toFormat('dd MMM yyyy')}`)
        .text(`Due Date: ${DateTime.fromJSDate(invoice.dueDate).toFormat('dd MMM yyyy')}`)
        .moveDown();

      // Billing address
      if (invoice.billingAddress) {
        doc
          .fontSize(12)
          .text('Bill To:', 50, 180)
          .fontSize(10)
          .text(invoice.billingAddress.organizationName)
          .text(invoice.billingAddress.address)
          .text(`${invoice.billingAddress.city}, ${invoice.billingAddress.state} ${invoice.billingAddress.postalCode}`)
          .text(invoice.billingAddress.country);

        if (invoice.billingAddress.gstNumber) {
          doc.text(`GST: ${invoice.billingAddress.gstNumber}`);
        }
      }

      doc.moveDown(2);

      // Line items table
      const tableTop = 300;
      const itemCodeX = 50;
      const descriptionX = 200;
      const quantityX = 350;
      const priceX = 420;
      const amountX = 490;

      doc
        .fontSize(10)
        .text('Type', itemCodeX, tableTop)
        .text('Description', descriptionX, tableTop)
        .text('Qty', quantityX, tableTop)
        .text('Rate', priceX, tableTop)
        .text('Amount', amountX, tableTop);

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      let yPos = tableTop + 30;

      invoice.lineItems.forEach((item) => {
        doc
          .fontSize(9)
          .text(item.type, itemCodeX, yPos, { width: 140 })
          .text(item.description, descriptionX, yPos, { width: 140 })
          .text(item.quantity.toFixed(2), quantityX, yPos)
          .text(`₹${item.unitPrice.toFixed(2)}`, priceX, yPos)
          .text(`₹${item.subtotal.toFixed(2)}`, amountX, yPos);

        yPos += 25;
      });

      doc
        .moveTo(50, yPos)
        .lineTo(550, yPos)
        .stroke();

      yPos += 20;

      // Totals
      doc
        .fontSize(10)
        .text('Subtotal:', 400, yPos)
        .text(`₹${invoice.subtotal.toFixed(2)}`, amountX, yPos);

      yPos += 20;

      doc
        .text(`Tax (${invoice.taxPercent}%):`, 400, yPos)
        .text(`₹${invoice.taxAmount.toFixed(2)}`, amountX, yPos);

      yPos += 20;

      doc
        .fontSize(12)
        .text('Total:', 400, yPos)
        .text(`₹${invoice.total.toFixed(2)}`, amountX, yPos);

      // Footer
      doc
        .fontSize(8)
        .text(
          'Thank you for your business!',
          50,
          750,
          { align: 'center', width: 500 }
        );

      doc.end();
    });
  }

  /**
   * Mark invoice as paid
   */
  async markInvoiceAsPaid(invoiceId: string, paidAmount: number): Promise<any> {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    invoice.paidAmount += paidAmount;
    invoice.paidAt = new Date();

    if (invoice.paidAmount >= invoice.total) {
      invoice.status = InvoiceStatus.PAID;
    } else if (invoice.paidAmount > 0) {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await invoice.save();
    return invoice;
  }

  /**
   * Calculate pricing for request items
   */
  calculateRequestPricing(request: any): any {
    let machinerySubtotal = 0;
    let componentsSubtotal = 0;
    let assistanceSubtotal = 0;

    // Calculate machinery costs
    for (const item of request.machineryItems || []) {
      item.subtotal = item.durationHours * item.rateSnapshot;
      machinerySubtotal += item.subtotal;
    }

    // Calculate component costs
    for (const item of request.componentItems || []) {
      if (item.isRental && item.rentalDays) {
        item.subtotal = item.quantity * item.priceSnapshot * item.rentalDays;
      } else {
        item.subtotal = item.quantity * item.priceSnapshot;
      }
      componentsSubtotal += item.subtotal;
    }

    // Calculate assistance costs
    for (const item of request.assistanceItems || []) {
      item.subtotal = item.hours * (item.rateSnapshot || 0);
      assistanceSubtotal += item.subtotal;
    }

    const subtotal = machinerySubtotal + componentsSubtotal + assistanceSubtotal;
    const taxPercent = env.GST_PERCENT;
    const taxAmount = (subtotal * taxPercent) / 100;
    const total = subtotal + taxAmount;

    return {
      machinerySubtotal,
      componentsSubtotal,
      assistanceSubtotal,
      subtotal,
      taxPercent,
      taxAmount,
      total,
      currency: 'INR',
    };
  }
}
