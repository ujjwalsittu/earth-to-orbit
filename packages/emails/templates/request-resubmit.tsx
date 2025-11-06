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

interface RequestResubmitEmailProps {
  firstName: string;
  requestNumber: string;
  title: string;
  adminMessage: string;
  requestUrl: string;
}

export default function RequestResubmitEmail({
  firstName = 'User',
  requestNumber = 'REQ-2024-00001',
  title = 'TVAC Testing Request',
  adminMessage = 'Please update your requested time slot. The current slot has a conflict with scheduled maintenance.',
  requestUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/dashboard/requests/123` : 'https://earth-to-orbit.com/dashboard/requests/123',
}: RequestResubmitEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Action Required: Update Request</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              We've reviewed your booking request and need some modifications before we can proceed with
              approval.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Request Number</Text>
              <Text style={infoValue}>{requestNumber}</Text>

              <Text style={infoLabel}>Title</Text>
              <Text style={infoValue}>{title}</Text>

              <Text style={infoLabel}>Status</Text>
              <Text style={statusBadge}>Requires Changes</Text>
            </Section>

            <Section style={messageBox}>
              <Text style={messageLabel}>Message from Admin:</Text>
              <Text style={messageText}>{adminMessage}</Text>
            </Section>

            <Text style={text}>
              Please review the admin's feedback and update your request accordingly. Once you make the
              necessary changes and resubmit, we'll review it again promptly.
            </Text>

            <Button style={button} href={requestUrl}>
              Update Request
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              Need help making these changes? Contact us and we'll guide you through the process or
              suggest alternative options.
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
  backgroundColor: '#f59e0b',
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
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #fde68a',
};

const infoLabel = {
  color: '#92400e',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginTop: '16px',
  marginBottom: '4px',
};

const infoValue = {
  color: '#78350f',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const statusBadge = {
  display: 'inline-block',
  backgroundColor: '#fed7aa',
  color: '#9a3412',
  fontSize: '14px',
  fontWeight: '600',
  padding: '6px 12px',
  borderRadius: '4px',
  margin: '0',
};

const messageBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #bae6fd',
};

const messageLabel = {
  color: '#075985',
  fontSize: '14px',
  fontWeight: '700',
  marginBottom: '8px',
};

const messageText = {
  color: '#0c4a6e',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const button = {
  backgroundColor: '#f59e0b',
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
