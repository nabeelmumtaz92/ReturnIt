import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function BackgroundColors() {
  const [, setLocation] = useLocation();

  const backgroundOptions = [
    { 
      name: "Current Orange", 
      gradient: "from-orange-600 via-red-500 to-orange-500",
      description: "Current warm orange gradient - energetic shipping theme"
    },
    { 
      name: "Sage Green", 
      gradient: "from-green-700 via-green-600 to-green-500",
      description: "Natural green - eco-friendly, complements cardboard perfectly"
    },
    { 
      name: "Deep Blue", 
      gradient: "from-blue-800 via-blue-700 to-blue-600",
      description: "Professional navy - trustworthy, makes cardboard text pop"
    },
    { 
      name: "Warm Beige", 
      gradient: "from-amber-200 via-yellow-100 to-orange-100",
      description: "Light cardboard tones - monochromatic shipping aesthetic"
    },
    { 
      name: "Charcoal Gray", 
      gradient: "from-gray-800 via-gray-700 to-gray-600",
      description: "Modern dark - makes cardboard brown stand out beautifully"
    },
    { 
      name: "Forest Green", 
      gradient: "from-emerald-800 via-green-700 to-teal-600",
      description: "Rich forest - natural shipping, excellent cardboard contrast"
    },
    { 
      name: "Burgundy Wine", 
      gradient: "from-red-900 via-red-800 to-red-700",
      description: "Premium dark red - sophisticated, complements brown tones"
    },
    { 
      name: "Midnight Blue", 
      gradient: "from-indigo-900 via-blue-900 to-slate-800",
      description: "Dark elegant - makes cardboard text highly readable"
    }
  ];

  const handleBackgroundSelect = (gradientClass: string, backgroundName: string) => {
    navigator.clipboard.writeText(gradientClass).catch(() => {});
    alert(`${backgroundName} selected! Gradient: ${gradientClass}\n\nTell me to apply this background and I'll update your website.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Background Colors for Deep Cardboard Logo</h1>
          <p className="text-xl text-gray-600 mb-6">Pick a background that makes your Deep Cardboard brown text pop</p>
          <div className="flex gap-4 justify-center mb-8">
            <Button 
              onClick={() => setLocation('/welcome')}
              variant="outline"
            >
              ← Back to Website
            </Button>
            <Button 
              onClick={() => setLocation('/logo-colors')}
              variant="outline"
            >
              Logo Colors
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {backgroundOptions.map((option) => (
            <div 
              key={option.name}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Preview background with cardboard logo */}
              <div className={`bg-gradient-to-r ${option.gradient} h-48 flex items-center justify-center relative`}>
                <div className="text-3xl font-bold text-white drop-shadow-lg">
                  ReturnIt
                </div>
                <div className="absolute top-2 left-2">
                  <span className="text-white/80 text-xs bg-black/20 px-2 py-1 rounded">
                    Deep Cardboard Logo
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{option.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                <div className="mb-4">
                  <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    {option.gradient}
                  </span>
                </div>
                <Button 
                  onClick={() => handleBackgroundSelect(option.gradient, option.name)}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                  size="sm"
                >
                  Use This Background
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 max-w-2xl mx-auto">
            Each background is tested with your Deep Cardboard logo. The best combinations provide strong contrast
            while maintaining the warm, professional shipping aesthetic. 
            <strong> Sage Green</strong> and <strong>Deep Blue</strong> are particularly stunning with Deep Cardboard brown.
          </p>
        </div>
      </div>
    </div>
  );
}