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
  } catch (error) {
    console.error('❌ Failed to send SMS:', error);
    
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
