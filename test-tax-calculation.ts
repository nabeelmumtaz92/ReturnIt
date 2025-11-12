import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
});

interface TaxTestCase {
  name: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  amount: number; // Amount in dollars
}

const testCases: TaxTestCase[] = [
  {
    name: "St. Louis County - Clayton",
    address: {
      line1: "7730 Carondelet Ave",
      city: "Clayton",
      state: "MO",
      postal_code: "63105",
      country: "US"
    },
    amount: 25.00
  },
  {
    name: "St. Louis County - Florissant",
    address: {
      line1: "1050 Dunn Rd",
      city: "Florissant",
      state: "MO",
      postal_code: "63031",
      country: "US"
    },
    amount: 25.00
  },
  {
    name: "Franklin County - Washington",
    address: {
      line1: "2103 Washington Crossing",
      city: "Washington",
      state: "MO",
      postal_code: "63090",
      country: "US"
    },
    amount: 25.00
  },
  {
    name: "St. Charles County - O'Fallon",
    address: {
      line1: "2295 Technology Dr",
      city: "O'Fallon",
      state: "MO",
      postal_code: "63368",
      country: "US"
    },
    amount: 25.00
  },
  {
    name: "Jefferson County - Arnold",
    address: {
      line1: "2225 Vogel Rd",
      city: "Arnold",
      state: "MO",
      postal_code: "63010",
      country: "US"
    },
    amount: 25.00
  }
];

async function testTaxCalculation(testCase: TaxTestCase) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${testCase.name}`);
  console.log(`Address: ${testCase.address.line1}, ${testCase.address.city}, ${testCase.address.state} ${testCase.address.postal_code}`);
  console.log(`Amount: $${testCase.amount.toFixed(2)}`);
  console.log(`${'='.repeat(80)}`);

  try {
    const calculation = await stripe.tax.calculations.create({
      currency: 'usd',
      line_items: [
        {
          amount: Math.round(testCase.amount * 100), // Convert to cents
          reference: 'delivery-fee',
        },
      ],
      customer_details: {
        address: testCase.address,
        address_source: 'shipping',
      },
    });

    const taxAmountInCents = calculation.tax_amount_exclusive;
    const taxAmount = taxAmountInCents / 100;
    const effectiveTaxRate = testCase.amount > 0 ? taxAmount / testCase.amount : 0;
    const grandTotal = testCase.amount + taxAmount;

    console.log(`\n📊 Tax Calculation Results:`);
    console.log(`   Taxable Amount: $${testCase.amount.toFixed(2)}`);
    console.log(`   Tax Amount: $${taxAmount.toFixed(2)}`);
    console.log(`   Effective Tax Rate: ${(effectiveTaxRate * 100).toFixed(2)}%`);
    console.log(`   Grand Total: $${grandTotal.toFixed(2)}`);

    if (calculation.tax_breakdown && calculation.tax_breakdown.length > 0) {
      console.log(`\n🗺️  Tax Breakdown (${calculation.tax_breakdown.length} jurisdictions):`);
      
      for (const breakdown of calculation.tax_breakdown) {
        const jurisdiction = (breakdown as any).jurisdiction;
        if (jurisdiction) {
          const level = jurisdiction.level || 'unknown';
          const name = jurisdiction.display_name || jurisdiction.name || 'Unknown';
          const state = jurisdiction.state || '';
          const rate = (breakdown as any).tax_rate_details?.percentage_decimal || 0;
          
          console.log(`   - ${level.toUpperCase()}: ${name}${state ? ', ' + state : ''} (${rate}%)`);
        }
      }

      // Extract jurisdiction name using same logic as TaxService
      let countyJurisdiction = null;
      let cityJurisdiction = null;
      let stateJurisdiction = null;
      
      for (const breakdown of calculation.tax_breakdown) {
        const jurisdiction = (breakdown as any).jurisdiction;
        if (!jurisdiction) continue;
        
        const level = jurisdiction.level?.toLowerCase();
        if (level === 'county') {
          countyJurisdiction = jurisdiction;
          break;
        } else if (level === 'city') {
          cityJurisdiction = jurisdiction;
        } else if (level === 'state') {
          stateJurisdiction = jurisdiction;
        }
      }
      
      const selectedJurisdiction = countyJurisdiction || cityJurisdiction || stateJurisdiction;
      if (selectedJurisdiction) {
        const name = (selectedJurisdiction as any).display_name || (selectedJurisdiction as any).name || '';
        const state = (selectedJurisdiction as any).state || testCase.address.state;
        const taxJurisdictionName = name ? `${name}, ${state}` : `${testCase.address.city}, ${testCase.address.state}`;
        console.log(`\n✅ Selected Jurisdiction (Preferred): ${taxJurisdictionName}`);
      }
    } else {
      console.log('\n⚠️  No tax breakdown data available');
    }

  } catch (error: any) {
    console.error(`\n❌ Error calculating tax for ${testCase.name}:`);
    console.error(`   ${error.message}`);
    if (error.raw) {
      console.error(`   Raw error:`, JSON.stringify(error.raw, null, 2));
    }
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting Tax Calculation Tests for Missouri Counties');
  console.log('This will test county-level tax rate distinctions using Stripe Tax API\n');

  for (const testCase of testCases) {
    await testTaxCalculation(testCase);
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ All tests completed!');
  console.log(`${'='.repeat(80)}\n`);
}

// Run tests
runAllTests().catch(console.error);
