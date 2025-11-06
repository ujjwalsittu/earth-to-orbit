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

interface RequestRejectedEmailProps {
  firstName: string;
  requestNumber: string;
  title: string;
  reason?: string;
  requestUrl: string;
  supportEmail?: string;
}

export default function RequestRejectedEmail({
  firstName = 'User',
  requestNumber = 'REQ-2024-00001',
  title = 'TVAC Testing Request',
  reason = 'The requested time slot is not available. Please select an alternative date.',
  requestUrl = 'https://e2o.com/dashboard/requests/123',
  supportEmail = 'support@e2o.com',
}: RequestRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Request Update Required</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              We've reviewed your booking request and unfortunately cannot approve it at this time.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Request Number</Text>
              <Text style={infoValue}>{requestNumber}</Text>

              <Text style={infoLabel}>Title</Text>
              <Text style={infoValue}>{title}</Text>

              <Text style={infoLabel}>Status</Text>
              <Text style={statusBadge}>Rejected</Text>
            </Section>

            {reason && (
              <Section style={reasonBox}>
                <Text style={reasonLabel}>Reason:</Text>
                <Text style={reasonText}>{reason}</Text>
              </Section>
            )}

            <Text style={text}>
              You can modify your request and resubmit it with updated details. Our team is here to help
              you find the best solution for your needs.
            </Text>

            <Button style={button} href={requestUrl}>
              Modify & Resubmit Request
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              Need help? Contact us at{' '}
              <a href={`mailto:${supportEmail}`} style={link}>
                {supportEmail}
              </a>{' '}
              and we'll assist you in finding available slots.
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
  backgroundColor: '#ef4444',
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
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #fecaca',
};

const infoLabel = {
  color: '#991b1b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginTop: '16px',
  marginBottom: '4px',
};

const infoValue = {
  color: '#7f1d1d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const statusBadge = {
  display: 'inline-block',
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  fontSize: '14px',
  fontWeight: '600',
  padding: '6px 12px',
  borderRadius: '4px',
  margin: '0',
};

const reasonBox = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #fde68a',
};

const reasonLabel = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '700',
  marginBottom: '8px',
};

const reasonText = {
  color: '#78350f',
  fontSize: '15px',
  lineHeight: '24px',
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

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};
