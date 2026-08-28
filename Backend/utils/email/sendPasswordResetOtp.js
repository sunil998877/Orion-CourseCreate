import { mailFrom } from './env.js';
import { dispatchMail } from './smtpClient.js';
import { otpEmailHtml } from './templates.js';

export const sendOtpEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: mailFrom(),
    to: toEmail,
    subject: 'Your 6-Digit Password Reset OTP Code',
    html: otpEmailHtml({
      pageTitle: 'Reset Your Password',
      heading: 'Password Reset Requested',
      intro:
        'We received a request to reset your account password. Use the secure 6-digit OTP code below to set a new password. This code is valid for 1 hour.',
      otpCode,
      extra: `
        <div class="text" style="margin-bottom: 12px;">
          Alternatively, you can click the button below to auto-fill this OTP directly into your recovery page:
        </div>
      `,
      footer:
        'If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.',
    }),
  };
  const resetInfo = await dispatchMail(mailOptions);
  console.log(`Password-reset mail queued for ${toEmail} id=${resetInfo.messageId}`);
};
