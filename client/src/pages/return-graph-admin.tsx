import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Network, Database, MapPin, Loader2, TrendingUp, BarChart3, Download, FileJson, FileSpreadsheet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ReturnGraphAdmin() {
  const { toast } = useToast();
  const [isPopulating, setIsPopulating] = useState(false);

  // Fetch graph stats
  const { data: graphStats, isLoading } = useQuery({
    queryKey: ['/api/admin/graph/stats'],
  });

  // Populate graph mutation
  const populateMutation = useMutation({
    mutationFn: async () => {
      setIsPopulating(true);
      return await apiRequest('/api/admin/graph/populate', 'POST');
    },
    onSuccess: (data: any) => {
      toast({
        title: "Graph Populated! 🎉",
        description: `Added ${data.result.nodes} nodes, ${data.result.edges} edges, ${data.result.policies} policies`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/graph/stats'] });
      setIsPopulating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Population Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsPopulating(false);
    },
  });

  // Clear graph mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/graph/clear', 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Graph Cleared",
        description: "All graph data has been removed",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/graph/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Clear Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Policy import mutation
  const importPoliciesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/policies/import', 'POST');
    },
    onSuccess: (data: any) => {
      toast({
        title: "Policies Imported! 📋",
        description: `Successfully imported ${data.result.imported} retailer policies`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/graph/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stats = (graphStats as any)?.stats || { nodes: 0, edges: 0, policies: 0 };
  const hasData = stats.nodes > 0 || stats.edges > 0 || stats.policies > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Return Graph Intelligence</h1>
        <p className="text-muted-foreground">
          Manage your proprietary routing network - the competitive moat that learns with every return
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
        <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-900 dark:text-amber-100">
          The Return Graph is your proprietary knowledge network. Each completed return makes it smarter, 
          learning optimal routes, store acceptance patterns, and timing strategies that competitors can't replicate.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graph Nodes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.nodes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Stores, drop-off points, partner networks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Routing Edges</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.edges}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Connections with learned weights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Rules</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.policies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Learned acceptance patterns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Graph Management</CardTitle>
          <CardDescription>
            Populate the graph with real store locations and routing edges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4 p-4 border rounded-lg bg-muted/50">
            <Database className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Seed Real-World Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Populate the graph with actual store locations from major retailers (Target, Walmart, Best Buy), 
                partner networks (Happy Returns, UPS, FedEx), and calculated routing edges based on real distances.
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
                Includes: 15+ store locations across St. Louis, Chicago, NYC • Bidirectional routing edges • Store policy rules
              </p>
              <Button
                onClick={() => populateMutation.mutate()}
                disabled={populateMutation.isPending || isPopulating}
                className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                data-testid="button-populate-graph"
              >
                {populateMutation.isPending || isPopulating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Populating Graph...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Populate Graph
                  </>
                )}
              </Button>
            </div>
          </div>

          {hasData && (
            <div className="flex items-start space-x-4 p-4 border rounded-lg bg-destructive/10">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Clear Graph Data</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Remove all nodes, edges, and policy rules. This is useful for re-seeding with fresh data.
                </p>
                <Button
                  onClick={() => {
                    if (confirm('Are you sure? This will delete all graph data.')) {
                      clearMutation.mutate();
                    }
                  }}
                  disabled={clearMutation.isPending}
                  variant="destructive"
                  data-testid="button-clear-graph"
                >
                  {clearMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    'Clear All Data'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Policy Import Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Retailer Policy Database</CardTitle>
          <CardDescription>
            Import 39 curated retailer return policies into your graph
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <FileJson className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Import Retailer Policies</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Load 39 professionally curated retailer return policies including national chains (Target, Walmart, Best Buy, Amazon) and authentic St. Louis local boutiques (Dierbergs, Schnucks, Paperdolls, Blush, Levine Hat, DNA) 
                directly into your Return Graph. Each policy includes return windows, conditions, restocking fees, special category rules, and exceptions.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={() => importPoliciesMutation.mutate()}
                  disabled={importPoliciesMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                  data-testid="button-import-policies"
                >
                  {importPoliciesMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing Policies...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Import 39 Policies
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('/api/admin/policies/download/json', '_blank')}
                  data-testid="button-download-json"
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  Download JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('/api/admin/policies/download/csv', '_blank')}
                  data-testid="button-download-csv"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </div>
          </div>

          <Alert className="border-blue-200 dark:border-blue-800">
            <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm">
              <strong>39 Unique Retailers:</strong> National chains (Target, Walmart, Best Buy, Amazon, Home Depot, Apple, Costco, Macy's, Nordstrom, Kohl's, Gap, Nike, Adidas, Sephora, Ulta, REI, L.L.Bean, IKEA, Wayfair, Barnes & Noble, Sam's Club, Micro Center, JCPenney, Lowe's, Zara, H&M) + St. Louis local (Dierbergs, Schnucks, Paperdolls Boutique, Blush Boutique, Levine Hat Company, DNA Boutique, The Vault, State Beauty Supply, Catholic Supply, Authorized Appliance, WWT Raceway, STL Zoo, Randall's)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How Return Graph Works</CardTitle>
          <CardDescription>Understanding your proprietary routing intelligence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">🧠 Machine Learning Layer</h4>
              <p className="text-sm text-muted-foreground">
                Every routing decision is logged and analyzed. The system learns which stores accept which brands, 
                optimal visit times, and driver success patterns using exponential moving average algorithms.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">🗺️ A* Pathfinding Algorithm</h4>
              <p className="text-sm text-muted-foreground">
                Multi-criteria optimization considers distance, time, cost, and acceptance probability. 
                When edges exist, the system automatically uses graph traversal for complex multi-hop routing.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">📊 Performance Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Each node tracks success rate, wait time, and customer satisfaction. Edges track reliability, 
                traffic patterns, and historical completion times - all improving with every return.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">🚀 Competitive Moat</h4>
              <p className="text-sm text-muted-foreground">
                After 100K+ returns, you'll have routing intelligence no competitor can replicate. 
                This data becomes your company's most valuable asset - patentable and licensable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
