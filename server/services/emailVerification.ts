import crypto from 'crypto';
import { Resend } from 'resend';

let resendClient: Resend | null = null;
let fromEmail: string = 'noreply@returnit.online';

// Initialize Resend client
async function getResendClient() {
  if (resendClient) {
    return { client: resendClient, fromEmail };
  }

  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY
      ? 'repl ' + process.env.REPL_IDENTITY
      : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

    if (!xReplitToken) {
      throw new Error('X_REPLIT_TOKEN not found for repl/depl');
    }

    const connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    if (!connectionSettings || !connectionSettings.settings.api_key) {
      throw new Error('Resend not connected');
    }

    const apiKey = connectionSettings.settings.api_key;
    fromEmail = connectionSettings.settings.from_email || 'noreply@returnit.online';
    resendClient = new Resend(apiKey);

    return { client: resendClient, fromEmail };
  } catch (error) {
    console.error('[Email Verification] Failed to initialize Resend client:', error);
    throw error;
  }
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(
  email: string,
  verificationCode: string,
  firstName: string
): Promise<void> {
  try {
    const { client, fromEmail: from } = await getResendClient();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Return It</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #FAF8F4;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border: 2px solid #B8956A;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #B8956A 0%, #9B7A54 100%);
      padding: 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
      color: #333;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #333;
    }
    .verification-code {
      background: #FAF8F4;
      border: 2px dashed #B8956A;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 8px;
      color: #B8956A;
      font-family: 'Courier New', monospace;
    }
    .instructions {
      margin: 20px 0;
      line-height: 1.6;
      color: #555;
    }
    .footer {
      padding: 20px 30px;
      background: #FAF8F4;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 14px;
      color: #777;
    }
    .button {
      display: inline-block;
      background: #B8956A;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .expiry {
      color: #999;
      font-size: 14px;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Return It</h1>
    </div>
    <div class="content">
      <div class="greeting">
        Hi ${firstName || 'there'},
      </div>
      <p class="instructions">
        Thank you for signing up for Return It! To complete your registration and verify your email address, 
        please use the verification code below:
      </p>
      <div class="verification-code">
        <div class="code">${verificationCode}</div>
        <div class="expiry">This code expires in 1 hour</div>
      </div>
      <p class="instructions">
        If you didn't create an account with Return It, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>Return It - Reverse Delivery Service</p>
      <p>St. Louis, MO | returnit.online</p>
    </div>
  </div>
</body>
</html>
    `;

    await client.emails.send({
      from: from,
      to: email,
      subject: 'Verify Your Email - Return It',
      html: htmlContent,
    });

    console.log(`[Email Verification] Verification email sent to ${email}`);
  } catch (error) {
    console.error('[Email Verification] Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string
): Promise<void> {
  try {
    const { client, fromEmail: from } = await getResendClient();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Return It!</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #FAF8F4;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border: 2px solid #B8956A;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #B8956A 0%, #9B7A54 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
      color: #333;
    }
    .greeting {
      font-size: 20px;
      margin-bottom: 20px;
      color: #333;
      font-weight: 600;
    }
    .feature {
      margin: 20px 0;
      padding-left: 30px;
      position: relative;
    }
    .feature::before {
      content: "📦";
      position: absolute;
      left: 0;
      top: 0;
    }
    .cta-button {
      display: inline-block;
      background: #B8956A;
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 30px 0;
      text-align: center;
    }
    .footer {
      padding: 20px 30px;
      background: #FAF8F4;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 14px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Return It!</h1>
      <p style="margin: 0;">Your account is ready to go</p>
    </div>
    <div class="content">
      <div class="greeting">
        Hi ${firstName},
      </div>
      <p>
        Welcome aboard! Your email has been verified and you're all set to start using Return It.
      </p>
      <div class="feature">
        <strong>Easy Returns</strong><br>
        Book a pickup and we'll handle the rest
      </div>
      <div class="feature">
        <strong>Real-Time Tracking</strong><br>
        Track your returns every step of the way
      </div>
      <div class="feature">
        <strong>Multiple Pricing Tiers</strong><br>
        Choose Standard, Priority, or Instant service
      </div>
      <center>
        <a href="https://returnit.online" class="cta-button">Get Started</a>
      </center>
    </div>
    <div class="footer">
      <p>Return It - Reverse Delivery Service</p>
      <p>St. Louis, MO | returnit.online</p>
    </div>
  </div>
</body>
</html>
    `;

    await client.emails.send({
      from: from,
      to: email,
      subject: 'Welcome to Return It!',
      html: htmlContent,
    });

    console.log(`[Email Verification] Welcome email sent to ${email}`);
  } catch (error) {
    console.error('[Email Verification] Failed to send welcome email:', error);
    // Don't throw error for welcome email - it's not critical
  }
}
