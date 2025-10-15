import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function LogoColors() {
  const [, setLocation] = useLocation();
  // Add timestamp to force image reload
  const cacheBuster = Date.now();

  const colorOptions = [
    { name: "Light Cardboard", file: "logo-cardboard-light.png", description: "Light natural cardboard - subtle and warm" },
    { name: "Medium Light", file: "logo-cardboard-medium-light.png", description: "Medium light brown - gentle contrast" },
    { name: "Medium Cardboard", file: "logo-cardboard-medium.png", description: "Classic cardboard brown - balanced tone" },
    { name: "Medium Dark", file: "logo-cardboard-medium-dark.png", description: "Medium dark brown - good readability" },
    { name: "Dark Cardboard", file: "logo-cardboard-dark.png", description: "Rich dark cardboard - your current favorite" },
    { name: "Darker Cardboard", file: "logo-cardboard-darker.png", description: "Deeper brown - premium shipping feel" },
    { name: "Deep Cardboard", file: "logo-cardboard-deep.png", description: "Deep rich brown - sophisticated" },
    { name: "Darkest Cardboard", file: "logo-cardboard-darkest.png", description: "Darkest brown - maximum contrast" }
  ];

  const handleColorSelect = (filename: string, colorName: string) => {
    // Copy to clipboard for easy reference
    navigator.clipboard.writeText(filename).catch(() => {});
    alert(`${colorName} selected! Filename: ${filename}\n\nTell me to apply this color and I'll update your website.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-transparent">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Cardboard Brown Shade</h1>
          <p className="text-xl text-gray-600 mb-6">Find the perfect shade of cardboard brown for your "Returnly" logo</p>
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
              <div className="bg-gradient-to-r from-amber-600 via-red-500 to-transparent0 h-40 flex items-center justify-center">
                <img 
                  src={`/${option.file}?v=${cacheBuster}`}
                  alt={`${option.name} logo`}
                  className="h-16 w-auto"
                  onLoad={() => console.log(`Loaded: ${option.file}`)}
                  onError={(e) => {
                    console.error(`Failed to load ${option.file}`);
                    e.currentTarget.style.border = "2px solid red";
                    e.currentTarget.alt = `Error loading ${option.name}`;
                  }}
                />
              </div>

              {/* Preview against light background (like your welcome section) */}
              <div className="bg-amber-50 h-32 flex items-center justify-center border-b">
                <img 
                  src={`/${option.file}?v=${cacheBuster}`}
                  alt={`${option.name} logo`}
                  className="h-12 w-auto"
                  onError={(e) => {
                    console.error(`Failed to load ${option.file} in light section`);
                    e.currentTarget.style.border = "2px solid red";
                    e.currentTarget.alt = `Error: ${option.name}`;
                  }}
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{option.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                <Button 
                  onClick={() => handleColorSelect(option.file, option.name)}
                  className="w-full bg-amber-600 hover:bg-amber-700"
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
            8 shades of cardboard brown from light to darkest. Each shown on your orange background and light section.<br/>
            Find the perfect brown shade that matches your shipping theme vision.
          </p>
        </div>
      </div>
    </div>
  );
}