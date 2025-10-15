import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Building2, 
  Clock, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  ExternalLink,
  MapPin,
  Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Company {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  headquarters?: string;
  businessType: string;
  foundedYear?: number;
  isFeatured: boolean;
  stLouisLocations: CompanyLocation[];
}

interface CompanyLocation {
  id?: number;
  companyId?: number;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  acceptsReturns?: boolean;
}

interface ReturnPolicy {
  id: number;
  companyId: number;
  returnWindowDays: number;
  returnWindowType: string;
  requiresReceipt: boolean;
  requiresOriginalTags: boolean;
  allowsWornItems: boolean;
  refundMethod: string;
  refundProcessingDays: number;
  excludedCategories: string[];
  additionalTerms?: string;
  extendedHolidayWindow: boolean;
  chargesRestockingFee: boolean;
  restockingFeePercent: number;
}

interface CompanySelectorProps {
  selectedCompany?: Company;
  selectedLocation?: CompanyLocation;
  onCompanySelect: (company: Company, location?: CompanyLocation, policy?: ReturnPolicy) => void;
  className?: string;
  placeholder?: string;
  showReturnPolicyDetails?: boolean;
  purchaseDate?: string; // To check if return is past policy window
}

export default function CompanySelector({
  selectedCompany,
  selectedLocation,
  onCompanySelect,
  className = "",
  placeholder = "Search for a store...",
  showReturnPolicyDetails = false,
  purchaseDate
}: CompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch companies based on search query
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['/api/companies/search', searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const url = `/api/companies/search${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch companies: ${res.statusText}`);
      }
      
      return res.json();
    },
    enabled: isOpen || searchQuery.length > 0,
  });

  // Policy data is now fetched in handleCompanySelect and attached to company objects
  // Removing redundant query to prevent unnecessary API calls

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCompanySelect = async (company: Company, location?: CompanyLocation) => {
    console.log('🏪 CompanySelector.handleCompanySelect called:', company.name, location);
    try {
      // Fetch the policy for this specific company
      const policyResponse = await fetch(`/api/companies/${company.id}/return-policy`, {
        credentials: 'include'
      });
      
      let companyPolicy = null;
      if (policyResponse.ok) {
        companyPolicy = await policyResponse.json();
      }
      
      // Attach the policy to the company object for consistent access
      const companyWithPolicy = { ...company, returnPolicy: companyPolicy };
      
      console.log('🔔 Calling parent onCompanySelect with:', companyWithPolicy.name);
      onCompanySelect(companyWithPolicy, location, companyPolicy);
      console.log('✅ Parent callback completed, closing dropdown');
      setIsOpen(false);
      setSearchQuery("");
    } catch (error) {
      console.error('❌ Failed to fetch company policy:', error);
      // Still call onCompanySelect but without policy data
      const companyWithPolicy = { ...company, returnPolicy: null };
      console.log('🔔 Calling parent onCompanySelect (no policy) with:', companyWithPolicy.name);
      onCompanySelect(companyWithPolicy, location, null);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  // Check if return violates policy (past return window)
  const checkPolicyViolation = (policy: ReturnPolicy): { hasViolation: boolean; message: string } => {
    if (!purchaseDate || !policy) return { hasViolation: false, message: '' };

    const purchaseDateObj = new Date(purchaseDate);
    const daysPassed = Math.floor((new Date().getTime() - purchaseDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysPassed > policy.returnWindowDays) {
      return { 
        hasViolation: true, 
        message: `Return window expired: ${policy.returnWindowDays} days allowed, ${daysPassed} days have passed since purchase.` 
      };
    }
    
    return { hasViolation: false, message: '' };
  };

  const toggleCompanyExpansion = (companyId: number) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsOpen(true);
    // Clear selected company when user starts typing to allow new search
    if (selectedCompany && value !== selectedCompany.name) {
      // Don't clear selection state here, parent component manages it
    }
  };

  const categories = [
    { value: "", label: "All Categories" },
    { value: "department_store", label: "Department Stores" },
    { value: "clothing", label: "Clothing" },
    { value: "electronics", label: "Electronics" },
    { value: "home_goods", label: "Home & Garden" },
    { value: "sporting_goods", label: "Sports & Recreation" },
    { value: "pharmacy", label: "Health & Beauty" },
  ];

  const getReturnWindowColor = (days: number) => {
    if (days >= 60) return "text-green-700 bg-green-50";
    if (days >= 30) return "text-yellow-700 bg-yellow-50";
    return "text-red-700 bg-red-50";
  };

  const getRefundMethodIcon = (method: string) => {
    switch (method) {
      case 'original_payment': return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'store_credit': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'exchange_only': return <ArrowRight className="h-4 w-4 text-amber-600" />;
      default: return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatRefundMethod = (method: string) => {
    return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Company Selection Input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Select Store <span className="text-red-500">*</span>
        </Label>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            value={isOpen ? searchQuery : (selectedCompany?.name || searchQuery)}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="pl-10 pr-4 h-11"
            data-testid="input-company-search"
          />
        </div>

        {/* Category Filter Tabs */}
        {isOpen && (
          <div className="flex flex-wrap gap-1 mt-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="text-xs"
                data-testid={`filter-category-${category.value}`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 shadow-lg border-2 border-amber-100">
          <CardContent className="p-0">
            <ScrollArea className="h-full max-h-80">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto mb-2"></div>
                  Loading stores...
                </div>
              ) : companies.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No stores found matching "{searchQuery}"
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {companies.map((company: Company, index: number) => (
                    <div key={company.id} className="border-b border-gray-100 last:border-b-0">
                      {/* Company Header */}
                      <div 
                        className={`p-4 hover:bg-amber-50 transition-colors ${
                          (!company.stLouisLocations || company.stLouisLocations.length <= 1) ? 'cursor-pointer' : ''
                        }`}
                        onClick={() => {
                          if (!company.stLouisLocations || company.stLouisLocations.length <= 1) {
                            handleCompanySelect(company, company.stLouisLocations?.[0]);
                          }
                        }}
                        data-testid={`company-card-${company.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{company.name}</h3>
                              {company.isFeatured && (
                                <Star className="h-4 w-4 text-amber-500 fill-current" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                {company.category.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            
                            {company.description && (
                              <p className="text-sm text-gray-600 mb-2">{company.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {company.businessType.replace(/_/g, ' ')}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.stLouisLocations?.length || 0} locations
                              </div>
                            </div>
                          </div>
                          
                          {company.stLouisLocations && company.stLouisLocations.length > 1 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompanyExpansion(company.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {expandedCompany === company.id ? "Hide Locations" : "Show Locations"}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompanySelect(company, company.stLouisLocations?.[0]);
                              }}
                              className="text-amber-600 hover:text-amber-800"
                              data-testid={`select-company-${company.id}`}
                            >
                              Select Store
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Store Locations (for multi-location companies) */}
                      {expandedCompany === company.id && company.stLouisLocations && company.stLouisLocations.length > 1 && (
                        <div className="bg-gray-50 border-t border-gray-100">
                          {company.stLouisLocations.map((location, locationIndex) => (
                            <div
                              key={location.id || locationIndex}
                              onClick={() => handleCompanySelect(company, location)}
                              className="p-3 pl-8 hover:bg-amber-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                              data-testid={`location-option-${company.id}-${locationIndex}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{location.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                                  {(location.city || location.state || location.zipCode || location.acceptsReturns) && (
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                      {(location.city || location.state || location.zipCode) && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {location.city && location.state && location.zipCode 
                                            ? `${location.city}, ${location.state} ${location.zipCode}`
                                            : (location.city || location.state || location.zipCode)
                                          }
                                        </div>
                                      )}
                                      {location.acceptsReturns && (
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                          Accepts Returns
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Single Location Company - Auto-select */}
                      {(!company.stLouisLocations || company.stLouisLocations.length <= 1) && (
                        <div className="hidden" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Selected Company Details */}
      {selectedCompany && (
        <Card className="mt-4 border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-700" />
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {selectedCompany.name}
                    {selectedCompany.isFeatured && (
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                    )}
                  </h3>
                  {selectedLocation && (
                    <p className="text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {selectedLocation.name} - {selectedLocation.address}
                    </p>
                  )}
                </div>
              </div>
              
              {selectedCompany?.returnPolicy && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPolicyModal(true)}
                  className="text-xs"
                >
                  View Return Policy
                </Button>
              )}
            </div>

            {/* Only show policy violations/warnings - use selectedCompany's fresh policy data */}
            {selectedCompany?.returnPolicy && (() => {
              const violation = checkPolicyViolation(selectedCompany.returnPolicy);
              if (violation.hasViolation) {
                return (
                  <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Return Window Expired</p>
                        <p className="text-sm text-red-700 mt-1">{violation.message}</p>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </CardContent>
        </Card>
      )}

      {/* Return Policy Modal */}
      {showPolicyModal && selectedCompany?.returnPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Return Policy - {selectedCompany?.name}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPolicyModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Return Window */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Return Window:</span>
                      <Badge className={getReturnWindowColor(selectedCompany.returnPolicy.returnWindowDays)}>
                        {selectedCompany.returnPolicy.returnWindowDays} days
                      </Badge>
                    </div>

                    {/* Refund Method */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Refund Method:</span>
                      <div className="flex items-center gap-1">
                        {getRefundMethodIcon(selectedCompany.returnPolicy.refundMethod)}
                        <span className="font-medium">
                          {formatRefundMethod(selectedCompany.returnPolicy.refundMethod)}
                        </span>
                      </div>
                    </div>

                    {/* Receipt Required */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Receipt Required:</span>
                      {selectedCompany.returnPolicy.requiresReceipt ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>No</span>
                        </div>
                      )}
                    </div>

                    {/* Tags Required */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tags Required:</span>
                      {selectedCompany.returnPolicy.requiresOriginalTags ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>No</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Excluded Categories */}
                  {selectedCompany.returnPolicy.excludedCategories && selectedCompany.returnPolicy.excludedCategories.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Items that cannot be returned:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCompany.returnPolicy.excludedCategories.map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-red-700 border-red-200">
                            {category.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Terms */}
                  {selectedCompany.returnPolicy.additionalTerms && (
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Additional Terms:</strong> {selectedCompany.returnPolicy.additionalTerms}
                      </p>
                    </div>
                  )}

                  {/* Restocking Fee Warning */}
                  {selectedCompany.returnPolicy.chargesRestockingFee && (
                    <div className="p-3 bg-red-100 rounded-lg">
                      <p className="text-sm text-red-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <strong>Restocking Fee:</strong> {selectedCompany.returnPolicy.restockingFeePercent}% fee applies to returned items
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}