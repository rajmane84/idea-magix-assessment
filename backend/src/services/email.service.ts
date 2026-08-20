import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { env } from "../config/env";

let resendClient: Resend | null = null;
let devTransporter: Transporter | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.resendApiKey);
  }
  return resendClient;
}

async function getDevTransporter(): Promise<Transporter> {
  if (devTransporter) return devTransporter;

  const testAccount = await nodemailer.createTestAccount();
  devTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return devTransporter;
}

function otpEmailHtml(name: string, code: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Verify your Prescripto account</h2>
      <p>Hi ${name},</p>
      <p>Your one-time verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">${code}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `;
}

export const emailService = {
  async sendOtpEmail(to: string, name: string, code: string): Promise<void> {
    const subject = "Your Prescripto verification code";
    const html = otpEmailHtml(name, code);

    if (env.isProd) {
      const { error } = await getResendClient().emails.send({
        from: env.emailFrom,
        to,
        subject,
        html,
      });
      if (error) throw new Error(`Failed to send OTP email: ${error.message}`);
      return;
    }

    const transporter = await getDevTransporter();
    const info = await transporter.sendMail({ from: env.emailFrom, to, subject, html });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`OTP email sent (dev sandbox). Preview: ${previewUrl}`);
  },
};
