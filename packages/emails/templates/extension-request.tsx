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

interface ExtensionRequestEmailProps {
  firstName: string;
  requestNumber: string;
  currentEnd: string;
  requestedEnd: string;
  additionalHours: number;
  additionalCost: string;
  reason?: string;
  requestUrl: string;
  isApproved?: boolean;
  adminMessage?: string;
}

export default function ExtensionRequestEmail({
  firstName = 'User',
  requestNumber = 'REQ-2024-00001',
  currentEnd = 'Jan 15, 2024 4:00 PM',
  requestedEnd = 'Jan 15, 2024 6:00 PM',
  additionalHours = 2,
  additionalCost = '₹15,000.00',
  reason = 'Additional testing time required',
  requestUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/dashboard/requests/123` : 'https://earth-to-orbit.com/dashboard/requests/123',
  isApproved = false,
  adminMessage,
}: ExtensionRequestEmailProps) {
  const headerBg = isApproved ? '#10b981' : '#3b82f6';
  const boxBg = isApproved ? '#f0fdf4' : '#f8fafc';
  const boxBorder = isApproved ? '#bbf7d0' : '#e2e8f0';
  const labelColor = isApproved ? '#166534' : '#475569';
  const valueColor = isApproved ? '#052e16' : '#1e293b';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...header, backgroundColor: headerBg }}>
            <Heading style={h1}>
              {isApproved ? '✓ Extension Approved' : 'Extension Request Submitted'}
            </Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              {isApproved
                ? 'Your extension request has been approved! Your booking has been extended.'
                : 'Your extension request has been submitted and is under review.'}
            </Text>

            <Section style={{ ...infoBox, backgroundColor: boxBg, borderColor: boxBorder }}>
              <Text style={{ ...infoLabel, color: labelColor }}>Request Number</Text>
              <Text style={{ ...infoValue, color: valueColor }}>{requestNumber}</Text>

              <Text style={{ ...infoLabel, color: labelColor }}>Current End Time</Text>
              <Text style={{ ...infoValue, color: valueColor }}>{currentEnd}</Text>

              <Text style={{ ...infoLabel, color: labelColor }}>Requested End Time</Text>
              <Text style={{ ...infoValue, color: valueColor }}>{requestedEnd}</Text>

              <Text style={{ ...infoLabel, color: labelColor }}>Additional Hours</Text>
              <Text style={{ ...infoValue, color: valueColor }}>{additionalHours}h</Text>

              <Text style={{ ...infoLabel, color: labelColor }}>Additional Cost</Text>
              <Text style={{ ...infoValue, color: valueColor }}>{additionalCost}</Text>

              {reason && (
                <>
                  <Text style={{ ...infoLabel, color: labelColor }}>Reason</Text>
                  <Text style={{ ...infoValue, color: valueColor }}>{reason}</Text>
                </>
              )}

              <Text style={{ ...infoLabel, color: labelColor }}>Status</Text>
              <Text style={isApproved ? approvedBadge : pendingBadge}>
                {isApproved ? 'Approved' : 'Pending Review'}
              </Text>
            </Section>

            {adminMessage && (
              <Section style={messageBox}>
                <Text style={messageLabel}>Message from Admin:</Text>
                <Text style={messageText}>{adminMessage}</Text>
              </Section>
            )}

            <Text style={text}>
              {isApproved
                ? 'A supplementary invoice has been generated for the additional hours. Please complete the payment to confirm the extension.'
                : 'We will review your extension request and check for conflicts with other bookings. You will be notified once a decision is made.'}
            </Text>

            <Button style={{ ...button, backgroundColor: headerBg }} href={requestUrl}>
              {isApproved ? 'View Invoice & Pay' : 'View Request Status'}
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              {isApproved
                ? 'Extension payment due within 24 hours to maintain your reservation.'
                : 'Extension requests are typically reviewed within 2-4 hours.'}
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
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid',
};

const infoLabel = {
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginTop: '16px',
  marginBottom: '4px',
};

const infoValue = {
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const pendingBadge = {
  display: 'inline-block',
  backgroundColor: '#dbeafe',
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  padding: '6px 12px',
  borderRadius: '4px',
  margin: '0',
};

const approvedBadge = {
  display: 'inline-block',
  backgroundColor: '#d1fae5',
  color: '#065f46',
  fontSize: '14px',
  fontWeight: '600',
  padding: '6px 12px',
  borderRadius: '4px',
  margin: '0',
};

const messageBox = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #fde68a',
};

const messageLabel = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '700',
  marginBottom: '8px',
};

const messageText = {
  color: '#78350f',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const button = {
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
