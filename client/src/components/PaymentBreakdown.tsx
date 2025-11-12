import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { calculatePaymentWithValue, getItemSizeByValue, RouteInfo } from "@shared/paymentCalculator";

interface PaymentBreakdownProps {
  itemValue: number;
  numberOfItems: number;
  routeInfo?: RouteInfo;
  isRush?: boolean;
  tip?: number;
  taxAmount?: number;
  taxRate?: number;
  taxJurisdictionName?: string;
  isDonation?: boolean;
}

export function PaymentBreakdown({ 
  itemValue, 
  numberOfItems = 1, 
  routeInfo,
  isRush = false,
  tip = 0,
  taxAmount = 0,
  taxRate = 0,
  taxJurisdictionName,
  isDonation = false
}: PaymentBreakdownProps) {
  // Use mock route info if not provided for static pricing
  const defaultRouteInfo: RouteInfo = {
    distance: 0,
    estimatedTime: 0
  };

  const itemSize = getItemSizeByValue(itemValue);
  const breakdown = calculatePaymentWithValue(
    routeInfo || defaultRouteInfo,
    itemValue,
    numberOfItems,
    isRush,
    tip
  );

  // Calculate grand total including tax
  const grandTotal = breakdown.totalPrice + taxAmount;
  const customerNetCost = grandTotal - itemValue;

  return (
    <div className="space-y-4">
      {/* Customer Breakdown */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            💳 Customer Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Item refund received:</span>
              <span className="float-right font-medium text-green-600">+${itemValue.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Service fee (before tax):</span>
              <span className="float-right font-medium text-red-600">-${breakdown.totalPrice.toFixed(2)}</span>
            </div>
            {taxAmount && taxAmount > 0.01 && (
              <div>
                <span className="text-gray-600">Tax:</span>
                <span className="float-right font-medium text-red-600">-${taxAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator className="col-span-2" />
            <div className="col-span-2">
              <span className="font-semibold text-gray-800">Net customer cost:</span>
              <span className={`float-right font-bold text-lg ${customerNetCost >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {customerNetCost >= 0 ? '-' : '+'}${Math.abs(customerNetCost).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            {customerNetCost >= 0 
              ? `Customer pays $${customerNetCost.toFixed(2)} out of pocket for return service`
              : `Customer saves $${Math.abs(customerNetCost).toFixed(2)} after receiving refund`
            }
          </div>
        </CardContent>
      </Card>

      {/* Company Revenue Breakdown */}
      <Card className="border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
            🏢 Company Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Service fee (15%):</span>
              <span className="font-medium">${breakdown.companyServiceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Base fee share:</span>
              <span className="font-medium">${breakdown.companyBaseFeeShare.toFixed(2)}</span>
            </div>
            {breakdown.companyDistanceFeeShare > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Distance fee share:</span>
                <span className="font-medium">${breakdown.companyDistanceFeeShare.toFixed(2)}</span>
              </div>
            )}
            {breakdown.companyTimeFeeShare > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Time fee share:</span>
                <span className="font-medium">${breakdown.companyTimeFeeShare.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-amber-800">
              <span>Total company revenue:</span>
              <span className="text-lg">${breakdown.companyTotalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Earnings Breakdown */}
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-green-800 flex items-center gap-2">
            🚗 Driver Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base pay:</span>
              <span className="font-medium">${breakdown.driverBasePay.toFixed(2)}</span>
            </div>
            {breakdown.driverDistancePay > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Distance pay ($0.35/mile):</span>
                <span className="font-medium">${breakdown.driverDistancePay.toFixed(2)}</span>
              </div>
            )}
            {breakdown.driverTimePay > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Time pay ($8/hour):</span>
                <span className="font-medium">${breakdown.driverTimePay.toFixed(2)}</span>
              </div>
            )}
            {breakdown.driverSizeBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Size handling bonus:</span>
                <span className="font-medium">${breakdown.driverSizeBonus.toFixed(2)}</span>
              </div>
            )}
            {breakdown.driverTip > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tips (100%):</span>
                <span className="font-medium">${breakdown.driverTip.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-green-800">
              <span>Total driver earnings:</span>
              <span className="text-lg">${breakdown.driverTotalEarning.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Fee Breakdown */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            📊 Detailed Service Charges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base service fee:</span>
              <span className="font-medium">${breakdown.basePrice.toFixed(2)}</span>
            </div>
            {breakdown.sizeUpcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Size upcharge ({itemSize} item):</span>
                <span className="font-medium">${breakdown.sizeUpcharge.toFixed(2)}</span>
              </div>
            )}
            {breakdown.multiItemFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Additional items:</span>
                <span className="font-medium">${breakdown.multiItemFee.toFixed(2)}</span>
              </div>
            )}
            {breakdown.smallOrderFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Small order fee:</span>
                <span className="font-medium">${breakdown.smallOrderFee.toFixed(2)}</span>
              </div>
            )}
            {breakdown.distanceFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Distance fee:</span>
                <span className="font-medium">${breakdown.distanceFee.toFixed(2)}</span>
              </div>
            )}
            {breakdown.timeFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Time fee:</span>
                <span className="font-medium">${breakdown.timeFee.toFixed(2)}</span>
              </div>
            )}
            {breakdown.rushFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Rush delivery:</span>
                <span className="font-medium">${breakdown.rushFee.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${breakdown.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service fee (15%):</span>
              <span className="font-medium">${breakdown.serviceFee.toFixed(2)}</span>
            </div>
            {taxAmount && taxAmount > 0.01 ? (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Tax{taxRate ? ` (${(taxRate * 100).toFixed(2)}%)` : ''}{taxJurisdictionName ? ` - ${taxJurisdictionName}` : ''}:
                </span>
                <span className="font-medium">${taxAmount.toFixed(2)}</span>
              </div>
            ) : isDonation ? (
              <div className="flex justify-between text-green-600">
                <span>Tax (Donation - Tax Exempt):</span>
                <span className="font-medium">$0.00</span>
              </div>
            ) : null}
            {breakdown.tip > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tip:</span>
                <span className="font-medium">${breakdown.tip.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-gray-800">
              <span>Grand Total (incl. tax):</span>
              <span className="text-lg">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}