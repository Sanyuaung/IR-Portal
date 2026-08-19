import nodemailer from 'nodemailer';

const host = process.env.MAIL_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.MAIL_PORT || '587', 10);
const user = process.env.MAIL_USERNAME || 'sanyuaung.ygn.mm@gmail.com';
const pass = process.env.MAIL_PASSWORD || 'xpkbqrjshoayiomx';
const fromName = process.env.MAIL_FROM_NAME || 'KBZ Bank IR Portal';
const fromAddress = process.env.MAIL_FROM_ADDRESS || 'sanyuaung.ygn.mm@gmail.com';

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendOtpEmail(toEmail: string, otpCode: string, recipientName?: string) {
  const cleanRecipient = (toEmail || '').trim();
  if (!cleanRecipient) {
    console.error('[SMTP] No recipient email specified');
    return { success: false, error: 'Recipient email is required' };
  }

  const name = recipientName || cleanRecipient.split('@')[0] || 'Valued Customer';
  const subject = `[KBZ Bank IR Portal] Your 2FA Security Code: ${otpCode}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #0B2B66; padding: 28px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 4px 0 0 0; font-size: 12px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f8fafc; border: 2px dashed #0B2B66; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0B2B66; margin: 0; }
        .otp-sub { font-size: 12px; color: #64748b; margin-top: 8px; }
        .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #92400e; margin-bottom: 24px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>KBZ BANK</h1>
          <p>Inbound Remittance Portal</p>
        </div>
        <div class="content">
          <div class="greeting">Hello, ${name}</div>
          <div class="text">
            You recently requested a Two-Factor Authentication (2FA) verification code to authenticate your session on the KBZ Bank Inbound Remittance Portal.
          </div>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <div class="otp-sub">This verification code is valid for 1 minute (60 seconds)</div>
          </div>
          <div class="warning">
            <strong>Security Notice:</strong> Never share this code with anyone. KBZ Bank staff will never ask for your password or 2FA OTP code.
          </div>
          <div class="text" style="font-size: 12px; color: #64748b; margin-bottom: 0;">
            Sent to your registered email: <strong>${cleanRecipient}</strong><br>
            If you did not initiate this request, please contact KBZ Bank Security Operations immediately.
          </div>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Kanbawza Bank Limited (KBZ Bank). All rights reserved.<br>
          Yangon Main Corporate Branch • Security & Compliance Dept
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `KBZ BANK - Inbound Remittance Portal\n\nYour Two-Factor Authentication (2FA) Verification Code is: ${otpCode}\n\nThis code will expire in 1 minute (60 seconds). Never share this code with anyone.\nSent to: ${cleanRecipient}`;

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: cleanRecipient,
      subject,
      text,
      html,
    });
    console.log(`[SMTP] 2FA Email sent successfully to ${cleanRecipient}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipients: cleanRecipient };
  } catch (err: any) {
    console.error(`[SMTP] Failed to send email to ${cleanRecipient}:`, err);
    return { success: false, error: err.message };
  }
}
