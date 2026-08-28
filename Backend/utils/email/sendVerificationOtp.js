import { mailFrom } from './env.js';
import { dispatchMail } from './smtpClient.js';
import { otpEmailHtml } from './templates.js';

export const sendVerificationOtpEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: mailFrom(),
    to: toEmail,
    subject: 'Verify Your Email - Course Creator',
    html: otpEmailHtml({
      pageTitle: 'Verify Your Email',
      heading: 'Welcome to Course Creator',
      intro:
        'Thank you for signing up! Use the 6-digit verification code below to confirm your email address. This code is valid for 10 minutes.',
      otpCode,
      extra: `
        <div class="text" style="margin-bottom: 12px;">
          If you did not create an account, you can safely ignore this email.
        </div>
      `,
      footer: 'This is an automated message from Course Creator. Please do not reply to this email.',
    }),
  };
  const info = await dispatchMail(mailOptions);
  console.log(`Verification OTP mailed to ${toEmail} id=${info.messageId}`);
};

export const queueVerificationOtpEmail = async (toEmail, otpCode) => {
  await sendVerificationOtpEmail(toEmail, otpCode);
};

export const trySendVerificationOtpEmail = async (toEmail, otpCode) => {
  try {
    await sendVerificationOtpEmail(toEmail, otpCode);
    return { ok: true };
  } catch (error) {
    const reason = error?.message || String(error);
    console.error('Verification email not delivered:', reason);
    return { ok: false, reason };
  }
};
