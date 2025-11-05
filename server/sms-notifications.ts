// SMS Notification service for order alerts
import twilio from 'twilio';
import nodemailer from 'nodemailer';

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
      
      // Try email-to-SMS gateway first
      if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
        const sent = await this.sendViaSMSGateway('6362544821', message);
        if (sent) return true;
      }
      
      // Fallback: log to console and send notification
      console.log(`📱 SMS ALERT for 636-254-4821: ${message}`);
      
      // Also send browser push notification if available
      try {
        await this.sendPushNotification(message);
      } catch (error) {
        console.log('Push notification failed:', (error as Error).message);
      }
      
      return true;
      
    } catch (error) {
      console.error('SMS notification failed:', error);
      return false;
    }
  }

  private formatOrderMessage(orderData: any): string {
    const trackingInfo = orderData.trackingNumber ? ` Track: ${orderData.trackingNumber}` : '';
    return `🚚 NEW RETURNIT ORDER! Customer: ${orderData.customerName || 'New Customer'}, Pickup: ${orderData.pickupAddress || 'Address pending'}, Amount: $${orderData.totalAmount || 'TBD'}.${trackingInfo} Login to manage.`;
  }

  private async sendPushNotification(message: string): Promise<void> {
    // Send push notification to admin via WebSocket
    try {
      const { webSocketService } = await import('./websocket-service.js');
      if (webSocketService) {
        webSocketService.broadcastAdminNotification({
          type: 'new_order',
          title: 'New Return Order',
          message: message,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      // WebSocket service not available
    }
  }

  private async sendViaSMSGateway(phoneNumber: string, message: string): Promise<boolean> {
    // Use Gmail SMTP (free) - requires app password
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL || 'your-email@gmail.com',
        pass: process.env.SMTP_PASSWORD || 'your-app-password'
      }
    });

    // Try multiple carrier gateways for reliability
    const gateways = ['vtext.com', 'txt.att.net', 'tmomail.net', 'messaging.sprintncs.com'];
    
    for (const gateway of gateways) {
      try {
        const emailAddress = `${phoneNumber}@${gateway}`;
        
        await transporter.sendMail({
          from: process.env.SMTP_EMAIL || 'your-email@gmail.com',
          to: emailAddress,
          subject: '', // SMS gateways ignore subject
          text: message
        });
        
        console.log(`✅ SMS sent to ${emailAddress}: ${message}`);
        return true;
      } catch (error) {
        console.log(`Failed ${gateway}:`, (error as Error).message);
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
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  async sendOrderNotification(orderData: any): Promise<boolean> {
    if (!this.client) {
      console.log('Twilio not configured, using free SMS service');
      return new FreeEmailSMSService().sendOrderNotification(orderData);
    }

    try {
      const trackingInfo = orderData.trackingNumber ? ` Track: ${orderData.trackingNumber}` : '';
      const message = `🚚 NEW RETURNIT ORDER! Customer: ${orderData.customerName}, Pickup: ${orderData.pickupAddress}, Amount: $${orderData.totalAmount}.${trackingInfo}`;
      
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