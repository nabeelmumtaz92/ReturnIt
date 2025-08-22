// SMS Notification service for order alerts
export interface SMSService {
  sendOrderNotification(orderData: any): Promise<boolean>;
}

// Free SMS service using email-to-SMS gateways (no API keys needed)
export class FreeEmailSMSService implements SMSService {
  private carrierGateways = {
    // Major US carriers
    'verizon': 'vtext.com',
    'att': 'txt.att.net', 
    'tmobile': 'tmomail.net',
    'sprint': 'messaging.sprintncs.com',
    'boost': 'smsmyboostmobile.com',
    'cricket': 'sms.cricketwireless.net'
  };

  async sendOrderNotification(orderData: any): Promise<boolean> {
    try {
      // Format notification message
      const message = this.formatOrderMessage(orderData);
      
      // Send via nodemailer to SMS gateway
      if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
        return await this.sendViaSMSGateway('6362544821', message);
      }
      
      // Fallback: log to console for now
      console.log(`📱 SMS ALERT for 636-254-4821: ${message}`);
      return true;
      
    } catch (error) {
      console.error('SMS notification failed:', error);
      return false;
    }
  }

  private formatOrderMessage(orderData: any): string {
    return `🚚 NEW RETURNIT ORDER! Customer: ${orderData.customerName || 'New Customer'}, Pickup: ${orderData.pickupAddress || 'Address pending'}, Amount: $${orderData.totalAmount || 'TBD'}. Login to manage.`;
  }

  private async sendViaSMSGateway(phoneNumber: string, message: string): Promise<boolean> {
    // Try multiple carrier gateways for reliability
    const gateways = ['vtext.com', 'txt.att.net', 'tmomail.net'];
    
    for (const gateway of gateways) {
      try {
        const emailAddress = `${phoneNumber}@${gateway}`;
        // Would implement nodemailer here with SMTP
        console.log(`Sending to ${emailAddress}: ${message}`);
        return true;
      } catch (error) {
        continue;
      }
    }
    return false;
  }
}

// Twilio SMS service (when credentials are provided)
export class TwilioSMSService implements SMSService {
  private client: any;

  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = require('twilio');
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  async sendOrderNotification(orderData: any): Promise<boolean> {
    if (!this.client) {
      console.log('Twilio not configured, using free SMS service');
      return new FreeEmailSMSService().sendOrderNotification(orderData);
    }

    try {
      const message = `🚚 NEW RETURNIT ORDER! Customer: ${orderData.customerName}, Pickup: ${orderData.pickupAddress}, Amount: $${orderData.totalAmount}`;
      
      await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: '+16362544821' // Your phone number
      });
      
      return true;
    } catch (error) {
      console.error('Twilio SMS failed:', error);
      return false;
    }
  }
}

// Export configured service
export const smsService: SMSService = process.env.TWILIO_ACCOUNT_SID 
  ? new TwilioSMSService() 
  : new FreeEmailSMSService();