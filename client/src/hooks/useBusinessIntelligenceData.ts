import { useQuery } from '@tanstack/react-query';
import { 
  KpiData, 
  DemandForecastItem, 
  PricingOptimizationItem, 
  MarketExpansionItem 
} from '@shared/schema';

// Enhanced error handling and type guards
const isValidKpiData = (data: any): data is KpiData => {
  return data && 
         typeof data === 'object' &&
         data.revenue?.current !== undefined &&
         data.orders?.current !== undefined &&
         data.avgOrderValue?.current !== undefined &&
         data.drivers?.current !== undefined;
};

function isValidArrayData<T>(data: any, itemValidator?: (item: any) => boolean): data is T[] {
  return Array.isArray(data) && (itemValidator ? data.every(itemValidator) : true);
}

export function useBusinessIntelligenceData(timeRange: string) {
  // Real KPI data from database (replaced mock) - Now properly typed
  const kpiQuery = useQuery({
    queryKey: ['/api/admin/business-intelligence/kpis', timeRange],
    enabled: true
  });
  const kpiData = kpiQuery.data as KpiData | undefined;
  const kpiLoading = kpiQuery.isLoading;

  // Real demand forecasting data from database (replaced mock) - Now properly typed
  const demandQuery = useQuery({
    queryKey: ['/api/admin/business-intelligence/demand-forecast', timeRange],
    enabled: true
  });
  const demandData = demandQuery.data as DemandForecastItem[] | undefined;
  const demandLoading = demandQuery.isLoading;

  // Real pricing optimization data from database (replaced mock) - Now properly typed
  const pricingQuery = useQuery({
    queryKey: ['/api/admin/business-intelligence/pricing-optimization'],
    enabled: true
  });
  const pricingOptimization = pricingQuery.data as PricingOptimizationItem[] | undefined;
  const pricingLoading = pricingQuery.isLoading;

  // Real market expansion data from database (replaced mock) - Now properly typed
  const marketQuery = useQuery({
    queryKey: ['/api/admin/business-intelligence/market-expansion'],
    enabled: true
  });
  const marketExpansion = marketQuery.data as MarketExpansionItem[] | undefined;
  const marketLoading = marketQuery.isLoading;

  // Enhanced error handling for invalid data
  const hasValidKpiData = isValidKpiData(kpiData);
  const isLoading = kpiLoading || demandLoading || pricingLoading || marketLoading;

  return {
    kpiData,
    kpiLoading,
    demandData,
    demandLoading,
    pricingOptimization,
    pricingLoading,
    marketExpansion,
    marketLoading,
    hasValidKpiData,
    isLoading
  };
}