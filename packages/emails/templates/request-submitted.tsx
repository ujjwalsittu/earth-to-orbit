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

interface RequestSubmittedEmailProps {
  firstName: string;
  requestNumber: string;
  title: string;
  totalAmount: string;
  requestUrl: string;
}

export default function RequestSubmittedEmail({
  firstName = 'User',
  requestNumber = 'REQ-2024-00001',
  title = 'TVAC Testing Request',
  totalAmount = '₹45,000.00',
  requestUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/dashboard/requests/123` : 'https://earth-to-orbit.com/dashboard/requests/123',
}: RequestSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Request Submitted</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              Your booking request has been successfully submitted and is now under review by our team.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Request Number</Text>
              <Text style={infoValue}>{requestNumber}</Text>

              <Text style={infoLabel}>Title</Text>
              <Text style={infoValue}>{title}</Text>

              <Text style={infoLabel}>Total Amount</Text>
              <Text style={infoValue}>{totalAmount}</Text>

              <Text style={infoLabel}>Status</Text>
              <Text style={statusBadge}>Submitted</Text>
            </Section>

            <Text style={text}>
              Our team will review your request and check availability. You'll receive a notification once
              your request is approved or if we need any additional information.
            </Text>

            <Button style={button} href={requestUrl}>
              View Request Details
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              Typical review time: 24-48 hours. You can track the status of your request in your
              dashboard.
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
  backgroundColor: '#3b82f6',
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
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #e2e8f0',
};

const infoLabel = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginTop: '16px',
  marginBottom: '4px',
};

const infoValue = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const statusBadge = {
  display: 'inline-block',
  backgroundColor: '#dbeafe',
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  padding: '6px 12px',
  borderRadius: '4px',
  margin: '0',
};

const button = {
  backgroundColor: '#3b82f6',
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
