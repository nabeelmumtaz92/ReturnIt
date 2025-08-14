import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsDashboard() {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-900">Analytics (Preview)</CardTitle>
      </CardHeader>
      <CardContent className="text-amber-700">
        Charts and deeper analytics can plug in here later.
      </CardContent>
    </Card>
  );
}