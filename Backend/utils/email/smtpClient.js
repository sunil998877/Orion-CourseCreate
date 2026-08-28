import nodemailer from 'nodemailer';
import { assertSmtpConfig, mailFrom, smtpPortOrder } from './env.js';

export const createSmtpTransport = (port) => {
  const { host, user, pass } = assertSmtpConfig();
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
