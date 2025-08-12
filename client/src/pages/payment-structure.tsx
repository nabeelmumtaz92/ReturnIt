import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentBreakdown } from "@/components/PaymentBreakdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getItemSizeByValue } from "@shared/paymentCalculator";

export default function PaymentStructure() {
  const examples = [
    {
      name: "Necklace",
      value: 6,
      description: "Small jewelry item"
    },
    {
      name: "Microwave", 
      value: 80,
      description: "Kitchen appliance"
    },
    {
      name: "Monitor",
      value: 35, 
      description: "Computer display"
    },
    {
      name: "Desk",
      value: 300,
      description: "Office furniture"
    }
  ];

  const getSizeLabel = (value: number) => {
    const size = getItemSizeByValue(value);
    const labels = {
      'S': 'Small',
      'M': 'Medium', 
      'L': 'Large',
      'XL': 'Extra Large'
    };
    return labels[size as keyof typeof labels];
  };

  const getSizeBadgeColor = (value: number) => {
    const size = getItemSizeByValue(value);
    const colors = {
      'S': 'bg-green-100 text-green-800',
      'M': 'bg-blue-100 text-blue-800',
      'L': 'bg-orange-100 text-orange-800', 
      'XL': 'bg-red-100 text-red-800'
    };
    return colors[size as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-amber-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-amber-900">
              Returnly Payment Structure Demo
            </CardTitle>
            <p className="text-amber-700 text-lg mt-2">
              Transparent pricing based on item value with detailed financial breakdowns
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800">Small</h4>
                  <p className="text-sm text-green-600">Under $25</p>
                  <p className="text-xs text-green-500">No upcharge</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800">Medium</h4>
                  <p className="text-sm text-blue-600">$25 - $99</p>
                  <p className="text-xs text-blue-500">No upcharge</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800">Large</h4>
                  <p className="text-sm text-orange-600">$100 - $299</p>
                  <p className="text-xs text-orange-500">+$2.00 upcharge</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800">Extra Large</h4>
                  <p className="text-sm text-red-600">$300+</p>
                  <p className="text-xs text-red-500">+$4.00 upcharge</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Examples */}
        <Tabs defaultValue="necklace" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {examples.map((example, index) => (
              <TabsTrigger key={index} value={example.name.toLowerCase()}>
                <div className="flex flex-col items-center space-y-1">
                  <span className="font-medium">{example.name}</span>
                  <Badge className={`text-xs ${getSizeBadgeColor(example.value)}`}>
                    {getSizeLabel(example.value)}
                  </Badge>
                  <span className="text-xs text-gray-500">${example.value}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {examples.map((example, index) => (
            <TabsContent key={index} value={example.name.toLowerCase()}>
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl text-amber-900">
                      {example.name} Return (${example.value})
                    </span>
                    <Badge className={getSizeBadgeColor(example.value)}>
                      {getSizeLabel(example.value)} Item
                    </Badge>
                  </CardTitle>
                  <p className="text-amber-700">{example.description}</p>
                </CardHeader>
                <CardContent>
                  <PaymentBreakdown
                    itemValue={example.value}
                    numberOfItems={1}
                    isRush={false}
                    tip={0}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Key Insights */}
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-xl text-amber-900">Key Financial Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Customer Experience</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Get full item refund</li>
                  <li>• Pay transparent service fee</li>
                  <li>• Know exact cost upfront</li>
                  <li>• Small order fee for orders under $8</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Driver Earnings</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Base pay guaranteed</li>
                  <li>• Distance compensation</li>
                  <li>• Time-based pay</li>
                  <li>• 100% of tips kept</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-2">Company Revenue</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• 15% service fee</li>
                  <li>• Base fee share</li>
                  <li>• Distance/time margins</li>
                  <li>• Sustainable operations</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Fair Payment Distribution</h4>
              <p className="text-sm text-gray-700">
                Our payment structure ensures fair compensation for drivers while maintaining transparent pricing for customers. 
                Higher-value items (typically larger or more complex to handle) include appropriate upcharges that go toward 
                both driver compensation and operational costs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}