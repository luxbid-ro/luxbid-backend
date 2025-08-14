#!/usr/bin/env node

/**
 * 🔍 GMAIL STATUS CHECKER
 * 
 * Checks if Gmail credentials are properly configured
 */

const API_BASE = 'https://luxbid-backend.onrender.com';

async function checkGmailStatus() {
  console.log('🔍 CHECKING GMAIL CONFIGURATION STATUS...\n');
  
  console.log('🧪 Sending password reset request to trigger Gmail...');
  
  try {
    const response = await fetch(`${API_BASE}/auth/request-password-reset`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'LuxBid-Gmail-Test/1.0'
      },
      body: JSON.stringify({ 
        email: 'andrei.ionut91@icloud.com'
      })
    });

    const result = await response.json();
    
    console.log('📊 API Response:', {
      status: response.status,
      message: result.message
    });
    
    console.log('\n📋 EXPECTED BEHAVIOR:');
    console.log('✅ If Gmail configured: Real email sent to andrei.ionut91@icloud.com');
    console.log('⚠️  If Gmail NOT configured: Console log with reset link (no email sent)');
    console.log('❌ If Gmail misconfigured: Error in Render logs + console fallback');
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Check Render backend logs for Gmail errors');
    console.log('2. Verify GMAIL_USER and GMAIL_APP_PASSWORD in Render');
    console.log('3. Ensure 2-Step Verification is enabled for noreply@luxbid.ro');
    console.log('4. Generate new App Password if needed');
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

checkGmailStatus().catch(console.error);
