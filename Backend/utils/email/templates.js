const otpEmailStyles = `
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
`;

export const otpEmailHtml = ({ pageTitle, heading, intro, otpCode, extra = '', footer }) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${pageTitle}</title>
    <style>${otpEmailStyles}</style>
  </head>
  <body>
    <div class="container">
      <div class="logo">COURSE CREATOR</div>
      <div class="title">${heading}</div>
      <div class="text">${intro}</div>
      <div class="otp-box">${otpCode}</div>
      ${extra}
      <div class="footer">${footer}</div>
    </div>
  </body>
  </html>
`;
