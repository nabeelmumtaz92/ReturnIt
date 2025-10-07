import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Package, Truck } from "lucide-react";

export default function WelcomeSimple() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#231b0f]">
      <div className="container mx-auto px-4 py-16 text-center">
        <div 
          className="text-foreground font-bold text-5xl mx-auto mb-8"
        >
          Return It
        </div>
        
        <h1 className="text-6xl font-bold text-foreground mb-6">
          Return It
        </h1>
        
        <p className="text-2xl text-foreground mb-12">
          Return delivery service - $3.99 per pickup
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto">
          <Button 
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 font-bold text-lg px-8 py-4"
            onClick={() => setLocation('/login')}
            data-testid="button-start-return"
          >
            <Package className="h-5 w-5 mr-2" />
            Start Return
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-primary text-foreground hover:bg-accent/50 font-bold text-lg px-8 py-4"
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