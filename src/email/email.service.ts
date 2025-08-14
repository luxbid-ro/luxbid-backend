import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly frontendUrl = process.env.FRONTEND_URL || 'https://luxbid.ro';
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize Gmail/Google Workspace transporter
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.GMAIL_USER, // noreply@luxbid.ro
        pass: process.env.GMAIL_APP_PASSWORD, // App password from Google Workspace
      },
      tls: {
        rejectUnauthorized: false // For Google Workspace compatibility
      }
    });

    // Initialize SendGrid if API key is provided
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetLink = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;
    
    // For development, still log to console
    console.log('🔑 PASSWORD RESET EMAIL:');
    console.log('📧 To:', email);
    console.log('🔗 Reset Link:', resetLink);
    console.log('⏰ Token expires in 1 hour');

    // Check available email services
    console.log('🔍 Email Service Debug Info:');
    console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
    console.log('GMAIL_USER exists:', !!process.env.GMAIL_USER);
    console.log('GMAIL_APP_PASSWORD exists:', !!process.env.GMAIL_APP_PASSWORD);
    
    // Try SendGrid first (recommended for production)
    if (process.env.SENDGRID_API_KEY) {
      console.log('📧 Using SendGrid for email delivery...');
      return this.sendEmailWithSendGrid(email, resetToken, resetLink);
    }
    
    // Fallback to Gmail if configured
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log('📧 Using Gmail for email delivery...');
      return this.sendEmailWithGmail(email, resetLink);
    }

    // No email service configured - development mode
    console.log('⚠️ No email service configured, using console fallback.');
    console.log('🔗 Reset link for development:', resetLink);
    return;

  }

  private async sendEmailWithSendGrid(email: string, resetToken: string, resetLink: string): Promise<void> {
    try {
      const msg = {
        to: email,
        from: {
          email: 'noreply@luxbid.ro',
          name: 'LuxBid'
        },
        subject: 'Resetează-ți parola LuxBid',
        html: this.getEmailTemplate(resetLink),
      };

      await sgMail.send(msg);
      console.log('✅ Password reset email sent successfully via SendGrid to:', email);
    } catch (error) {
      console.error('❌ SendGrid email failed:', error);
      console.log('🔗 Reset link for fallback:', resetLink);
    }
  }

  private async sendEmailWithGmail(email: string, resetLink: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"LuxBid" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Resetează-ți parola LuxBid',
        html: this.getEmailTemplate(resetLink),
      });

      console.log('✅ Password reset email sent successfully via Gmail to:', email);
    } catch (error) {
      console.error('❌ Gmail email failed:', error);
      console.log('🔗 Reset link for fallback:', resetLink);
    }
  }

  private getEmailTemplate(resetLink: string): string {
    return `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #D09A1E 0%, #B8881A 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">
                <span style="color: #FFD700;">Lux</span><span style="color: #FFFFFF;">Bid</span>
              </h1>
              <p style="color: white; margin: 8px 0 0 0; opacity: 0.9;">Platforma ta de lux</p>
            </div>
            
            <div style="padding: 40px 20px;">
              <h2 style="color: #333; margin-bottom: 16px; font-size: 24px;">Resetează-ți parola</h2>
              <p style="color: #666; margin-bottom: 24px; line-height: 1.6; font-size: 16px;">
                Ai solicitat resetarea parolei pentru contul tău LuxBid. Apasă pe butonul de mai jos pentru a-ți schimba parola:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" style="display: inline-block; background: #D09A1E; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(208, 154, 30, 0.3);">
                  Resetează Parola
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
                Sau copiază și lipește acest link în browser:
              </p>
              <p style="color: #999; word-break: break-all; background: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 13px; border-left: 4px solid #D09A1E;">
                ${resetLink}
              </p>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #856404; margin: 0; font-weight: 600; font-size: 14px;">
                  ⏰ <strong>Important:</strong> Acest link expiră în 1 oră.
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                Dacă nu ai solicitat resetarea parolei, poți ignora acest email cu încredere. Parola ta nu va fi schimbată.
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Acest email a fost trimis automat de <strong>LuxBid.ro</strong><br>
                Nu răspunde la această adresă de email.
              </p>
            </div>
          </div>
        `;
  }
}
