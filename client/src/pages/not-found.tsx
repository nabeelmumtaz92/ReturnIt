import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/">
            <img 
              src="/returnit-logo.png" 
              alt="ReturnIt Logo" 
              className="h-12 w-auto mx-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        {/* 404 Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-amber-900">Page Not Found</CardTitle>
            <p className="text-amber-700">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-amber-200 mb-2">404</div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                asChild 
                className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
              >
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800 text-center">
                Need help? Contact our support team or visit our{" "}
                <Link href="/help-center" className="underline font-medium hover:text-amber-900">
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
