// Demo payment data generator for administrative tax tracking
export function generateSamplePaymentRecords() {
  const records = [];
  const drivers = [
    { id: 1, name: 'Nabeel Mumtaz' },
    { id: 3, name: 'Demo Driver' },
    { id: 4, name: 'Sarah Johnson' },
    { id: 5, name: 'Mike Chen' }
  ];

  // Generate payment records for the last 3 months
  const now = new Date();
  for (let i = 0; i < 45; i++) {
    const transactionDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const driver = drivers[Math.floor(Math.random() * drivers.length)];
    const distance = Math.random() * 15 + 2; // 2-17 miles
    const estimatedTime = Math.random() * 45 + 15; // 15-60 minutes
    const boxSize = ['Small', 'Medium', 'Large', 'XL'][Math.floor(Math.random() * 4)];
    
    // Calculate earnings using our payment structure
    const basePay = 3.00;
    const distancePay = distance * 0.35;
    const timePay = (estimatedTime / 60) * 8.00;
    const sizeBonus = boxSize === 'Large' ? 1.00 : boxSize === 'XL' ? 2.00 : 0;
    const tip = Math.random() * 5; // 0-5 tip
    const driverTotal = basePay + distancePay + timePay + sizeBonus + tip;
    
    // Company revenue calculation
    const serviceFee = 0.99;
    const distanceFee = distance * 0.15; // Company keeps portion of distance fee
    const timeFee = (estimatedTime / 60) * 2.00; // Company keeps portion of time fee
    const companyTotal = serviceFee + distanceFee + timeFee;
    
    // Customer payment
    const basePrice = 3.99;
    const surcharges = boxSize === 'Large' ? 2.00 : boxSize === 'XL' ? 4.00 : 0;
    const subtotal = basePrice + surcharges + distanceFee + timeFee + distancePay + timePay + sizeBonus;
    const taxes = subtotal * 0.0899; // Missouri St. Louis County rate
    const customerTotal = subtotal + taxes + tip;

    records.push({
      id: `PAY-${Date.now()}-${i.toString().padStart(3, '0')}`,
      orderId: `RTN-2024-${(i + 1).toString().padStart(3, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      transactionDate,
      driverEarnings: {
        basePay,
        distancePay,
        timePay,
        sizeBonus,
        tip,
        total: driverTotal
      },
      companyRevenue: {
        serviceFee,
        distanceFee,
        timeFee,
        total: companyTotal
      },
      customerPayment: {
        basePrice,
        surcharges,
        taxes,
        total: customerTotal
      },
      driverId: driver.id,
      driverName: driver.name,
      paymentMethod: ['stripe', 'paypal', 'apple_pay', 'google_pay'][Math.floor(Math.random() * 4)],
      status: 'completed',
      taxYear: transactionDate.getFullYear(),
      quarter: Math.ceil((transactionDate.getMonth() + 1) / 3)
    });
  }

  return records;
}

export function generatePaymentSummary(records: any[]) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyRecords = records.filter(r => {
    const recordDate = new Date(r.transactionDate);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });

  const yearlyRecords = records.filter(r => {
    const recordDate = new Date(r.transactionDate);
    return recordDate.getFullYear() === currentYear;
  });

  const totalDriverEarnings = monthlyRecords.reduce((sum, r) => sum + r.driverEarnings.total, 0);
  const totalCompanyRevenue = monthlyRecords.reduce((sum, r) => sum + r.companyRevenue.total, 0);
  const totalCustomerPayments = monthlyRecords.reduce((sum, r) => sum + r.customerPayment.total, 0);

  const quarterlyRevenue = [1, 2, 3, 4].map(quarter => {
    const quarterRecords = yearlyRecords.filter(r => r.quarter === quarter);
    return quarterRecords.reduce((sum, r) => sum + r.companyRevenue.total, 0);
  });

  const activeDrivers = new Set(yearlyRecords.map(r => r.driverId)).size;
  const driverEarningsMap = new Map();
  
  yearlyRecords.forEach(r => {
    const current = driverEarningsMap.get(r.driverId) || 0;
    driverEarningsMap.set(r.driverId, current + r.driverEarnings.total);
  });

  const driversRequiring1099 = Array.from(driverEarningsMap.values()).filter(earnings => earnings >= 600).length;

  return {
    totalDriverEarnings,
    totalCompanyRevenue,
    totalCustomerPayments,
    totalTransactions: monthlyRecords.length,
    monthlyDriverPayments: totalDriverEarnings,
    monthlyCompanyRevenue: totalCompanyRevenue,
    q1Revenue: quarterlyRevenue[0],
    q2Revenue: quarterlyRevenue[1],
    q3Revenue: quarterlyRevenue[2],
    q4Revenue: quarterlyRevenue[3],
    activeDriversCount: activeDrivers,
    totalDriverPayments: yearlyRecords.reduce((sum, r) => sum + r.driverEarnings.total, 0),
    driversRequiring1099
  };
}