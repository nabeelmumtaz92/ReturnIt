import { useMemo, useState } from 'react';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Phone, ArrowLeft, Navigation, Package, Star } from "lucide-react";
import { calculatePaymentWithValue, getItemSizeByValue } from "@shared/paymentCalculator";

const MOCK_JOBS = {
  H2K9QZ: {
    id: 'H2K9QZ',
    customer: { name: 'Jenny Park', phone: '(555) 012-3456' },
    pickup: '123 Main St, St. Louis, MO',
    retailer: 'Target, 1235 Hampton Ave, St. Louis, MO',
    miles: 5.2,
    minutes: 14,
    itemValue: 89.99,
    numberOfItems: 1,
    rush: false,
    notes: 'Leave at front desk if line is long.',
  },
  M8P4TR: {
    id: 'M8P4TR',
    customer: { name: 'Mason Lee', phone: '(555) 222-0099' },
    pickup: '742 Evergreen Terrace, St. Louis, MO',
    retailer: 'Walmart, 201 Highland Blvd, St. Louis, MO',
    miles: 7.8,
    minutes: 20,
    itemValue: 156.50,
    numberOfItems: 2,
    rush: true,
    notes: 'Handle box upright. Return for refund, not exchange.',
  },
};

interface StatusBadgeProps {
  label: string;
  active?: boolean;
}

function StatusBadge({ label, active }: StatusBadgeProps) {
  return (
    <Badge 
      variant={active ? "default" : "secondary"}
      className={active ? "bg-amber-800 text-white" : "bg-amber-100 text-amber-800"}
    >
      {label}
    </Badge>
  );
}

export default function DriverJob() {
  const params = useParams();
  const jobId = params.id || 'H2K9QZ';
  const [status, setStatus] = useState('assigned'); // 'assigned' -> 'picked_up' -> 'dropped_off' -> 'completed'
  
  const job = MOCK_JOBS[jobId as keyof typeof MOCK_JOBS] || MOCK_JOBS.H2K9QZ;

  const fareCalculation = useMemo(() => {
    const paymentRouteInfo = {
      distance: job.miles,
      estimatedTime: job.minutes / 60, // Convert minutes to hours for calculation
    };

    return calculatePaymentWithValue(
      paymentRouteInfo,
      job.itemValue,
      job.numberOfItems,
      job.rush,
      0 // tip
    );
  }, [job]);

  const detectedSize = useMemo(() => getItemSizeByValue(job.itemValue), [job.itemValue]);

  const mapsQuery = useMemo(() => {
    const origin = encodeURIComponent(job.pickup);
    const dest = encodeURIComponent(job.retailer);
    return {
      google: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`,
      embed: `https://www.google.com/maps?q=${dest}&output=embed`
    };
  }, [job]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/driver-portal">
                <Button variant="ghost" size="sm" className="text-amber-800">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-amber-900">Job #{job.id}</h1>
                <p className="text-sm text-amber-700">{job.retailer.split(',')[0]}</p>
              </div>
            </div>
            <StatusBadge 
              label={status.replace('_', ' ').toUpperCase()} 
              active 
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Earnings Summary */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-900 flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Your Earnings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-emerald-800">
                  ${fareCalculation.driverTotalEarning.toFixed(2)}
                </div>
                <div className="text-sm text-emerald-600 font-medium">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-800">{job.miles.toFixed(1)} mi</div>
                <div className="text-sm text-amber-600">Distance</div>
                <div className="text-xs text-green-600 mt-1">+${fareCalculation.driverDistancePay.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-800">{job.minutes} min</div>
                <div className="text-sm text-amber-600">Time</div>
                <div className="text-xs text-green-600 mt-1">+${fareCalculation.driverTimePay.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-800">Size {detectedSize}</div>
                <div className="text-sm text-amber-600">Category</div>
                <div className="text-xs text-green-600 mt-1">
                  +${fareCalculation.driverSizeBonus.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge label={`${job.numberOfItems} item${job.numberOfItems > 1 ? 's' : ''}`} />
              <StatusBadge label={job.rush ? 'Rush Order' : 'Standard'} />
              <StatusBadge label={`Customer pays $${fareCalculation.totalPrice.toFixed(2)}`} />
              <StatusBadge label="Base: $3.00" />
            </div>
          </CardContent>
        </Card>

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Addresses & Customer */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Job Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Pickup Address</h3>
                <p className="text-sm text-amber-700">{job.pickup}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Drop-off (Retailer)</h3>
                <p className="text-sm text-amber-700">{job.retailer}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Customer</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-amber-700">{job.customer.name}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-amber-800 border-amber-300"
                    asChild
                  >
                    <a href={`tel:${job.customer.phone}`}>
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-amber-600">{job.customer.phone}</p>
              </div>

              {job.notes && (
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Special Instructions</h3>
                  <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    {job.notes}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  asChild
                >
                  <a 
                    href={mapsQuery.google} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Open in Google Maps
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map Preview */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">Route Preview</CardTitle>
              <CardDescription>
                Embedded map for quick reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border border-amber-200">
                <iframe
                  title="Route Map"
                  src={mapsQuery.embed}
                  className="w-full h-64"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="text-xs text-amber-600 mt-2">
                Tap "Open in Google Maps" above for turn-by-turn navigation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Update Actions */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Update Job Status</span>
            </CardTitle>
            <CardDescription>
              Track your progress through the delivery workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {status === 'assigned' && (
                <Button 
                  onClick={() => setStatus('picked_up')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Mark as Picked Up
                </Button>
              )}
              
              {status === 'picked_up' && (
                <Button 
                  onClick={() => setStatus('dropped_off')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Mark as Dropped Off
                </Button>
              )}
              
              {status === 'dropped_off' && (
                <Button 
                  onClick={() => setStatus('completed')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Complete & Submit
                </Button>
              )}
              
              {status === 'completed' && (
                <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <Star className="h-5 w-5" />
                  <span className="font-semibold">Job completed! Earnings processing...</span>
                </div>
              )}
            </div>

            {status !== 'completed' && (
              <div className="mt-3 text-sm text-amber-600">
                <p>Current status: <span className="font-semibold capitalize">{status.replace('_', ' ')}</span></p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}