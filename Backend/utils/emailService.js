import nodemailer from 'nodemailer';

const envVal = (key, fallback = '') =>
  String(process.env[key] ?? fallback).trim().replace(/^["']|["']$/g, '');

const isCloudHost = Boolean(process.env.RENDER || process.env.VERCEL);

const assertSmtpConfig = () => {
  const host = envVal('SMTP_HOST');
  const user = envVal('SMTP_USER');
  const pass = envVal('SMTP_PASS');
  if (!host || !user || !pass) {
    throw new Error('SMTP is not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS on orion-api in Render)');
  }
  return { host, user, pass };
};

const smtpPortOrder = () => {
  const configured = parseInt(envVal('SMTP_PORT', isCloudHost ? '587' : '465'), 10);
  const preferred = Number.isFinite(configured) && configured > 0 ? configured : (isCloudHost ? 587 : 465);
  // Render often blocks or times out SMTPS 465; STARTTLS 587 usually works.
  const rest = [587, 465].filter((port) => port !== preferred);
  return isCloudHost ? [587, preferred, 465].filter((port, i, arr) => arr.indexOf(port) === i) : [preferred, ...rest];
};

const createSmtpTransport = (port) => {
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

const mailFrom = () => {
  const user = envVal('SMTP_USER');
  return {
    name: 'Course Creator',
    address: user || 'noreply@localhost',
  };
};

const sendViaResend = async (apiKey, mailOptions) => {
  const fromAddress = mailFrom().address;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Course Creator <${fromAddress}>`,
      to: [mailOptions.to],
      subject: mailOptions.subject,
      html: mailOptions.html,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.message || `Resend failed with ${res.status}`);
  }
  console.log(`Mail sent via Resend id=${body.id} to ${mailOptions.to}`);
  return { messageId: body.id };
};

const dispatchMail = async (mailOptions) => {
  const resendKey = envVal('RESEND_API_KEY');
  if (resendKey) {
    return sendViaResend(resendKey, mailOptions);
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
      console.error(
        `SMTP ${host}:${port} failed:`,
        error?.code || '',
        error?.response || error?.message || error
      );
    } finally {
      transport.close();
    }
  }

  throw lastError || new Error('All SMTP ports failed');
};

export const queueVerificationOtpEmail = async (toEmail, otpCode) => {
  await sendVerificationOtpEmail(toEmail, otpCode);
};

export const sendOtpEmail = async (toEmail, otpCode, autoFillUrl) => {
  const mailOptions = {
    from: mailFrom(),
    to: toEmail,
    subject: 'Your 6-Digit Password Reset OTP Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #05070f;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 500px;
            margin: 40px auto;
            background: #0e1322;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          .logo {
            text-align: center;
            font-weight: bold;
            font-size: 24px;
            color: #a3e635;
            letter-spacing: 1px;
            margin-bottom: 24px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 12px;
            color: #ffffff;
            text-align: center;
          }
          .text {
            color: rgba(255,255,255,0.7);
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 24px;
            text-align: center;
          }
          .otp-box {
            background: #05070f;
            border: 1px dashed rgba(163, 230, 53, 0.3);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 6px;
            color: #a3e635;
            margin-bottom: 24px;
          }
          .btn-container {
            text-align: center;
            margin-bottom: 24px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #a3e635 0%, #10b981 100%);
            color: #ffffff;
            font-weight: bold;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
          }
          .footer {
            font-size: 11px;
            color: rgba(255,255,255,0.4);
            text-align: center;
            border-top: 1px solid rgba(255,255,255,0.05);
            padding-top: 16px;
            margin-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">COURSE CREATOR</div>
          <div class="title">Password Reset Requested</div>
          <div class="text">
            We received a request to reset your account password. Use the secure 6-digit OTP code below to set a new password. This code is valid for 1 hour.
          </div>

          <div class="otp-box">${otpCode}</div>

          <div class="text" style="margin-bottom: 12px;">
            Alternatively, you can click the button below to auto-fill this OTP directly into your recovery page:
          </div>
          <div class="footer">
            If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  const resetInfo = await dispatchMail(mailOptions);
  console.log(`Password-reset mail queued for ${toEmail} id=${resetInfo.messageId}`);
};

export const sendVerificationOtpEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: mailFrom(),
    to: toEmail,
    subject: 'Verify Your Email - Course Creator',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #05070f;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 500px;
            margin: 40px auto;
            background: #0e1322;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          .logo {
            text-align: center;
            font-weight: bold;
            font-size: 24px;
            color: #a3e635;
            letter-spacing: 1px;
            margin-bottom: 24px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 12px;
            color: #ffffff;
            text-align: center;
          }
          .text {
            color: rgba(255,255,255,0.7);
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 24px;
            text-align: center;
          }
          .otp-box {
            background: #05070f;
            border: 1px dashed rgba(163, 230, 53, 0.3);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 6px;
            color: #a3e635;
            margin-bottom: 24px;
          }
          .footer {
            font-size: 11px;
            color: rgba(255,255,255,0.4);
            text-align: center;
            border-top: 1px solid rgba(255,255,255,0.05);
            padding-top: 16px;
            margin-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">COURSE CREATOR</div>
          <div class="title">Welcome to Course Creator</div>
          <div class="text">
            Thank you for signing up! Use the 6-digit verification code below to confirm your email address. This code is valid for 10 minutes.
          </div>

          <div class="otp-box">${otpCode}</div>

          <div class="text" style="margin-bottom: 12px;">
            If you did not create an account, you can safely ignore this email.
          </div>
          <div class="footer">
            This is an automated message from Course Creator. Please do not reply to this email.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  const info = await dispatchMail(mailOptions);
  console.log(`Verification OTP mailed to ${toEmail} id=${info.messageId}`);
};

export const verifySmtpConnection = async () => {
  try {
    if (envVal('RESEND_API_KEY')) {
      console.log('Email provider: Resend HTTPS (SMTP skipped)');
      return true;
    }
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
