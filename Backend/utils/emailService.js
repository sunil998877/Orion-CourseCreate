import nodemailer from 'nodemailer';

let transporter = null;

const envVal = (key, fallback = '') =>
  String(process.env[key] ?? fallback).trim().replace(/^["']|["']$/g, '');

const assertSmtpConfig = () => {
  const host = envVal('SMTP_HOST');
  const user = envVal('SMTP_USER');
  const pass = envVal('SMTP_PASS');
  if (!host || !user || !pass) {
    throw new Error('SMTP is not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS on the API host)');
  }
  return { host, user, pass };
};

const getTransporter = () => {
  if (!transporter) {
    const { host, user, pass } = assertSmtpConfig();
    const smtpPort = parseInt(envVal('SMTP_PORT', '465'), 10) || 465;
    const serverless = Boolean(process.env.VERCEL);
    transporter = nodemailer.createTransport({
      host,
      port: smtpPort,
      secure: smtpPort === 465,
      requireTLS: smtpPort === 587,
      family: 4,
      pool: !serverless,
      maxConnections: serverless ? 1 : 3,
      maxMessages: 50,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 20000,
    });
  }
  return transporter;
};

const mailFrom = () =>
  envVal('EMAIL_FROM') || `"Course Creator" <${envVal('SMTP_USER')}>`;

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

  const resetInfo = await getTransporter().sendMail(mailOptions);
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

  const info = await getTransporter().sendMail(mailOptions);
  console.log(`Verification OTP mailed to ${toEmail} id=${info.messageId}`);
};

export const verifySmtpConnection = async () => {
  try {
    console.log(`Connecting to SMTP Host: "${envVal('SMTP_HOST')}:${envVal('SMTP_PORT')}" as ${envVal('SMTP_USER')}`);
    const t = getTransporter();
    await t.verify();
    console.log("✅ Connected to SMTP mail server successfully");
    return true;
  } catch (error) {
    console.error("❌ SMTP connection verification failed:", error);
    return false;
  }
};
