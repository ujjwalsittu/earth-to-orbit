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

interface RequestApprovedEmailProps {
  firstName: string;
  requestNumber: string;
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  invoiceNumber: string;
  totalAmount: string;
  requestUrl: string;
}

export default function RequestApprovedEmail({
  firstName = 'User',
  requestNumber = 'REQ-2024-00001',
  title = 'TVAC Testing Request',
  scheduledStart = 'Jan 15, 2024 10:00 AM',
  scheduledEnd = 'Jan 15, 2024 4:00 PM',
  invoiceNumber = 'INV-2024-00001',
  totalAmount = '₹45,000.00',
  requestUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/dashboard/requests/123` : 'https://earth-to-orbit.com/dashboard/requests/123',
}: RequestApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>✓ Request Approved!</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              Great news! Your booking request has been approved and scheduled.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Request Number</Text>
              <Text style={infoValue}>{requestNumber}</Text>

              <Text style={infoLabel}>Title</Text>
              <Text style={infoValue}>{title}</Text>

              <Text style={infoLabel}>Scheduled Time</Text>
              <Text style={infoValue}>
                {scheduledStart} - {scheduledEnd}
              </Text>

              <Text style={infoLabel}>Invoice Number</Text>
              <Text style={infoValue}>{invoiceNumber}</Text>

              <Text style={infoLabel}>Total Amount</Text>
              <Text style={infoValue}>{totalAmount}</Text>

              <Text style={infoLabel}>Status</Text>
              <Text style={statusBadge}>Approved & Scheduled</Text>
            </Section>

            <Text style={text}>
              An invoice has been generated for this booking. Please complete the payment to confirm your
              reservation.
            </Text>

            <Button style={button} href={requestUrl}>
              View Invoice & Pay
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              Payment due within 7 days. Please contact us if you need to make any changes to your
              booking.
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
