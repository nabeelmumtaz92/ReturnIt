import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, DollarSign, Star, Navigation, Camera, Phone, CheckCircle } from "lucide-react";

export default function MobileDriver() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [activeJobs, setActiveJobs] = useState([
    {
      id: '1',
      customer: 'Sarah Johnson',
      pickupAddress: '123 Oak Street, St. Louis, MO',
      dropoffLocation: 'UPS Store - Clayton',
      amount: 15.75,
      distance: '2.3 miles',
      estimatedTime: '15 min',
      priority: 'high',
      status: 'accepted'
    },
    {
      id: '2',
      customer: 'Mike Chen',
      pickupAddress: '456 Pine Avenue, St. Louis, MO',
      dropoffLocation: 'FedEx Store - Downtown',
      amount: 12.50,
      distance: '1.8 miles',
      estimatedTime: '12 min',
      priority: 'normal',
      status: 'available'
    }
  ]);

  const [todayEarnings] = useState(127.45);
  const [weeklyEarnings] = useState(847.22);
  const [completedJobs] = useState(8);
  const [driverRating] = useState(4.8);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCurrentLocation(position),
        (error) => console.log('Location access denied')
      );
    }
  }, []);

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const acceptJob = (jobId: string) => {
    setActiveJobs(jobs => 
      jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'accepted' }
          : job
      )
    );
  };

  const startNavigation = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
  };

  const callCustomer = (jobId: string) => {
    // In a real app, this would have the customer's phone number
    alert('Calling customer...');
  };

  const markCompleted = (jobId: string) => {
    setActiveJobs(jobs => jobs.filter(job => job.id !== jobId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Driver Portal</h1>
            <p className="text-sm text-gray-600">ReturnIt Delivery</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Button
              size="sm"
              onClick={toggleOnlineStatus}
              className={isOnline ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {isOnline ? "Go Offline" : "Go Online"}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-lg font-bold">${todayEarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Jobs</p>
                <p className="text-lg font-bold">{completedJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-lg font-bold">${weeklyEarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-lg font-bold">{driverRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Jobs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Available Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{job.customer}</h3>
                  <Badge variant={job.priority === 'high' ? "destructive" : "secondary"} className="text-xs">
                    {job.priority}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${job.amount}</p>
                  <p className="text-xs text-gray-500">{job.distance}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{job.pickupAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-gray-500" />
                  <span>{job.dropoffLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Est. {job.estimatedTime}</span>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="flex gap-2">
                {job.status === 'available' ? (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => acceptJob(job.id)}
                  >
                    Accept Job
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => startNavigation(job.pickupAddress)}
                      className="flex items-center gap-1"
                    >
                      <Navigation className="h-4 w-4" />
                      Navigate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => callCustomer(job.id)}
                      className="flex items-center gap-1"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => markCompleted(job.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Take Photo
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            View Earnings
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Rate Customer
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}