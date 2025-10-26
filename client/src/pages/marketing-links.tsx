import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTrackingUrl } from '@/lib/tracking';

export default function MarketingLinks() {
  const { toast } = useToast();
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  const baseUrl = window.location.origin;

  const handleGenerate = () => {
    if (!source) {
      toast({
        title: "Missing source",
        description: "Please enter a traffic source",
        variant: "destructive",
      });
      return;
    }

    const url = generateTrackingUrl('/', source, medium || undefined, campaign || undefined);
    setGeneratedUrl(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    toast({
      title: "Copied!",
      description: "Tracking URL copied to clipboard",
    });
  };

  const presetCampaigns = [
    { name: 'Google Ads', source: 'google', medium: 'cpc', campaign: 'brand_search' },
    { name: 'Facebook Ads', source: 'facebook', medium: 'paid_social', campaign: 'customer_acquisition' },
    { name: 'Instagram Story', source: 'instagram', medium: 'social', campaign: 'story_promo' },
    { name: 'Email Newsletter', source: 'email', medium: 'newsletter', campaign: 'weekly_digest' },
    { name: 'Driver Recruitment Email', source: 'email', medium: 'recruitment', campaign: 'driver_signup' },
    { name: 'Twitter/X Post', source: 'twitter', medium: 'social', campaign: 'organic' },
  ];

  const usePreset = (preset: typeof presetCampaigns[0]) => {
    setSource(preset.source);
    setMedium(preset.medium);
    setCampaign(preset.campaign);
  };

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">Marketing Campaign Link Generator</h1>
          <p className="text-amber-700 mt-2">
            Generate tracking URLs for your marketing campaigns (like DoorDash's tracking system)
          </p>
        </div>

        {/* Preset Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Presets</CardTitle>
            <CardDescription>Click a preset to auto-fill the form</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {presetCampaigns.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  onClick={() => usePreset(preset)}
                  className="justify-start text-left"
                  data-testid={`preset-${preset.source}`}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manual Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Campaign Settings</CardTitle>
            <CardDescription>Configure your tracking parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">
                  Source * <span className="text-xs text-muted-foreground">(Required)</span>
                </Label>
                <Input
                  id="source"
                  placeholder="google, facebook, email"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  data-testid="input-source"
                />
                <p className="text-xs text-muted-foreground">Where traffic comes from</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medium">Medium</Label>
                <Select value={medium} onValueChange={setMedium}>
                  <SelectTrigger data-testid="select-medium">
                    <SelectValue placeholder="Select medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpc">CPC (Cost per Click)</SelectItem>
                    <SelectItem value="paid_social">Paid Social</SelectItem>
                    <SelectItem value="social">Organic Social</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="banner">Banner Ad</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Marketing medium type</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign">Campaign Name</Label>
                <Input
                  id="campaign"
                  placeholder="summer_promo"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  data-testid="input-campaign"
                />
                <p className="text-xs text-muted-foreground">Campaign identifier</p>
              </div>
            </div>

            <Button onClick={handleGenerate} className="w-full" data-testid="button-generate">
              <LinkIcon className="h-4 w-4 mr-2" />
              Generate Tracking URL
            </Button>
          </CardContent>
        </Card>

        {/* Generated URL */}
        {generatedUrl && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Generated Tracking URL</CardTitle>
              <CardDescription>Share this URL in your marketing materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm font-mono break-all text-amber-900">{generatedUrl}</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1" data-testid="button-copy">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a href={generatedUrl} target="_blank" rel="noopener noreferrer" data-testid="link-test">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test Link
                  </a>
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📊 What Gets Tracked:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Traffic source: <strong>{source}</strong></li>
                  {medium && <li>✓ Marketing medium: <strong>{medium}</strong></li>}
                  {campaign && <li>✓ Campaign name: <strong>{campaign}</strong></li>}
                  <li>✓ Unique tracking ID (like DoorDash's srsltid)</li>
                  <li>✓ All data stored for 30 days for attribution</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">📝 Example Use Cases:</h4>
              <ul className="list-disc pl-5 space-y-1 text-amber-800">
                <li><strong>Google Ads:</strong> Track which keywords drive bookings</li>
                <li><strong>Social Media:</strong> See which platforms convert best</li>
                <li><strong>Email Campaigns:</strong> Measure email effectiveness</li>
                <li><strong>Influencer Partnerships:</strong> Give each influencer a unique link</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">🎯 Best Practices:</h4>
              <ul className="list-disc pl-5 space-y-1 text-amber-800">
                <li>Use consistent naming (lowercase, underscores)</li>
                <li>Be specific: "facebook_story_jan2025" vs "social"</li>
                <li>Track everything - it's free and powerful!</li>
                <li>Check analytics regularly to optimize campaigns</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
