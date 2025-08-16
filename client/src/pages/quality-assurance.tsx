import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'wouter';
import { AdminNavigation } from '@/components/AdminNavigation';
import { 
  Camera, Shield, AlertTriangle, CheckCircle, FileImage, 
  Clock, DollarSign, User, Package, MapPin, Eye, Download,
  Upload, XCircle, RefreshCw, Star, MessageCircle
} from 'lucide-react';

interface QualityEvent {
  id: string;
  orderId: string;
  type: 'damage_report' | 'photo_verification' | 'insurance_claim' | 'dispute';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: 'customer' | 'driver' | 'admin';
  timestamp: Date;
  description: string;
  photos: string[];
  resolution?: string;
  compensation?: number;
  assignedTo?: string;
}

interface PhotoVerification {
  id: string;
  orderId: string;
  driverId: number;
  stage: 'pickup' | 'delivery';
  timestamp: Date;
  photos: Array<{
    url: string;
    type: 'package_condition' | 'location' | 'receipt' | 'signature';
    quality: 'good' | 'poor' | 'blurry';
    verified: boolean;
  }>;
  autoChecks: {
    timestamp: boolean;
    location: boolean;
    quality: boolean;
    count: boolean;
  };
}

export default function QualityAssurance() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [qualityEvents] = useState<QualityEvent[]>([
    {
      id: 'QE001',
      orderId: 'RTN12345',
      type: 'damage_report',
      status: 'under_review',
      severity: 'high',
      reportedBy: 'customer',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      description: 'Package arrived with visible damage to corner, contents appear intact but box is crushed.',
      photos: ['/api/uploads/damage_1.jpg', '/api/uploads/damage_2.jpg'],
      assignedTo: 'Sarah Johnson'
    },
    {
      id: 'QE002',
      orderId: 'RTN12344',
      type: 'photo_verification',
      status: 'approved',
      severity: 'low',
      reportedBy: 'admin',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      description: 'Photo quality verification passed all automated checks.',
      photos: ['/api/uploads/pickup_1.jpg']
    },
    {
      id: 'QE003',
      orderId: 'RTN12343',
      type: 'insurance_claim',
      status: 'pending',
      severity: 'critical',
      reportedBy: 'customer',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      description: 'High-value electronics damaged during transport. Customer requesting full replacement.',
      photos: ['/api/uploads/electronics_damage.jpg'],
      compensation: 450.00,
      assignedTo: 'Mike Chen'
    },
    {
      id: 'QE004',
      orderId: 'RTN12342',
      type: 'dispute',
      status: 'resolved',
      severity: 'medium',
      reportedBy: 'driver',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      description: 'Customer claimed package was not picked up, but GPS and photos confirm successful pickup.',
      photos: ['/api/uploads/pickup_confirmation.jpg'],
      resolution: 'Dispute resolved in favor of driver. GPS data and photo evidence confirmed pickup.'
    }
  ]);

  const [photoVerifications] = useState<PhotoVerification[]>([
    {
      id: 'PV001',
      orderId: 'RTN12345',
      driverId: 23,
      stage: 'pickup',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      photos: [
        {
          url: '/api/uploads/pickup_condition_1.jpg',
          type: 'package_condition',
          quality: 'good',
          verified: true
        },
        {
          url: '/api/uploads/pickup_location_1.jpg',
          type: 'location',
          quality: 'good',
          verified: true
        }
      ],
      autoChecks: {
        timestamp: true,
        location: true,
        quality: true,
        count: true
      }
    },
    {
      id: 'PV002',
      orderId: 'RTN12344',
      driverId: 15,
      stage: 'delivery',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      photos: [
        {
          url: '/api/uploads/delivery_complete_1.jpg',
          type: 'package_condition',
          quality: 'poor',
          verified: false
        }
      ],
      autoChecks: {
        timestamp: true,
        location: true,
        quality: false,
        count: false
      }
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'under_review': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'damage_report': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'photo_verification': return <Camera className="h-4 w-4 text-blue-500" />;
      case 'insurance_claim': return <Shield className="h-4 w-4 text-red-500" />;
      case 'dispute': return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredEvents = qualityEvents.filter(event => {
    if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && event.status !== selectedStatus) return false;
    return true;
  });

  const stats = {
    totalEvents: qualityEvents.length,
    pending: qualityEvents.filter(e => e.status === 'pending').length,
    resolved: qualityEvents.filter(e => e.status === 'resolved').length,
    successRate: Math.round((qualityEvents.filter(e => e.status === 'approved' || e.status === 'resolved').length / qualityEvents.length) * 100)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Quality Assurance</h1>
            <p className="text-amber-700">Photo verification and damage claim management</p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Upload className="h-4 w-4 mr-2" />
              Manual Review
            </Button>
            <Link href="/admin-dashboard">
              <Button variant="outline" className="border-amber-300 text-amber-700">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                </div>
                <FileImage className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                </div>
                <Star className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Quality Events</TabsTrigger>
            <TabsTrigger value="photos">Photo Verification</TabsTrigger>
            <TabsTrigger value="claims">Insurance Claims</TabsTrigger>
            <TabsTrigger value="settings">QA Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                  <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Events List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Shield className="h-5 w-5" />
                  Quality Events ({filteredEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(event.type)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {event.type.replace('_', ' ').toUpperCase()} - {event.orderId}
                              </h4>
                              <Badge variant="outline" className={`${getSeverityColor(event.severity)} text-white`}>
                                {event.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{event.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(event.status)}
                          <Badge variant={
                            event.status === 'resolved' || event.status === 'approved' ? 'default' :
                            event.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {event.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {event.photos.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">Evidence Photos ({event.photos.length})</p>
                          <div className="flex gap-2">
                            {event.photos.map((photo, index) => (
                              <div key={index} className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                                <Camera className="h-6 w-6 text-gray-400" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>Reported by: {event.reportedBy}</span>
                          <span>{event.timestamp.toLocaleString()}</span>
                          {event.assignedTo && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Assigned to {event.assignedTo}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {event.compensation && (
                            <Badge variant="secondary">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ${event.compensation}
                            </Badge>
                          )}
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </div>
                      </div>

                      {event.resolution && (
                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                          <p className="text-sm text-green-800">
                            <strong>Resolution:</strong> {event.resolution}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Camera className="h-5 w-5" />
                  Photo Verification Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {photoVerifications.map((verification) => (
                    <div key={verification.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {verification.orderId} - {verification.stage.toUpperCase()}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Driver #{verification.driverId} • {verification.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={
                          Object.values(verification.autoChecks).every(check => check) ? 'default' : 'destructive'
                        }>
                          {Object.values(verification.autoChecks).every(check => check) ? 'All Checks Passed' : 'Failed Checks'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${verification.autoChecks.timestamp ? 'text-green-500' : 'text-red-500'}`} />
                          <span className="text-sm">Timestamp</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${verification.autoChecks.location ? 'text-green-500' : 'text-red-500'}`} />
                          <span className="text-sm">Location</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${verification.autoChecks.quality ? 'text-green-500' : 'text-red-500'}`} />
                          <span className="text-sm">Quality</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${verification.autoChecks.count ? 'text-green-500' : 'text-red-500'}`} />
                          <span className="text-sm">Count</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-2">Photos ({verification.photos.length})</p>
                        <div className="flex gap-2">
                          {verification.photos.map((photo, index) => (
                            <div key={index} className="relative">
                              <div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center">
                                <Camera className="h-8 w-8 text-gray-400" />
                              </div>
                              <div className="absolute -top-1 -right-1">
                                {photo.verified ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 bg-white rounded-full" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500 bg-white rounded-full" />
                                )}
                              </div>
                              <p className="text-xs text-center mt-1">{photo.type.replace('_', ' ')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Shield className="h-5 w-5" />
                  Insurance Claims Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qualityEvents.filter(e => e.type === 'insurance_claim').map((claim) => (
                    <div key={claim.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">Claim #{claim.id}</h4>
                          <p className="text-sm text-gray-600">{claim.orderId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">${claim.compensation}</p>
                          <Badge variant="destructive">{claim.status}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{claim.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Reported: {claim.timestamp.toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-green-300 text-green-700">
                            Approve Claim
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                            Deny Claim
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-900">Photo Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Photo Quality
                    </label>
                    <Select defaultValue="good">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Quality</SelectItem>
                        <SelectItem value="good">Good Quality</SelectItem>
                        <SelectItem value="high">High Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Photos Per Stage
                    </label>
                    <Select defaultValue="2">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 photo minimum</SelectItem>
                        <SelectItem value="2">2 photos minimum</SelectItem>
                        <SelectItem value="3">3 photos minimum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPS Accuracy Requirement
                    </label>
                    <Select defaultValue="10">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">±5 meters</SelectItem>
                        <SelectItem value="10">±10 meters</SelectItem>
                        <SelectItem value="20">±20 meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-900">Claim Processing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-Approve Claims Under
                    </label>
                    <Select defaultValue="50">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">$25</SelectItem>
                        <SelectItem value="50">$50</SelectItem>
                        <SelectItem value="100">$100</SelectItem>
                        <SelectItem value="never">Never auto-approve</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Timeout (hours)
                    </label>
                    <Select defaultValue="48">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">48 hours</SelectItem>
                        <SelectItem value="72">72 hours</SelectItem>
                        <SelectItem value="168">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Resolution Template
                    </label>
                    <Textarea 
                      placeholder="Enter default resolution message template..."
                      rows={3}
                      defaultValue="After careful review of the evidence provided, we have determined..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}