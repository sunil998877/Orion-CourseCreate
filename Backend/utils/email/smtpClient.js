import nodemailer from 'nodemailer';
import { assertSmtpConfig, envVal, mailFrom, smtpPortOrder } from './env.js';

const getResendFromHeader = () => {
  const custom = envVal('EMAIL_FROM');
  const user = envVal('SMTP_USER');
  const candidate = custom || user || 'help@evokeaisolutions.com';
  if (candidate.includes('<') && candidate.includes('>')) {
    return candidate;
  }
  return `Course Creator <${candidate}>`;
};

const sendViaResendHttp = async (mailOptions) => {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) return null;
  const fromHeader = getResendFromHeader();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromHeader,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend API error: ${data.message || JSON.stringify(data)}`);
  }
  console.log(`Mail sent via Resend API id=${data.id} to ${mailOptions.to}`);
  return { messageId: data.id };
};

export const createSmtpTransport = (port) => {
  const { host, user, pass } = assertSmtpConfig();
  const isGmail = host.toLowerCase().includes('gmail');
  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 25000,
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    family: 4,
    pool: false,
    auth: { user, pass },
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 25000,
  });
};

export const dispatchMail = async (mailOptions) => {
  if (process.env.RESEND_API_KEY?.trim()) {
    try {
      const resendInfo = await sendViaResendHttp(mailOptions);
      if (resendInfo) return resendInfo;
    } catch (resendError) {
      console.error('Resend delivery failed, falling back to SMTP:', resendError?.message || resendError);
      if (!envVal('SMTP_HOST')) throw resendError;
    }
  }

  const { host } = assertSmtpConfig();
  const payload = {
    ...mailOptions,
    from: mailFrom(),
    envelope: { from: mailFrom().address, to: mailOptions.to },
  };
  let lastError;
  for (const port of smtpPortOrder()) {
    const transport = createSmtpTransport(port);
    try {
      const info = await transport.sendMail(payload);
      console.log(`Mail sent via ${host}:${port} id=${info.messageId} to ${mailOptions.to}`);
      return info;
    } catch (error) {
      lastError = error;
      console.error(`SMTP ${host}:${port} failed:`, error?.code || '', error?.message || error);
    } finally {
      transport.close();
    }
  }
  throw lastError || new Error('All SMTP ports failed');
};

export const verifySmtpConnection = async () => {
  try {
    const { host, user } = assertSmtpConfig();
    console.log(`Connecting to SMTP Host: "${host}" as ${user}`);
    let lastError;
    for (const port of smtpPortOrder()) {
      const transport = createSmtpTransport(port);
      try {
        await transport.verify();
        console.log(`Connected to SMTP ${host}:${port}`);
        transport.close();
        return true;
      } catch (error) {
        lastError = error;
        console.error(`SMTP verify ${host}:${port} failed:`, error?.message || error);
        transport.close();
      }
    }
    throw lastError;
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    return false;
  }
};
