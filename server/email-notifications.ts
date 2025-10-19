import { getUncachableResendClient } from './resend-client';
import type { Order, User } from '@shared/schema';

interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
}

export class EmailNotificationService {
  /**
   * Send order confirmation email when order is created
   */
  async sendOrderConfirmation(order: Order, customerEmail: string): Promise<void> {
    try {
      const { client, fromEmail } = await getUncachableResendClient();

      const emailData: EmailNotificationData = {
        to: customerEmail,
        subject: `Return Pickup Confirmed - ${order.trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #B8956A;">Your Return Pickup is Confirmed!</h2>
            <p>Thank you for using Return It. Your return pickup has been scheduled.</p>
            
            <div style="background: #f8f7f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Details</h3>
              <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
              <p><strong>Pickup Address:</strong> ${order.pickupStreetAddress}, ${order.pickupCity}, ${order.pickupState} ${order.pickupZipCode}</p>
              <p><strong>Return To:</strong> ${order.retailer}</p>
              <p><strong>Total:</strong> $${order.totalPrice?.toFixed(2)}</p>
            </div>

            <p>We'll notify you when a driver is assigned to your pickup.</p>
            
            <p style="margin-top: 30px; color: #666;">
              Track your return: <a href="${process.env.REPLIT_DOMAINS?.split(',')[0]}/track/${order.trackingNumber}" style="color: #B8956A;">View Status</a>
            </p>
          </div>
        `
      };

      await client.emails.send({
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      });

      console.log(`✅ Order confirmation email sent to ${customerEmail}`);
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      // Don't throw - email failure shouldn't break order creation
    }
  }

  /**
   * Send email when driver is assigned
   */
  async sendDriverAssigned(order: Order, customerEmail: string, driverName?: string): Promise<void> {
    try {
      const { client, fromEmail } = await getUncachableResendClient();

      const emailData: EmailNotificationData = {
        to: customerEmail,
        subject: `Driver Assigned - ${order.trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #B8956A;">Driver Assigned to Your Return!</h2>
            <p>${driverName ? `${driverName} has been assigned` : 'A driver has been assigned'} to pick up your return.</p>
            
            <div style="background: #f8f7f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
              <p><strong>Pickup Address:</strong> ${order.pickupStreetAddress}</p>
              <p><strong>Status:</strong> Driver En Route</p>
            </div>

            <p>You'll receive another notification when the driver picks up your items.</p>
            
            <p style="margin-top: 30px;">
              <a href="${process.env.REPLIT_DOMAINS?.split(',')[0]}/track/${order.trackingNumber}" 
                 style="background: #B8956A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Track Live
              </a>
            </p>
          </div>
        `
      };

      await client.emails.send({
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      });

      console.log(`✅ Driver assigned email sent to ${customerEmail}`);
    } catch (error) {
      console.error('❌ Failed to send driver assigned email:', error);
    }
  }

  /**
   * Send email when items are picked up
   */
  async sendPickupConfirmation(order: Order, customerEmail: string): Promise<void> {
    try {
      const { client, fromEmail } = await getUncachableResendClient();

      const emailData: EmailNotificationData = {
        to: customerEmail,
        subject: `Items Picked Up - ${order.trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #B8956A;">Your Return Has Been Picked Up!</h2>
            <p>Your items have been successfully collected by our driver.</p>
            
            <div style="background: #f8f7f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
              <p><strong>Picked Up At:</strong> ${new Date(order.actualPickupTime || Date.now()).toLocaleString()}</p>
              <p><strong>Returning To:</strong> ${order.retailer}</p>
            </div>

            <p>Your items are now being transported to ${order.retailer}.</p>
          </div>
        `
      };

      await client.emails.send({
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      });

      console.log(`✅ Pickup confirmation email sent to ${customerEmail}`);
    } catch (error) {
      console.error('❌ Failed to send pickup confirmation email:', error);
    }
  }

  /**
   * Send email when return is completed
   */
  async sendReturnCompleted(order: Order, customerEmail: string): Promise<void> {
    try {
      const { client, fromEmail } = await getUncachableResendClient();

      const emailData: EmailNotificationData = {
        to: customerEmail,
        subject: `Return Completed - ${order.trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #B8956A;">Your Return is Complete!</h2>
            <p>Your items have been successfully returned to ${order.retailer}.</p>
            
            <div style="background: #f8f7f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
              <p><strong>Completed At:</strong> ${new Date(order.actualDeliveryTime || Date.now()).toLocaleString()}</p>
              <p><strong>Retailer:</strong> ${order.retailer}</p>
            </div>

            <p>Please allow ${order.retailer} 3-5 business days to process your refund.</p>

            ${!order.tip || order.tip === 0 ? `
              <p style="margin-top: 30px;">
                <strong>Loved your driver's service?</strong><br/>
                <a href="${process.env.REPLIT_DOMAINS?.split(',')[0]}/orders/${order.id}/tip" 
                   style="background: #B8956A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">
                  Add a Tip
                </a>
              </p>
            ` : ''}

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Thank you for using Return It!
            </p>
          </div>
        `
      };

      await client.emails.send({
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      });

      console.log(`✅ Return completed email sent to ${customerEmail}`);
    } catch (error) {
      console.error('❌ Failed to send return completed email:', error);
    }
  }

  /**
   * Send email when tip is received (to driver)
   */
  async sendTipReceived(order: Order, driverEmail: string, tipAmount: number): Promise<void> {
    try {
      const { client, fromEmail } = await getUncachableResendClient();

      const emailData: EmailNotificationData = {
        to: driverEmail,
        subject: `🎉 You Received a Tip!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #B8956A;">You Received a Tip!</h2>
            <p>Great news! Your customer added a tip for order ${order.trackingNumber}.</p>
            
            <div style="background: #f8f7f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h1 style="color: #B8956A; margin: 0; font-size: 48px;">$${tipAmount.toFixed(2)}</h1>
              <p style="margin: 10px 0 0 0; color: #666;">Tip Amount</p>
            </div>

            <p>This tip has been added to your earnings for order ${order.trackingNumber}.</p>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Keep up the great work!
            </p>
          </div>
        `
      };

      await client.emails.send({
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      });

      console.log(`✅ Tip received email sent to driver ${driverEmail}`);
    } catch (error) {
      console.error('❌ Failed to send tip received email:', error);
    }
  }
}

// Export singleton instance
export const emailNotificationService = new EmailNotificationService();
