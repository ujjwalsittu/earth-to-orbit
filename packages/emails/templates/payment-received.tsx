import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
} from '@react-email/components';

interface PaymentReceivedEmailProps {
  firstName: string;
  requestNumber: string;
  invoiceNumber: string;
  paymentMethod: string;
  transactionId: string;
  amountPaid: string;
  scheduledStart: string;
  scheduledEnd: string;
  requestUrl: string;
}

export default function PaymentReceivedEmail({
  firstName = 'User',
  requestNumber = 'REQ-2024-00001',
  invoiceNumber = 'INV-2024-00001',
  paymentMethod = 'Razorpay',
  transactionId = 'pay_123456789',
  amountPaid = '₹45,000.00',
  scheduledStart = 'Jan 15, 2024 10:00 AM',
  scheduledEnd = 'Jan 15, 2024 4:00 PM',
  requestUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/dashboard/requests/123` : 'https://earth-to-orbit.com/dashboard/requests/123',
}: PaymentReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>✓ Payment Confirmed</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              Thank you for your payment! Your booking is now confirmed and your reservation is secured.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Request Number</Text>
              <Text style={infoValue}>{requestNumber}</Text>

              <Text style={infoLabel}>Invoice Number</Text>
              <Text style={infoValue}>{invoiceNumber}</Text>

              <Text style={infoLabel}>Amount Paid</Text>
              <Text style={infoValue}>{amountPaid}</Text>

              <Text style={infoLabel}>Payment Method</Text>
              <Text style={infoValue}>{paymentMethod}</Text>

              <Text style={infoLabel}>Transaction ID</Text>
              <Text style={infoValue}>{transactionId}</Text>

              <Text style={infoLabel}>Scheduled Time</Text>
              <Text style={infoValue}>
                {scheduledStart} - {scheduledEnd}
              </Text>

              <Text style={infoLabel}>Status</Text>
              <Text style={statusBadge}>Paid & Confirmed</Text>
            </Section>

            <Text style={text}>
              You'll receive additional details about your booking via email 24 hours before your
              scheduled time. This will include access instructions, site contact information, and any
              preparation requirements.
            </Text>

            <Button style={button} href={requestUrl}>
              View Booking Details
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              Your invoice and payment receipt are available in your dashboard. For any questions about
              your booking, please contact us.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 24px',
  backgroundColor: '#10b981',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
  textAlign: 'center' as const,
};

const content = {
  padding: '0 24px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '16px',
};

const infoBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #bbf7d0',
};

const infoLabel = {
  color: '#166534',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginTop: '16px',
  marginBottom: '4px',
};

const infoValue = {
  color: '#052e16',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const statusBadge = {
  display: 'inline-block',
  backgroundColor: '#d1fae5',
  color: '#065f46',
  fontSize: '14px',
  fontWeight: '600',
  padding: '6px 12px',
  borderRadius: '4px',
  margin: '0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px 0',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '24px',
};
