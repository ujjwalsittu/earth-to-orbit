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

interface ForgotPasswordEmailProps {
  firstName: string;
  resetUrl: string;
  expiryHours?: number;
}

export default function ForgotPasswordEmail({
  firstName = 'User',
  resetUrl = 'https://e2o.com/reset-password',
  expiryHours = 24,
}: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Password Reset Request</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              We received a request to reset the password for your Earth To Orbit account.
            </Text>

            <Text style={text}>
              Click the button below to reset your password. This link will expire in{' '}
              <strong>{expiryHours} hours</strong>.
            </Text>

            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>

            <Hr style={hr} />

            <Text style={warningText}>
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore
              this email and ensure your account is secure. Someone may have entered your email address
              by mistake.
            </Text>

            <Text style={footer}>
              The reset link will expire after {expiryHours} hours for security reasons.
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

const warningText = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '6px',
  padding: '16px',
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  marginBottom: '16px',
};

const footer = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '24px',
};
