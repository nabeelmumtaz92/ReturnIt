import { storage } from './storage';
import { db } from './db';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { driverPayouts, users } from '@shared/schema';

export interface TaxYear1099Data {
  driverId: number;
  taxYear: number;
  totalEarnings: number;
  totalPayouts: number;
  instantPayouts: number;
  weeklyPayouts: number;
  totalFees: number;
  netAmount: number;
  payoutCount: number;
  firstPayoutDate: Date | null;
  lastPayoutDate: Date | null;
  driverInfo: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    address?: any;
  };
}

export interface Generate1099Params {
  driverId: number;
  taxYear: number;
}

export class Tax1099Service {
  /**
   * Calculate annual earnings for a driver for a specific tax year
   */
  static async calculateDriverAnnualEarnings(
    driverId: number,
    taxYear: number
  ): Promise<TaxYear1099Data | null> {
    try {
      // Get driver information
      const driver = await storage.getUser(driverId);
      if (!driver || !driver.isDriver) {
        throw new Error('Driver not found');
      }

      // Calculate tax year date range (Jan 1 - Dec 31)
      const yearStart = new Date(taxYear, 0, 1); // January 1
      const yearEnd = new Date(taxYear, 11, 31, 23, 59, 59); // December 31

      // Query all completed payouts for this driver in the tax year
      const payouts = await db
        .select()
        .from(driverPayouts)
        .where(
          and(
            eq(driverPayouts.driverId, driverId),
            eq(driverPayouts.status, 'completed'),
            gte(driverPayouts.completedAt, yearStart),
            lte(driverPayouts.completedAt, yearEnd)
          )
        )
        .execute();

      if (payouts.length === 0) {
        // No payouts for this year - return zero data
        return {
          driverId,
          taxYear,
          totalEarnings: 0,
          totalPayouts: 0,
          instantPayouts: 0,
          weeklyPayouts: 0,
          totalFees: 0,
          netAmount: 0,
          payoutCount: 0,
          firstPayoutDate: null,
          lastPayoutDate: null,
          driverInfo: {
            firstName: driver.firstName,
            lastName: driver.lastName,
            email: driver.email,
            phone: driver.phone,
            address: driver.addresses?.[0] || null,
          },
        };
      }

      // Aggregate payout data
      const totalEarnings = payouts.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
      const totalFees = payouts.reduce((sum, p) => sum + (p.feeAmount || 0), 0);
      const netAmount = payouts.reduce((sum, p) => sum + (p.netAmount || 0), 0);
      
      const instantPayouts = payouts.filter(p => p.payoutType === 'instant').length;
      const weeklyPayouts = payouts.filter(p => p.payoutType === 'weekly').length;

      const payoutDates = payouts
        .map(p => p.completedAt)
        .filter((date): date is Date => date !== null)
        .sort((a, b) => a.getTime() - b.getTime());

      return {
        driverId,
        taxYear,
        totalEarnings,
        totalPayouts: payouts.length,
        instantPayouts,
        weeklyPayouts,
        totalFees,
        netAmount,
        payoutCount: payouts.length,
        firstPayoutDate: payoutDates[0] || null,
        lastPayoutDate: payoutDates[payoutDates.length - 1] || null,
        driverInfo: {
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          phone: driver.phone,
          address: driver.addresses?.[0] || null,
        },
      };
    } catch (error) {
      console.error(`Error calculating 1099 data for driver ${driverId}:`, error);
      throw error;
    }
  }

  /**
   * Get all drivers who need 1099 forms for a tax year
   * (earned at least $600 as per IRS threshold)
   */
  static async getDriversRequiring1099(taxYear: number): Promise<TaxYear1099Data[]> {
    const IRS_THRESHOLD = 600; // $600 minimum for 1099-NEC

    try {
      // Get all drivers
      const allDrivers = await db
        .select()
        .from(users)
        .where(eq(users.isDriver, true))
        .execute();

      const driversRequiring1099: TaxYear1099Data[] = [];

      // Calculate earnings for each driver
      for (const driver of allDrivers) {
        const earnings = await this.calculateDriverAnnualEarnings(driver.id, taxYear);
        
        // Only include drivers who meet the IRS threshold
        if (earnings && earnings.totalEarnings >= IRS_THRESHOLD) {
          driversRequiring1099.push(earnings);
        }
      }

      // Sort by total earnings (highest first)
      driversRequiring1099.sort((a, b) => b.totalEarnings - a.totalEarnings);

      return driversRequiring1099;
    } catch (error) {
      console.error(`Error getting drivers requiring 1099 for ${taxYear}:`, error);
      throw error;
    }
  }

  /**
   * Check if a 1099 has already been generated for a driver/year
   */
  static async has1099BeenGenerated(driverId: number, taxYear: number): Promise<boolean> {
    try {
      const payouts = await db
        .select()
        .from(driverPayouts)
        .where(
          and(
            eq(driverPayouts.driverId, driverId),
            eq(driverPayouts.taxYear, taxYear),
            eq(driverPayouts.form1099Generated, true)
          )
        )
        .limit(1)
        .execute();

      return payouts.length > 0;
    } catch (error) {
      console.error(`Error checking 1099 generation status:`, error);
      return false;
    }
  }

  /**
   * Mark all payouts for a driver/year as having 1099 generated
   */
  static async mark1099Generated(
    driverId: number,
    taxYear: number,
    pdfUrl: string
  ): Promise<void> {
    try {
      const yearStart = new Date(taxYear, 0, 1);
      const yearEnd = new Date(taxYear, 11, 31, 23, 59, 59);

      await db
        .update(driverPayouts)
        .set({
          form1099Generated: true,
          form1099Url: pdfUrl,
        })
        .where(
          and(
            eq(driverPayouts.driverId, driverId),
            eq(driverPayouts.status, 'completed'),
            gte(driverPayouts.completedAt, yearStart),
            lte(driverPayouts.completedAt, yearEnd)
          )
        )
        .execute();

      console.log(`✅ Marked 1099 as generated for driver ${driverId}, year ${taxYear}`);
    } catch (error) {
      console.error(`Error marking 1099 as generated:`, error);
      throw error;
    }
  }

  /**
   * Get summary statistics for a tax year
   */
  static async getTaxYearSummary(taxYear: number): Promise<{
    totalDrivers: number;
    driversEligible: number;
    totalEarningsPaid: number;
    formsGenerated: number;
    formsPending: number;
  }> {
    try {
      const driversData = await this.getDriversRequiring1099(taxYear);
      
      const totalDrivers = driversData.length;
      const driversEligible = driversData.length;
      const totalEarningsPaid = driversData.reduce((sum, d) => sum + d.totalEarnings, 0);

      let formsGenerated = 0;
      for (const driverData of driversData) {
        const hasGenerated = await this.has1099BeenGenerated(driverData.driverId, taxYear);
        if (hasGenerated) {
          formsGenerated++;
        }
      }

      return {
        totalDrivers,
        driversEligible,
        totalEarningsPaid,
        formsGenerated,
        formsPending: driversEligible - formsGenerated,
      };
    } catch (error) {
      console.error(`Error getting tax year summary:`, error);
      throw error;
    }
  }
}
