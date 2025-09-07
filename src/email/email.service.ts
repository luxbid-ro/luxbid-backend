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
            <div style="background: #ffffff; padding: 40px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: -1px;">
                <span style="color: #D09A1E;">Lux</span><span style="color: #000000;">Bid</span>
              </h1>
              <p style="color: #666; margin: 8px 0 0 0;">Platforma ta de lux</p>
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

  async sendEmailVerification(email: string, verificationCode: string): Promise<void> {
    const subject = '🔐 Verifică adresa ta de email - LuxBid';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifică Email-ul - LuxBid</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #D09A1E 0%, #B8860B 100%); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .verification-code { background-color: #f8f9fa; border: 2px solid #D09A1E; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; }
          .code { font-size: 32px; font-weight: bold; color: #D09A1E; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .instructions { color: #666666; line-height: 1.6; margin: 20px 0; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; color: #856404; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666666; font-size: 14px; }
          .button { display: inline-block; background-color: #D09A1E; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verifică Email-ul</h1>
          </div>
          <div class="content">
            <h2 style="color: #333333; margin-top: 0;">Bună ziua!</h2>
            <p class="instructions">
              Pentru a finaliza înregistrarea pe <strong>LuxBid</strong> și a accesa toate funcționalitățile platformei, 
              te rugăm să verifici adresa ta de email folosind codul de mai jos:
            </p>
            
            <div class="verification-code">
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px;">Codul tău de verificare:</p>
              <div class="code">${verificationCode}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> Acest cod expiră în <strong>15 minute</strong>. 
              Dacă nu l-ai solicitat tu, te rugăm să ignori acest email.
            </div>
            
            <p class="instructions">
              După verificarea email-ului, vei putea:
            </p>
            <ul style="color: #666666; line-height: 1.8;">
              <li>✅ Accesa complet platforma LuxBid</li>
              <li>✅ Crea și gestiona anunțurile tale</li>
              <li>✅ Primești notificări importante</li>
              <li>✅ Beneficia de comunicarea oficială LuxBid</li>
            </ul>
            
            <p class="instructions">
              Dacă întâmpini probleme sau ai întrebări, nu ezita să ne contactezi la 
              <a href="mailto:support@luxbid.ro" style="color: #D09A1E;">support@luxbid.ro</a>
            </p>
          </div>
          <div class="footer">
            <p>© 2024 LuxBid - Platforma de Lux pentru România</p>
            <p>Acest email a fost trimis automat, te rugăm să nu răspunzi la acest mesaj.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
🔐 Verifică Email-ul - LuxBid

Bună ziua!

Pentru a finaliza înregistrarea pe LuxBid și a accesa toate funcționalitățile platformei, 
te rugăm să verifici adresa ta de email folosind codul de mai jos:

Codul tău de verificare: ${verificationCode}

⚠️ Important: Acest cod expiră în 15 minute. 
Dacă nu l-ai solicitat tu, te rugăm să ignori acest email.

După verificarea email-ului, vei putea:
✅ Accesa complet platforma LuxBid
✅ Crea și gestiona anunțurile tale
✅ Primești notificări importante
✅ Beneficia de comunicarea oficială LuxBid

Dacă întâmpini probleme sau ai întrebări, nu ezita să ne contactezi la support@luxbid.ro

© 2024 LuxBid - Platforma de Lux pentru România
Acest email a fost trimis automat, te rugăm să nu răspunzi la acest mesaj.
    `;

    // For development, log to console
    console.log('📧 EMAIL VERIFICATION:');
    console.log('📧 To:', email);
    console.log('🔢 Verification Code:', verificationCode);
    console.log('⏰ Code expires in 15 minutes');

    // Check available email services
    console.log('🔍 Email Service Debug Info:');
    console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
    console.log('GMAIL_USER exists:', !!process.env.GMAIL_USER);
    console.log('GMAIL_USER value:', process.env.GMAIL_USER);
    console.log('GMAIL_APP_PASSWORD exists:', !!process.env.GMAIL_APP_PASSWORD);
    console.log('GMAIL_APP_PASSWORD length:', process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : 0);
    
    // Try SendGrid first (recommended for production)
    if (process.env.SENDGRID_API_KEY) {
      console.log('📧 Using SendGrid for email verification...');
      return this.sendVerificationWithSendGrid(email, subject, htmlContent, textContent);
    }
    
    // TEMPORARY: Try Gmail with Google Workspace
    console.log('📧 Trying Gmail with Google Workspace...');
    try {
      await this.sendWithGoogleWorkspace(email, subject, htmlContent, textContent);
      console.log('✅ Email sent via Google Workspace');
      return;
    } catch (error) {
      console.log('❌ Google Workspace failed:', error.message);
    }
    
    // Fallback to Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log('📧 Using Gmail for email verification...');
      return this.sendVerificationWithGmail(email, subject, htmlContent, textContent);
    }
    
    // If no email service configured, try to use a fallback
    console.log('⚠️ No email service configured. Trying fallback...');
    
    // Try to send with a basic SMTP configuration
    try {
      await this.sendWithBasicSMTP(email, subject, htmlContent, textContent);
      console.log('✅ Email sent via basic SMTP');
    } catch (error) {
      console.log('❌ Basic SMTP failed:', error.message);
      console.log('⚠️ Email verification code logged above for manual use');
    }
  }

  private async sendVerificationWithSendGrid(email: string, subject: string, htmlContent: string, textContent: string): Promise<void> {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@luxbid.ro',
        name: 'LuxBid - Platforma de Lux'
      },
      subject,
      text: textContent,
      html: htmlContent,
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Email verification sent via SendGrid');
    } catch (error) {
      console.error('❌ SendGrid verification email failed:', error);
      throw error;
    }
  }

  private async sendVerificationWithGmail(email: string, subject: string, htmlContent: string, textContent: string): Promise<void> {
    const mailOptions = {
      from: {
        name: 'LuxBid - Platforma de Lux',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email verification sent via Gmail');
    } catch (error) {
      console.error('❌ Gmail verification email failed:', error);
      throw error;
    }
  }

  private async sendWithBasicSMTP(email: string, subject: string, htmlContent: string, textContent: string): Promise<void> {
    // This method is disabled for security
    throw new Error('Basic SMTP disabled for security');
  }

  private async sendWithTestSendGrid(email: string, subject: string, htmlContent: string, textContent: string): Promise<void> {
    // This method is disabled for security
    throw new Error('Test SendGrid disabled for security');
  }

  private async sendWithLuxBidGmail(email: string, subject: string, htmlContent: string, textContent: string): Promise<void> {
    // This method is disabled for security
    throw new Error('LuxBid Gmail disabled for security');
  }

  private async sendWithGoogleWorkspace(email: string, subject: string, htmlContent: string, textContent: string): Promise<void> {
    // Use existing admin@luxbid.ro credentials
    console.log('🔧 Google Workspace Configuration:');
    console.log('GMAIL_USER:', process.env.GMAIL_USER || 'admin@luxbid.ro');
    console.log('GMAIL_APP_PASSWORD exists:', !!process.env.GMAIL_APP_PASSWORD);
    
    const googleTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER || 'admin@luxbid.ro',
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: 'LuxBid <admin@luxbid.ro>',
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    };

    console.log('📤 Attempting to send email via Google Workspace...');
    console.log('📤 From:', mailOptions.from);
    console.log('📤 To:', mailOptions.to);
    console.log('📤 Subject:', mailOptions.subject);
    
    await googleTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully via Google Workspace!');
  }
}
