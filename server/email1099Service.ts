import { getUncachableResendClient } from './resend-client';
import { TaxYear1099Data } from './tax1099Service';

export interface Send1099EmailParams {
  driverData: TaxYear1099Data;
  pdfUrl: string;
  taxYear: number;
}

export class Email1099Service {
  /**
   * Send 1099 form to a driver via email
   */
  static async send1099ToDriver(params: Send1099EmailParams): Promise<void> {
    const { driverData, pdfUrl, taxYear } = params;
    const resend = getUncachableResendClient();

    const driverName = `${driverData.driverInfo.firstName || ''} ${driverData.driverInfo.lastName || ''}`.trim();
    const driverEmail = driverData.driverInfo.email;

    try {
      await resend.emails.send({
        from: 'Return It <noreply@returnit.online>',
        to: driverEmail,
        subject: `Your ${taxYear} Tax Form (1099-NEC) from Return It`,
        html: this.generate1099EmailHtml({
          driverName,
          taxYear,
          totalEarnings: driverData.totalEarnings,
          payoutCount: driverData.payoutCount,
          pdfUrl,
        }),
      });

      console.log(`✅ 1099 email sent to ${driverEmail} for tax year ${taxYear}`);
    } catch (error) {
      console.error(`❌ Failed to send 1099 email to ${driverEmail}:`, error);
      throw error;
    }
  }

  /**
   * Send 1099 forms to multiple drivers in bulk
   */
  static async sendBulk1099Emails(driversData: {
    driverData: TaxYear1099Data;
    pdfUrl: string;
    taxYear: number;
  }[]): Promise<{
    sent: number;
    failed: number;
    errors: any[];
  }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const data of driversData) {
      try {
        await this.send1099ToDriver(data);
        results.sent++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          email: data.driverData.driverInfo.email,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Generate HTML email content for 1099 notification
   */
  private static generate1099EmailHtml(params: {
    driverName: string;
    taxYear: number;
    totalEarnings: number;
    payoutCount: number;
    pdfUrl: string;
  }): string {
    const { driverName, taxYear, totalEarnings, payoutCount, pdfUrl } = params;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${taxYear} Tax Form (1099-NEC)</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; background-color: #FAF8F4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #B8956A 0%, #8B6F47 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Return It</h1>
              <p style="margin: 8px 0 0 0; color: #FAF8F4; font-size: 16px;">Tax Year ${taxYear}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Your 1099-NEC Form is Ready</h2>
              
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hi ${driverName || 'Driver'},
              </p>

              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your 1099-NEC form for tax year ${taxYear} is now available. This form reports the total nonemployee compensation you earned through Return It during the calendar year.
              </p>

              <!-- Earnings Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F4; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">Earnings Summary</h3>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #4a4a4a; font-size: 15px; padding: 8px 0; border-bottom: 1px solid #e0ddd8;">
                          Total Earnings (Box 1):
                        </td>
                        <td style="color: #1a1a1a; font-size: 15px; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px solid #e0ddd8;">
                          $${totalEarnings.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #4a4a4a; font-size: 15px; padding: 8px 0;">
                          Number of Payouts:
                        </td>
                        <td style="color: #1a1a1a; font-size: 15px; font-weight: 600; text-align: right; padding: 8px 0;">
                          ${payoutCount}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Download Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${pdfUrl}" style="display: inline-block; background: linear-gradient(135deg, #B8956A 0%, #8B6F47 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Download Your 1099-NEC
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Important Information -->
              <div style="background-color: #EEF2FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 30px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 12px 0; color: #1E3A8A; font-size: 16px; font-weight: 600;">Important Tax Information</h4>
                <ul style="margin: 0; padding-left: 20px; color: #1E40AF; font-size: 14px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Keep this form for your tax records</li>
                  <li style="margin-bottom: 8px;">Use this when filing your tax return</li>
                  <li style="margin-bottom: 8px;">This form has also been filed with the IRS</li>
                  <li>Contact a tax professional if you have questions</li>
                </ul>
              </div>

              <p style="margin: 20px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                If you have any questions about your 1099 form, please contact our support team at <a href="mailto:support@returnit.online" style="color: #B8956A; text-decoration: none;">support@returnit.online</a>.
              </p>

              <p style="margin: 20px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                <strong>The Return It Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F5F5; padding: 30px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6b6b6b; font-size: 12px; line-height: 1.5;">
                Return It LLC<br>
                St. Louis, MO<br>
                <a href="https://returnit.online" style="color: #B8956A; text-decoration: none;">returnit.online</a>
              </p>
              <p style="margin: 16px 0 0 0; color: #999; font-size: 11px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Send test 1099 email (for testing purposes)
   */
  static async sendTest1099Email(toEmail: string): Promise<void> {
    const testData: TaxYear1099Data = {
      driverId: 999,
      taxYear: new Date().getFullYear() - 1,
      totalEarnings: 15250.50,
      totalPayouts: 24,
      instantPayouts: 8,
      weeklyPayouts: 16,
      totalFees: 150.00,
      netAmount: 15100.50,
      payoutCount: 24,
      firstPayoutDate: new Date(new Date().getFullYear() - 1, 0, 15),
      lastPayoutDate: new Date(new Date().getFullYear() - 1, 11, 20),
      driverInfo: {
        firstName: 'Test',
        lastName: 'Driver',
        email: toEmail,
        phone: '(555) 123-4567',
      },
    };

    await this.send1099ToDriver({
      driverData: testData,
      pdfUrl: 'https://returnit.online/sample-1099.pdf',
      taxYear: testData.taxYear,
    });
  }
}
