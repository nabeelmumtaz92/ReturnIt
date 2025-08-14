import { useQuery } from "@tanstack/react-query";
import { MapPin, Mail, Phone, Clock, Instagram, Facebook, Twitter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BusinessInfo {
  id: number;
  companyName: string;
  tagline: string;
  description: string;
  headquarters: string;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  instagramHandle: string;
  facebookUrl: string;
  twitterHandle: string;
  missionStatement: string;
  foundingStory: string;
  updatedAt: string;
}

export default function About() {
  const { data: businessInfo, isLoading } = useQuery<BusinessInfo>({
    queryKey: ["/api/business-info"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-img-enhanced"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/8001186/pexels-photo-8001186.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2560&dpr=3&fit=crop&crop=center&q=95)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="absolute inset-0 bg-white/80"></div>
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <img 
              src="/logo-cardboard-deep.png" 
              alt="Returnly Logo" 
              className="h-24 w-auto mx-auto mb-4 logo-enhanced"
              data-testid="img-logo"
            />
          </div>
          <Badge className="mb-6 bg-amber-100 text-amber-800 border-amber-200" data-testid="badge-company">
            {businessInfo?.companyName || "Returnly"}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-amber-900 mb-6" data-testid="heading-tagline">
            {businessInfo?.tagline || "Making Returns Effortless"}
          </h1>
          <p className="text-xl text-amber-700 leading-relaxed" data-testid="text-description">
            {businessInfo?.description || "At Returnly, we believe returning an item should be as easy as ordering it."}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-white/70">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-amber-900 mb-6" data-testid="heading-mission">
                Our Mission
              </h2>
              <p className="text-lg text-amber-700 leading-relaxed mb-6" data-testid="text-mission">
                {businessInfo?.missionStatement || "Founded with the mission to save you time and effort, Returnly partners with local drivers to ensure every return is handled quickly, safely, and securely."}
              </p>
              <p className="text-lg text-amber-700 leading-relaxed" data-testid="text-coverage">
                Whether it's a small package or a bulky box, we've got you covered with our comprehensive return logistics platform.
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3" data-testid="feature-hassle-free">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-amber-800 font-medium">No more long lines</span>
                </div>
                <div className="flex items-center gap-3" data-testid="feature-no-labels">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-amber-800 font-medium">No more printing labels</span>
                </div>
                <div className="flex items-center gap-3" data-testid="feature-doorstep">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-amber-800 font-medium">Pickup from your doorstep</span>
                </div>
                <div className="flex items-center gap-3" data-testid="feature-secure">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-amber-800 font-medium">Safe & secure handling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-white/80 border-amber-200">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-900" data-testid="heading-story">
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-amber-700 leading-relaxed" data-testid="text-founding-story">
                {businessInfo?.foundingStory || "Founded in 2024 in St. Louis, Missouri, Returnly was created to solve the growing frustration with online returns. Our founders experienced firsthand the time-consuming process of returning items and envisioned a better way."}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-6 bg-white/70">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center" data-testid="heading-contact">
            Get In Touch
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center bg-white border-amber-200" data-testid="card-location">
              <CardContent className="pt-6">
                <MapPin className="w-8 h-8 mx-auto mb-3 text-amber-600" />
                <h3 className="font-semibold text-amber-900 mb-2">Headquarters</h3>
                <p className="text-amber-700" data-testid="text-headquarters">
                  {businessInfo?.headquarters || "St. Louis, MO"}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border-amber-200" data-testid="card-email">
              <CardContent className="pt-6">
                <Mail className="w-8 h-8 mx-auto mb-3 text-amber-600" />
                <h3 className="font-semibold text-amber-900 mb-2">Email</h3>
                <p className="text-amber-700" data-testid="text-email">
                  {businessInfo?.supportEmail || "support@returnly.com"}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border-amber-200" data-testid="card-phone">
              <CardContent className="pt-6">
                <Phone className="w-8 h-8 mx-auto mb-3 text-amber-600" />
                <h3 className="font-semibold text-amber-900 mb-2">Phone</h3>
                <p className="text-amber-700" data-testid="text-phone">
                  {businessInfo?.supportPhone || "(555) 123-4567"}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border-amber-200" data-testid="card-hours">
              <CardContent className="pt-6">
                <Clock className="w-8 h-8 mx-auto mb-3 text-amber-600" />
                <h3 className="font-semibold text-amber-900 mb-2">Hours</h3>
                <p className="text-amber-700" data-testid="text-hours">
                  {businessInfo?.businessHours || "Mon–Sat, 8 AM – 8 PM CST"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-amber-900 mb-8" data-testid="heading-social">
            Follow Us
          </h2>
          <div className="flex justify-center gap-8">
            <a 
              href={`https://instagram.com/${businessInfo?.instagramHandle?.replace('@', '') || 'ReturnlyApp'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
              data-testid="link-instagram"
            >
              <Instagram className="w-8 h-8" />
              <span>{businessInfo?.instagramHandle || "@ReturnlyApp"}</span>
            </a>
            <a 
              href={`https://${businessInfo?.facebookUrl || 'facebook.com/Returnly'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
              data-testid="link-facebook"
            >
              <Facebook className="w-8 h-8" />
              <span>Facebook</span>
            </a>
            <a 
              href={`https://twitter.com/${businessInfo?.twitterHandle?.replace('@', '') || 'Returnly'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
              data-testid="link-twitter"
            >
              <Twitter className="w-8 h-8" />
              <span>{businessInfo?.twitterHandle || "@Returnly"}</span>
            </a>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}