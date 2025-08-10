import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Package, Truck } from "lucide-react";

export default function WelcomeSimple() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-100">
      <div className="container mx-auto px-4 py-16 text-center">
        <img 
          src="/logo-cardboard-deep.png" 
          alt="Returnly Logo" 
          className="h-20 w-auto mx-auto mb-8"
        />
        
        <h1 className="text-6xl font-bold text-amber-900 mb-6">
          Returnly
        </h1>
        
        <p className="text-2xl text-amber-800 mb-12">
          Return delivery service - $3.99 per pickup
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto">
          <Button 
            size="lg"
            className="bg-amber-800 text-white hover:bg-amber-900 font-bold text-lg px-8 py-4"
            onClick={() => setLocation('/login')}
            data-testid="button-start-return"
          >
            <Package className="h-5 w-5 mr-2" />
            Start Return
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-amber-800 text-amber-800 hover:bg-amber-50 font-bold text-lg px-8 py-4"
            onClick={() => setLocation('/login')}
            data-testid="button-track-order"
          >
            <Truck className="h-5 w-5 mr-2" />
            Track Order
          </Button>
        </div>
      </div>
    </div>
  );
}