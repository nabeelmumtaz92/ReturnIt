import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Car, Clock, DollarSign, MapPin, Package, Phone, Star, Truck, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  actionRequired?: boolean;
}

export default function DriverTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const tutorialSteps: TutorialStep[] = [
    {
      id: 0,
      title: "Welcome to ReturnIt!",
      description: "Your journey as a professional return driver begins here",
      icon: <Users className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <img 
              src="/logo-cardboard-deep.png" 
              alt="ReturnIt Logo" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-amber-900">Welcome to the ReturnIt Driver Team!</h3>
            <p className="text-amber-700 mt-2">Congratulations on joining St. Louis's premier return logistics service</p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">What You'll Learn:</h4>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                How to use the driver app and accept orders
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Payment structure and how you earn money
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Best practices for pickup and delivery
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Safety guidelines and customer service
              </li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Let's get you started with the essentials</p>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "How You Get Paid",
      description: "Understanding your earnings structure",
      icon: <DollarSign className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-amber-900">Your Earning Structure</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-700">Base Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">$3.00</div>
                <p className="text-xs text-green-600">Per completed pickup</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-700">Distance Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800">$0.35</div>
                <p className="text-xs text-blue-600">Per mile driven</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-purple-700">Time Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-800">$8.00</div>
                <p className="text-xs text-purple-600">Per hour of work</p>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-700">Size Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-orange-800">$1-2</div>
                <p className="text-xs text-orange-600">For large packages</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Example Earning:</h4>
            <p className="text-sm text-yellow-800">5-mile pickup taking 30 minutes with a medium package:</p>
            <div className="text-sm text-yellow-800 mt-2 space-y-1">
              <div>Base Pay: $3.00</div>
              <div>Distance: 5 miles × $0.35 = $1.75</div>
              <div>Time: 0.5 hours × $8.00 = $4.00</div>
              <div className="font-semibold border-t pt-1">Total: $8.75 + any tips!</div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Tips are 100% yours!</strong> Customers can add tips which you keep entirely.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Using the Driver App",
      description: "How to find and accept orders",
      icon: <Truck className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-amber-900">Driver App Basics</h3>
          
          <div className="space-y-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  Going Online/Offline
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Use the toggle switch to go online and start receiving orders. When offline, you won't get new requests.</p>
                <Badge variant="outline" className="bg-green-50">Swipe to go online</Badge>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  Accepting Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>When an order comes in, you'll see:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Pickup location and distance to store</li>
                  <li>Estimated time from customer to store</li>
                  <li>Estimated payment including customer tip</li>
                  <li>Package size and any special instructions</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>The app provides turn-by-turn directions to pickup and drop-off locations.</p>
                <Badge variant="outline" className="bg-blue-50">GPS navigation built-in</Badge>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📱 Pro Tip:</h4>
            <p className="text-sm text-blue-800">
              Keep your phone charged and location services enabled for the best experience.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Pickup Process",
      description: "Step-by-step pickup procedures",
      icon: <Package className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-amber-900">Professional Pickup Process</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold text-gray-900">Arrive at Location</h4>
                <p className="text-sm text-gray-600">Park safely and approach the designated pickup area</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold text-gray-900">Contact Customer</h4>
                <p className="text-sm text-gray-600">Call or text to announce your arrival</p>
                <Badge variant="outline" className="bg-green-50 text-xs mt-1">
                  "Hi! I'm your Returnly driver here for pickup"
                </Badge>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold text-gray-900">Inspect Packages</h4>
                <p className="text-sm text-gray-600">Check condition and count matches the order</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h4 className="font-semibold text-gray-900">Take Photos</h4>
                <p className="text-sm text-gray-600">Document packages for proof of pickup</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</div>
              <div>
                <h4 className="font-semibold text-gray-900">Update Status</h4>
                <p className="text-sm text-gray-600">Mark as "Picked Up" in the app</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">⚠️ Important:</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Never pickup packages without customer confirmation</li>
              <li>• Don't accept damaged or leaking packages</li>
              <li>• Always be professional and courteous</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Drop-off & Completion",
      description: "Delivering packages and completing orders",
      icon: <MapPin className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-xl font-bold text-red-900 flex items-center gap-2">
              ⚠️ CRITICAL RESPONSIBILITY: Complete Return Processing
            </h3>
            <p className="text-red-800 font-medium mt-2">
              As a Returnly driver, you are responsible for completing the ENTIRE return process - not just delivering items to a store representative.
              You must process the full return transaction yourself to ensure customer satisfaction and proper completion.
            </p>
          </div>
          
          <h3 className="text-xl font-bold text-amber-900">Drop-off Best Practices</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold text-gray-900">Locate Drop-off Point</h4>
                <p className="text-sm text-gray-600">Find the designated return location (store, drop box, etc.)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold text-gray-900">Verify Requirements</h4>
                <p className="text-sm text-gray-600">Check any special drop-off instructions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold text-gray-900">⚠️ CRITICAL: Complete FULL Return Processing</h4>
                <p className="text-sm text-red-600 font-medium">
                  You MUST process the complete return yourself - NOT just hand items to return representatives.
                  You are responsible for the entire return transaction from start to finish.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h4 className="font-semibold text-gray-900">Process Complete Return Transaction</h4>
                <p className="text-sm text-gray-600">Complete the full return at customer service counter, obtain return receipt, and document with photos</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</div>
              <div>
                <h4 className="font-semibold text-gray-900">Mark Complete Only After Full Processing</h4>
                <p className="text-sm text-gray-600">Update status to "Delivered" only after you've completed the entire return process - payment is processed immediately</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">💰 Payment Processing:</h4>
            <p className="text-sm text-green-800">
              Your earnings are calculated and paid out immediately after completing each order. 
              Choose instant pay or weekly deposits in your payment settings.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Safety & Best Practices",
      description: "Staying safe while delivering excellent service",
      icon: <Star className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-amber-900">Safety First</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Car className="h-4 w-4 text-blue-500" />
                  Driving Safety
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>Always wear your seatbelt</li>
                  <li>Don't use phone while driving</li>
                  <li>Follow all traffic laws</li>
                  <li>Keep vehicle doors locked</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  Personal Safety
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>Trust your instincts</li>
                  <li>Stay in well-lit areas</li>
                  <li>Don't enter customer homes</li>
                  <li>Keep emergency contacts handy</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Excellent Service Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>Be punctual and communicate delays</li>
                <li>Handle packages with care</li>
                <li>Be friendly and professional</li>
                <li>Keep your vehicle clean and presentable</li>
                <li>Wear the ReturnIt driver identification</li>
              </ul>
            </CardContent>
          </Card>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              24/7 Support
            </h4>
            <p className="text-sm text-yellow-800">
              Need help? Contact driver support anytime at <strong>(636) 254-4821</strong> or through the app's help button.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "You're Ready to Drive!",
      description: "Complete your tutorial and start earning",
      icon: <CheckCircle className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-amber-900">Congratulations!</h3>
            <p className="text-amber-700 mt-2">You've completed the ReturnIt driver training</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">What You've Learned:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Payment structure and earnings
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                How to use the driver app
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Full return processing responsibilities
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Safe delivery practices
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Safety guidelines
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Customer service excellence
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">Next Steps:</h4>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <div className="bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <div>Go to the driver portal and toggle online to start receiving orders</div>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <div>Set up your payment preferences for instant or weekly payouts</div>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <div>Complete your first pickup to start earning!</div>
              </li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Welcome to the Returnly family! 🎉</p>
            <Link href="/driver-portal">
              <Button 
                className="bg-amber-600 hover:bg-amber-700 text-white" 
                data-testid="button-start-driving"
                disabled={completeTutorialMutation.isPending}
              >
                {completeTutorialMutation.isPending ? "Completing..." : "Go to Driver Portal"}
              </Button>
            </Link>
          </div>
        </div>
      ),
      actionRequired: true
    }
  ];

  const completeTutorialMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/driver/complete-tutorial"),
    onSuccess: () => {
      // Refresh user data to reflect tutorial completion and driver access
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      console.log("Tutorial completed successfully - driver access granted");
    }
  });

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete tutorial on final step
      completeTutorialMutation.mutate();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const currentTutorialStep = tutorialSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Driver Training</h1>
          <p className="text-amber-700">Complete this tutorial to start your journey as a Returnly driver</p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-tutorial" />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto">
            {tutorialSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  index === currentStep
                    ? 'bg-amber-600 text-white'
                    : completedSteps.has(index)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : index < currentStep
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                disabled={index > currentStep && !completedSteps.has(index)}
                data-testid={`step-${index}`}
              >
                {completedSteps.has(index) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : index === currentStep ? (
                  step.icon
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-white shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            <div className="flex items-center gap-3">
              {currentTutorialStep.icon}
              <div>
                <CardTitle className="text-xl">{currentTutorialStep.title}</CardTitle>
                <CardDescription className="text-amber-100">{currentTutorialStep.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {currentTutorialStep.content}
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-previous"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{currentStep + 1}</span>
            <span>of</span>
            <span>{tutorialSteps.length}</span>
          </div>

          {currentStep < tutorialSteps.length - 1 ? (
            <Button
              onClick={handleNext}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
              data-testid="button-next"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              data-testid="button-complete"
            >
              Complete Tutorial
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}