import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/">
            <div 
              className="text-foreground font-bold text-3xl mx-auto cursor-pointer hover:opacity-80 transition-opacity"
            >
              Return It
            </div>
          </Link>
        </div>

        {/* 404 Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-border">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Page Not Found</CardTitle>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary-foreground mb-2">404</div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                asChild 
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex-1 border-border text-muted-foreground hover:bg-accent/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>

            <div className="bg-accent p-4 rounded-lg border border-border">
              <p className="text-sm text-foreground text-center">
                Need help? Contact our support team or visit our{" "}
                <Link href="/help-center" className="underline font-medium hover:text-foreground">
                  Help Center
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
