import { useAuth } from "@/hooks/useAuth-simple";
import { Screen } from '@/components/screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Star, Trophy, Users, Zap, Crown, Award, TrendingUp } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import Footer from '@/components/Footer';

export default function LoyaltyDashboard() {
  const { user, isAuthenticated } = useAuth();

  const { data: loyaltyData } = useQuery({
    queryKey: ['/api/loyalty/profile'],
    enabled: isAuthenticated,
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/loyalty/transactions'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <Screen className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign in to access rewards</h1>
          <Button className="bg-primary hover:bg-primary/90">Sign In</Button>
        </div>
      </Screen>
    );
  }

  const tierColors = {
    bronze: "bg-amber-600",
    silver: "bg-gray-500",
    gold: "bg-yellow-500", 
    platinum: "bg-purple-600"
  };

  const tierIcons = {
    bronze: Award,
    silver: Star,
    gold: Trophy,
    platinum: Crown
  };

  const currentTier = loyaltyData?.membershipTier || 'bronze';
  const TierIcon = tierIcons[currentTier];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-img-enhanced"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/8199189/pexels-photo-8199189.jpeg?auto=compress&cs=tinysrgb&w=5120&h=3413&dpr=3&fit=crop&crop=center&q=100)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="absolute inset-0 bg-white/85"></div>
      
      {/* Navigation Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-border sticky top-0 z-50 relative shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <div className="text-2xl font-bold text-foreground cursor-pointer hover:opacity-80 transition-opacity">
                  ReturnIt
                </div>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Returnly Rewards</h1>
            </div>
            <div className="flex space-x-3">
              <Link href="/book-pickup">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Book Pickup
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">Your Loyalty Dashboard</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Earn points with every return and unlock exclusive benefits as you climb our membership tiers</p>
          </div>

          {/* Loyalty Status Card */}
          <Card className="mb-12 border-border bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-6">
                <div className={`${tierColors[currentTier]} p-6 rounded-full mr-6 shadow-lg`}>
                  <TierIcon className="h-12 w-12 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl text-foreground capitalize font-bold">{currentTier} Member</CardTitle>
                  <p className="text-muted-foreground text-lg">{loyaltyData?.totalPoints || 0} Total Points Earned</p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-foreground">{loyaltyData?.availablePoints || 0}</div>
                  <div className="text-sm text-muted-foreground">Available Points</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">${loyaltyData?.lifetimeSpent || 0}</div>
                  <div className="text-sm text-muted-foreground">Lifetime Savings</div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Progress to Next Tier</span>
                  <span className="text-sm text-primary">75% Complete</span>
                </div>
                <Progress value={75} className="h-3" />
                <p className="text-xs text-primary mt-1">125 more points to reach Silver status</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-accent rounded-lg">
                  <Gift className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <div className="font-semibold text-foreground">Free Delivery</div>
                  <div className="text-sm text-muted-foreground">On orders over $50</div>
                </div>
                <div className="text-center p-4 bg-accent rounded-lg">
                  <Zap className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <div className="font-semibold text-foreground">Priority Support</div>
                  <div className="text-sm text-muted-foreground">24/7 dedicated help</div>
                </div>
                <div className="text-center p-4 bg-accent rounded-lg">
                  <TrendingUp className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <div className="font-semibold text-foreground">Bonus Points</div>
                  <div className="text-sm text-muted-foreground">2x on referrals</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="rewards" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rewards">Available Rewards</TabsTrigger>
              <TabsTrigger value="history">Point History</TabsTrigger>
              <TabsTrigger value="referrals">Referral Program</TabsTrigger>
            </TabsList>

            <TabsContent value="rewards" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">$5 Return Credit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">500 Points</Badge>
                      <Gift className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Get $5 off your next return service</p>
                    <Button className="w-full bg-primary hover:bg-primary/90">Redeem</Button>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Free Priority Pickup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">750 Points</Badge>
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Skip the line with priority scheduling</p>
                    <Button className="w-full bg-primary hover:bg-primary/90">Redeem</Button>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">$15 Return Credit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">1,200 Points</Badge>
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Save big on multiple returns</p>
                    <Button className="w-full bg-primary hover:bg-primary/90">Redeem</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Point Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions?.slice(0, 10).map((transaction: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div>
                          <div className="font-medium text-foreground">{transaction.description}</div>
                          <div className="text-sm text-primary">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`font-bold ${transaction.pointsAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.pointsAmount > 0 ? '+' : ''}{transaction.pointsAmount} pts
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-primary">
                        <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Start making returns to earn your first points!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrals" className="mt-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Refer Friends & Earn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Share the Love</h3>
                    <p className="text-muted-foreground">Give friends $10 off their first return, get 500 points when they complete it</p>
                  </div>
                  
                  <div className="bg-accent p-4 rounded-lg mb-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
                    <p className="text-2xl font-bold text-foreground font-mono">{loyaltyData?.referralCode || 'RETURN50'}</p>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90 mb-4">
                    <Users className="h-4 w-4 mr-2" />
                    Share Referral Code
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-primary">
                      You've earned <span className="font-bold">0 points</span> from referrals this month
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}