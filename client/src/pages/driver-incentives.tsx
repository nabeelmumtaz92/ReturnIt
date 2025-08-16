import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Link } from 'wouter';
import { AdminNavigation } from '@/components/AdminNavigation';
import { 
  Trophy, Star, DollarSign, TrendingUp, Gift, Target, 
  Calendar, Users, Award, Zap, Clock, MapPin, Package,
  Plus, Edit, Trash2, Eye
} from 'lucide-react';

interface Incentive {
  id: string;
  name: string;
  type: 'bonus' | 'multiplier' | 'tier' | 'challenge';
  status: 'active' | 'inactive' | 'scheduled';
  description: string;
  requirements: string;
  reward: string;
  startDate: Date;
  endDate?: Date;
  participants: number;
  completions: number;
  totalPayout: number;
}

interface Driver {
  id: number;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  completedDeliveries: number;
  rating: number;
  totalEarnings: number;
  incentivesEarned: number;
  currentChallenges: string[];
}

export default function DriverIncentives() {
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [incentives] = useState<Incentive[]>([
    {
      id: 'INC001',
      name: 'Peak Hour Champion',
      type: 'bonus',
      status: 'active',
      description: 'Extra $3 bonus for deliveries completed during peak hours (5-7 PM)',
      requirements: 'Complete deliveries between 5:00 PM - 7:00 PM weekdays',
      reward: '+$3.00 per delivery',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      participants: 18,
      completions: 142,
      totalPayout: 426.00
    },
    {
      id: 'INC002',
      name: 'Weekend Warrior',
      type: 'multiplier',
      status: 'active',
      description: '1.5x earnings multiplier for weekend deliveries',
      requirements: 'Complete deliveries on Saturday or Sunday',
      reward: '1.5x base earnings',
      startDate: new Date('2024-01-01'),
      participants: 23,
      completions: 89,
      totalPayout: 267.75
    },
    {
      id: 'INC003',
      name: 'December Challenge',
      type: 'challenge',
      status: 'active',
      description: 'Complete 50 deliveries in December to earn $100 bonus',
      requirements: 'Complete 50 deliveries between Dec 1-31',
      reward: '$100 bonus',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-31'),
      participants: 15,
      completions: 3,
      totalPayout: 300.00
    },
    {
      id: 'INC004',
      name: 'Rating Excellence',
      type: 'tier',
      status: 'active',
      description: 'Maintain 4.8+ rating to access premium delivery slots',
      requirements: 'Maintain customer rating of 4.8 or higher',
      reward: 'Access to premium time slots + 10% bonus',
      startDate: new Date('2024-01-01'),
      participants: 12,
      completions: 12,
      totalPayout: 180.50
    },
    {
      id: 'INC005',
      name: 'New Year Sprint',
      type: 'challenge',
      status: 'scheduled',
      description: 'First week of January delivery challenge',
      requirements: 'Complete 20 deliveries in first week of January',
      reward: '$50 bonus + premium tier access',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-07'),
      participants: 0,
      completions: 0,
      totalPayout: 0
    }
  ]);

  const [drivers] = useState<Driver[]>([
    {
      id: 23,
      name: 'Mike Johnson',
      tier: 'gold',
      completedDeliveries: 156,
      rating: 4.9,
      totalEarnings: 2847.50,
      incentivesEarned: 485.25,
      currentChallenges: ['Peak Hour Champion', 'December Challenge']
    },
    {
      id: 15,
      name: 'Sarah Wilson',
      tier: 'platinum',
      completedDeliveries: 203,
      rating: 4.95,
      totalEarnings: 3542.75,
      incentivesEarned: 652.50,
      currentChallenges: ['Rating Excellence', 'Weekend Warrior']
    },
    {
      id: 7,
      name: 'David Chen',
      tier: 'silver',
      completedDeliveries: 89,
      rating: 4.7,
      totalEarnings: 1623.25,
      incentivesEarned: 234.75,
      currentChallenges: ['Peak Hour Champion']
    },
    {
      id: 31,
      name: 'Lisa Rodriguez',
      tier: 'bronze',
      completedDeliveries: 45,
      rating: 4.6,
      totalEarnings: 825.50,
      incentivesEarned: 98.25,
      currentChallenges: ['December Challenge']
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'scheduled': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bonus': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'multiplier': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'tier': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'challenge': return <Target className="h-4 w-4 text-purple-500" />;
      default: return <Gift className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-700 bg-amber-100';
      case 'silver': return 'text-gray-700 bg-gray-100';
      case 'gold': return 'text-yellow-700 bg-yellow-100';
      case 'platinum': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const activeIncentives = incentives.filter(i => i.status === 'active');
  const scheduledIncentives = incentives.filter(i => i.status === 'scheduled');
  const inactiveIncentives = incentives.filter(i => i.status === 'inactive');

  const totalPayout = incentives.reduce((sum, inc) => sum + inc.totalPayout, 0);
  const totalParticipants = new Set(incentives.flatMap(inc => Array(inc.participants).fill(0).map((_, i) => i))).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Driver Incentives</h1>
            <p className="text-amber-700">Performance-based rewards and challenges</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Incentive
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
                  <p className="text-sm font-medium text-gray-600">Active Incentives</p>
                  <p className="text-2xl font-bold text-gray-900">{activeIncentives.length}</p>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">${totalPayout.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg per Driver</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalParticipants > 0 ? (totalPayout / totalParticipants).toFixed(2) : '0.00'}
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active Programs</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="drivers">Driver Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Trophy className="h-5 w-5" />
                  Active Incentive Programs ({activeIncentives.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeIncentives.map((incentive) => (
                    <div key={incentive.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(incentive.type)}
                          <div>
                            <h4 className="font-semibold text-gray-900">{incentive.name}</h4>
                            <p className="text-sm text-gray-600">{incentive.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className={`${getStatusColor(incentive.status)} text-white`}>
                            {incentive.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Requirements</p>
                          <p className="text-sm font-medium text-gray-900">{incentive.requirements}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Reward</p>
                          <p className="text-sm font-medium text-green-600">{incentive.reward}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Participants</p>
                          <p className="text-sm font-medium text-gray-900">{incentive.participants} drivers</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Started: {incentive.startDate.toLocaleDateString()}
                          </span>
                          {incentive.endDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Ends: {incentive.endDate.toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Total paid: ${incentive.totalPayout.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Calendar className="h-5 w-5" />
                  Scheduled Incentives ({scheduledIncentives.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledIncentives.map((incentive) => (
                    <div key={incentive.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(incentive.type)}
                          <div>
                            <h4 className="font-semibold text-gray-900">{incentive.name}</h4>
                            <p className="text-sm text-gray-600">{incentive.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Scheduled
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Start Date</p>
                          <p className="text-sm font-medium text-gray-900">{incentive.startDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Reward</p>
                          <p className="text-sm font-medium text-green-600">{incentive.reward}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Starts in {Math.ceil((incentive.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                        </span>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Users className="h-5 w-5" />
                  Driver Performance & Incentives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.map((driver) => (
                    <div key={driver.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-amber-800">
                              {driver.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{driver.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getTierColor(driver.tier)}>
                                {driver.tier.toUpperCase()}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600">{driver.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">${driver.incentivesEarned.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Incentives earned</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Total Deliveries</p>
                          <p className="text-sm font-medium text-gray-900">{driver.completedDeliveries}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Earnings</p>
                          <p className="text-sm font-medium text-gray-900">${driver.totalEarnings.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Incentive %</p>
                          <p className="text-sm font-medium text-gray-900">
                            {((driver.incentivesEarned / driver.totalEarnings) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Active Challenges ({driver.currentChallenges.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {driver.currentChallenges.map((challenge, index) => (
                            <Badge key={index} variant="secondary">
                              {challenge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-900">Incentive Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incentives.filter(i => i.status === 'active').map((incentive) => (
                      <div key={incentive.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{incentive.name}</p>
                          <p className="text-sm text-gray-600">{incentive.completions} completions</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${incentive.totalPayout.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            ${(incentive.totalPayout / Math.max(incentive.completions, 1)).toFixed(2)} avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-900">ROI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Revenue Impact</h4>
                      <p className="text-sm text-green-700">
                        Incentive programs increased driver engagement by 34% and delivery volume by 28%
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Driver Retention</h4>
                      <p className="text-sm text-blue-700">
                        85% of drivers participating in incentive programs remain active after 3 months
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">Customer Satisfaction</h4>
                      <p className="text-sm text-yellow-700">
                        Average rating increased to 4.8/5 for drivers in tier-based programs
                      </p>
                    </div>
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