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

interface RegistrationEmailProps {
  firstName: string;
  organizationName: string;
  email: string;
  loginUrl: string;
}

export default function RegistrationEmail({
  firstName = 'User',
  organizationName = 'Your Organization',
  email = 'user@example.com',
  loginUrl = 'https://e2o.com/login',
}: RegistrationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Welcome to Earth To Orbit</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              Welcome to Earth To Orbit! Your account for <strong>{organizationName}</strong> has been
              successfully created.
            </Text>

            <Text style={text}>
              You can now access our platform to book aerospace labs, machinery, and components for your
              satellite development projects.
            </Text>

            <Section style={infoBox}>
              <Text style={infoText}>
                <strong>Email:</strong> {email}
              </Text>
              <Text style={infoText}>
                <strong>Organization:</strong> {organizationName}
              </Text>
            </Section>

            <Button style={button} href={loginUrl}>
              Login to Your Account
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              If you didn't create this account, please ignore this email or contact our support team.
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
  padding: '20px',
  margin: '24px 0',
};

const infoText = {
  color: '#475569',
  fontSize: '14px',
  margin: '8px 0',
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
