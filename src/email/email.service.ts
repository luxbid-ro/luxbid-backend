import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly frontendUrl = process.env.FRONTEND_URL || 'https://luxbid.ro';
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // noreply@luxbid.ro
        pass: process.env.GMAIL_APP_PASSWORD, // App password from Google Workspace
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetLink = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;
    
    // For development, still log to console
    console.log('🔑 PASSWORD RESET EMAIL:');
    console.log('📧 To:', email);
    console.log('🔗 Reset Link:', resetLink);
    console.log('⏰ Token expires in 1 hour');

    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log('⚠️ Gmail credentials not configured, email not sent. Check console for reset link.');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"LuxBid" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Resetează-ți parola LuxBid',
        html: `
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
        `,
      });

      console.log('✅ Password reset email sent successfully to:', email);
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      // Don't throw error to avoid breaking the reset flow
      // User will still see the success message and can check console for link
    }
    
    // Example with SendGrid:
    /*
    const msg = {
      to: email,
      from: 'noreply@luxbid.ro',
      subject: 'Resetează-ți parola LuxBid',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D09A1E;">Resetează-ți parola LuxBid</h2>
          <p>Ai solicitat resetarea parolei pentru contul tău LuxBid.</p>
          <p>Apasă pe butonul de mai jos pentru a-ți schimba parola:</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #D09A1E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Resetează Parola
          </a>
          <p>Sau copiază și lipește acest link în browser:</p>
          <p style="color: #666; word-break: break-all;">${resetLink}</p>
          <p><strong>Acest link expiră în 1 oră.</strong></p>
          <p>Dacă nu ai solicitat resetarea parolei, poți ignora acest email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Acest email a fost trimis automat. Nu răspunde la această adresă.
          </p>
        </div>
      `
    };
    
    await sgMail.send(msg);
    */
  }
}
