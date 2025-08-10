import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function LogoColors() {
  const [, setLocation] = useLocation();

  const colorOptions = [
    { name: "Current Orange", file: "logo-orange.png", description: "Current warm orange-brown" },
    { name: "Gold", file: "logo-gold.png", description: "Luxurious gold - pops against brown/orange" },
    { name: "White", file: "logo-white.png", description: "Clean white - classic contrast" },
    { name: "Steel Blue", file: "logo-blue.png", description: "Professional blue - complementary to orange" },
    { name: "Crimson Red", file: "logo-red.png", description: "Bold red - high impact" },
    { name: "Lime Green", file: "logo-green.png", description: "Fresh green - vibrant contrast" },
    { name: "Purple", file: "logo-purple.png", description: "Sophisticated violet - modern" },
    { name: "Hot Pink", file: "logo-pink.png", description: "Bold pink - trendy pop" },
    { name: "Turquoise", file: "logo-cyan.png", description: "Cool turquoise - fresh contrast" }
  ];

  const handleColorSelect = (filename: string, colorName: string) => {
    // This would update the logo in the actual site
    console.log(`Selected ${colorName} (${filename})`);
    alert(`${colorName} selected! This is a preview - would you like me to apply this color?`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Logo Color</h1>
          <p className="text-xl text-gray-600 mb-6">Pick a color that pops against your website's theme</p>
          <Button 
            onClick={() => setLocation('/welcome')}
            variant="outline"
            className="mb-8"
          >
            ← Back to Website
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {colorOptions.map((option) => (
            <div 
              key={option.name}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Preview against orange background (like your hero) */}
              <div className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-500 h-40 flex items-center justify-center">
                <img 
                  src={`/${option.file}`}
                  alt={`${option.name} logo`}
                  className="h-16 w-auto"
                  onError={(e) => {
                    console.error(`Failed to load ${option.file}`);
                  }}
                />
              </div>

              {/* Preview against light background (like your welcome section) */}
              <div className="bg-orange-50 h-32 flex items-center justify-center border-b">
                <img 
                  src={`/${option.file}`}
                  alt={`${option.name} logo`}
                  className="h-12 w-auto"
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{option.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                <Button 
                  onClick={() => handleColorSelect(option.file, option.name)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="sm"
                >
                  Use This Color
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Each color is shown on both your orange hero background and light welcome section.
          </p>
        </div>
      </div>
    </div>
  );
}