import { getUncachableResendClient } from './resend-client';
import type { Order, User } from '@shared/schema';
import { generateSignedToken } from '@shared/utils/urlSigner';

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
      
      // Generate signed URLs for secure access (valid for 72 hours)
      const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://returnit.online';
      const orderViewToken = generateSignedToken({
        resource: 'order',
        resourceId: order.id,
        userId: order.userId || undefined,
        expiresInHours: 72
      });
      const receiptToken = generateSignedToken({
        resource: 'receipt',
        resourceId: order.id,
        userId: order.userId || undefined,
        expiresInHours: 72
      });
      
      const orderViewUrl = `${baseUrl}/api/orders/${order.id}/view?token=${orderViewToken}`;
      const receiptUrl = `${baseUrl}/api/orders/${order.id}/receipt?token=${receiptToken}`;

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
            
            <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; border: 2px dashed #B8956A;">
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #8B6F47;">Secure Order Links (valid for 72 hours)</p>
              <p style="margin: 8px 0;">
                📄 <a href="${receiptUrl}" style="color: #B8956A; text-decoration: none; font-weight: bold;">View Receipt</a>
              </p>
              <p style="margin: 8px 0;">
                📦 <a href="${baseUrl}/track/${order.trackingNumber}" style="color: #B8956A; text-decoration: none; font-weight: bold;">Track Your Return</a>
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">
                These secure links are unique to you and will expire in 72 hours. For continued access, please track your order using your tracking number and ZIP code.
              </p>
            </div>
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
      
      // Generate signed URLs for secure access (valid for 72 hours)
      const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://returnit.online';
      const invoiceToken = generateSignedToken({
        resource: 'invoice',
        resourceId: order.id,
        userId: order.userId || undefined,
        expiresInHours: 72
      });
      const receiptToken = generateSignedToken({
        resource: 'receipt',
        resourceId: order.id,
        userId: order.userId || undefined,
        expiresInHours: 72
      });
      
      const invoiceUrl = `${baseUrl}/api/orders/${order.id}/invoice?token=${invoiceToken}`;
      const receiptUrl = `${baseUrl}/api/orders/${order.id}/receipt?token=${receiptToken}`;

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

            <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; border: 2px dashed #B8956A;">
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #8B6F47;">Download Your Documents</p>
              <p style="margin: 8px 0;">
                📄 <a href="${receiptUrl}" style="color: #B8956A; text-decoration: none; font-weight: bold;">Download Receipt</a>
              </p>
              <p style="margin: 8px 0;">
                🧾 <a href="${invoiceUrl}" style="color: #B8956A; text-decoration: none; font-weight: bold;">Download Invoice</a>
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">
                These secure links are unique to you and will expire in 72 hours. Please download your documents for your records.
              </p>
            </div>

            ${!order.tip || order.tip === 0 ? `
              <p style="margin-top: 30px;">
                <strong>Loved your driver's service?</strong><br/>
                <a href="${baseUrl}/orders/${order.id}/tip" 
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

  /**
   * Send daily stats summary email to admin
   */
  async sendDailyStatsSummary(stats: {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    driverPayouts: number;
    platformRevenue: number;
    activeDrivers: number;
    date: string;
  }, adminEmail: string): Promise<void> {
    try {
      const { client, fromEmail } = await getUncachableResendClient();

      const completionRate = stats.totalOrders > 0 
        ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)
        : '0.0';

      const emailData: EmailNotificationData = {
        to: adminEmail,
        subject: `📊 Daily Stats Summary - ${stats.date}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #B8956A 0%, #A0805A 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📊 Daily Operations Report</h1>
              <p style="color: #FAF8F4; margin: 8px 0 0 0; font-size: 16px;">${stats.date}</p>
            </div>
            
            <div style="background: #f8f7f5; padding: 30px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #8B6F47; margin-top: 0;">Yesterday's Performance</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 2px solid #B8956A;">
                  <td style="padding: 15px 0; font-weight: bold; color: #8B6F47; font-size: 18px;">Orders</td>
                  <td></td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #666;">Total Orders</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 24px; font-weight: bold; color: #B8956A;">${stats.totalOrders}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #666;">Completed</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 24px; font-weight: bold; color: #10b981;">${stats.completedOrders}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 20px 0; color: #666;">Completion Rate</td>
                  <td style="padding: 12px 0 20px 0; text-align: right; font-size: 20px; font-weight: bold; color: #059669;">${completionRate}%</td>
                </tr>
                
                <tr style="border-bottom: 2px solid #B8956A;">
                  <td style="padding: 15px 0; font-weight: bold; color: #8B6F47; font-size: 18px;">Revenue</td>
                  <td></td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #666;">Total Revenue</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 24px; font-weight: bold; color: #B8956A;">$${stats.totalRevenue.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #666;">Driver Payouts (70%)</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 20px; font-weight: bold; color: #6366f1;">$${stats.driverPayouts.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 20px 0; color: #666;">Platform Revenue (30%)</td>
                  <td style="padding: 12px 0 20px 0; text-align: right; font-size: 20px; font-weight: bold; color: #10b981;">$${stats.platformRevenue.toFixed(2)}</td>
                </tr>
                
                <tr style="border-bottom: 2px solid #B8956A;">
                  <td style="padding: 15px 0; font-weight: bold; color: #8B6F47; font-size: 18px;">Drivers</td>
                  <td></td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #666;">Active Drivers</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 24px; font-weight: bold; color: #B8956A;">${stats.activeDrivers}</td>
                </tr>
              </table>
              
              <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; border-left: 4px solid #B8956A;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  <strong style="color: #8B6F47;">Automated Report</strong><br>
                  This summary is automatically generated every morning at 8:00 AM CST with data from the previous day.
                </p>
              </div>
              
              <div style="margin-top: 25px; text-align: center;">
                <a href="${process.env.REPLIT_DOMAINS?.split(',')[0]}/admin-dashboard" 
                   style="background: linear-gradient(135deg, #B8956A 0%, #A0805A 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Full Dashboard
                </a>
              </div>
            </div>
            
            <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
              <p>Return It - Reverse Delivery Service Platform</p>
            </div>
          </div>
        `
      };

      await client.emails.send({
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      });

      console.log(`✅ Daily stats summary email sent to ${adminEmail}`);
    } catch (error) {
      console.error('❌ Failed to send daily stats summary email:', error);
    }
  }
}

// Export singleton instance
export const emailNotificationService = new EmailNotificationService();
