import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: ReturnType<typeof twilio> | null = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

export interface SendSmsResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendVerificationSms(
  phoneNumber: string,
  code: string
): Promise<SendSmsResult> {
  if (!twilioClient || !twilioPhoneNumber) {
    console.error('❌ Twilio not configured - missing credentials');
    return {
      success: false,
      error: 'SMS service is not configured. Please contact support.',
    };
  }

  try {
    const message = await twilioClient.messages.create({
      body: `Your Return It verification code is: ${code}\n\nThis code will expire in 24 hours.`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    console.log('✅ SMS sent successfully:', {
      to: phoneNumber,
      sid: message.sid,
      status: message.status,
    });

    return {
      success: true,
      message: 'Verification code sent via SMS',
    };
  } catch (error: any) {
    console.error('❌ Failed to send SMS:', error);
    
    // Check for Twilio trial account restriction (error code 21608)
    if (error?.code === 21608 || error?.message?.includes('unverified')) {
      return {
        success: false,
        error: 'SMS verification is currently unavailable. Please verify your phone number in your Twilio account or use email verification instead.',
      };
    }
    
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to send SMS: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'Failed to send SMS verification code',
    };
  }
}

export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && twilioPhoneNumber);
}
