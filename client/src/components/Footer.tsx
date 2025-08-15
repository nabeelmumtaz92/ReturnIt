import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin
} from "lucide-react";
import { LogoIcon } from "@/components/LogoIcon";

export default function Footer() {
  return (
    <footer className="bg-amber-900 text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <LogoIcon size={32} className="text-white" />
              <span className="text-xl font-bold text-white">Returnly</span>
            </div>
            <p className="text-amber-100 leading-relaxed">
              Convenient return pickup service in St. Louis, MO. We handle your returns so you don't have to.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-amber-100 hover:text-white hover:bg-amber-800 p-2"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-amber-100 hover:text-white hover:bg-amber-800 p-2"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-amber-100 hover:text-white hover:bg-amber-800 p-2"
              >
                <Instagram className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-amber-100 hover:text-white hover:bg-amber-800 p-2"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/book-pickup">
                  <Button 
                    variant="link" 
                    className="text-amber-100 hover:text-white p-0 h-auto justify-start"
                  >

                    Book Return Pickup
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/order-status/demo">
                  <Button 
                    variant="link" 
                    className="text-amber-100 hover:text-white p-0 h-auto justify-start"
                  >
                    Track Your Return
                  </Button>
                </Link>
              </li>

              <li>
                <Link href="/about">
                  <Button 
                    variant="link" 
                    className="text-amber-100 hover:text-white p-0 h-auto justify-start"
                  >
                    About Returnly
                  </Button>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support & Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq">
                  <Button 
                    variant="link" 
                    className="text-amber-100 hover:text-white p-0 h-auto justify-start"
                  >

                    FAQ
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/help-center">
                  <Button 
                    variant="link" 
                    className="text-amber-100 hover:text-white p-0 h-auto justify-start"
                  >
                    Help Center
                  </Button>
                </Link>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="text-amber-100 hover:text-white p-0 h-auto justify-start"
                >

                  Terms of Service
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="text-amber-100 hover:text-white p-0 h-auto justify-start"
                >

                  Privacy Policy
                </Button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-amber-300" />
                <span className="text-amber-100">(314) 555-0123</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-amber-300" />
                <span className="text-amber-100">support@returnly.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-amber-300 mt-1" />
                <div className="text-amber-100">
                  <p>St. Louis, MO</p>
                  <p className="text-sm">Serving the Greater Metro Area</p>
                </div>
              </div>
            </div>
            
            {/* Quick Contact */}
            <div className="mt-4">
              <Link href="/help-center">
                <Button 
                  className="bg-amber-700 hover:bg-amber-600 text-white w-full"
                  data-testid="button-contact-support"
                >
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-amber-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-amber-100 text-sm">
              © 2025 Returnly. All rights reserved. | Licensed return service provider in Missouri.
            </div>
            <div className="flex space-x-6 text-sm">
              <Button 
                variant="link" 
                className="text-amber-100 hover:text-white p-0 h-auto"
              >
                Accessibility
              </Button>
              <Button 
                variant="link" 
                className="text-amber-100 hover:text-white p-0 h-auto"
              >
                Sitemap
              </Button>
              <Button 
                variant="link" 
                className="text-amber-100 hover:text-white p-0 h-auto"
              >
                Careers
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}