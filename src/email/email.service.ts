import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly frontendUrl = process.env.FRONTEND_URL || 'https://luxbid.ro';

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetLink = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;
    
    console.log('🔑 PASSWORD RESET EMAIL:');
    console.log('📧 To:', email);
    console.log('🔗 Reset Link:', resetLink);
    console.log('⏰ Token expires in 1 hour');
    
    // TODO: Implement actual email sending with SendGrid, Mailgun, etc.
    // For now, we'll log the reset link to console for development
    
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
