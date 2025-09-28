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
  stLouisLocations: any[];
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
  onCompanySelect: (company: Company, policy?: ReturnPolicy) => void;
  className?: string;
  placeholder?: string;
  showReturnPolicyDetails?: boolean;
}

export default function CompanySelector({
  selectedCompany,
  onCompanySelect,
  className = "",
  placeholder = "Search for a store...",
  showReturnPolicyDetails = true
}: CompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch companies based on search query
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['/api/companies/search', { q: searchQuery, category: selectedCategory }],
    enabled: isOpen || searchQuery.length > 0,
  });

  // Fetch return policy for selected company
  const { data: returnPolicy } = useQuery({
    queryKey: ['/api/companies', selectedCompany?.id, 'return-policy'],
    enabled: !!selectedCompany && showReturnPolicyDetails,
  });

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

  const handleCompanySelect = (company: Company) => {
    onCompanySelect(company, returnPolicy);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsOpen(true);
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
      case 'exchange_only': return <ArrowRight className="h-4 w-4 text-orange-600" />;
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
            value={selectedCompany?.name || searchQuery}
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
                    <div
                      key={company.id}
                      onClick={() => handleCompanySelect(company)}
                      className="p-4 hover:bg-amber-50 cursor-pointer transition-colors"
                      data-testid={`company-option-${company.id}`}
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
                            {company.websiteUrl && (
                              <div className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                Website
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
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
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-700" />
              {selectedCompany.name}
              {selectedCompany.isFeatured && (
                <Star className="h-4 w-4 text-amber-500 fill-current" />
              )}
            </CardTitle>
            {selectedCompany.description && (
              <CardDescription>{selectedCompany.description}</CardDescription>
            )}
          </CardHeader>

          {/* Return Policy Details */}
          {showReturnPolicyDetails && returnPolicy && (
            <CardContent className="pt-0">
              <Separator className="mb-4" />
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Return Policy Summary
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Return Window */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Return Window:</span>
                    <Badge className={getReturnWindowColor(returnPolicy.returnWindowDays)}>
                      {returnPolicy.returnWindowDays} days
                    </Badge>
                  </div>

                  {/* Refund Method */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Refund Method:</span>
                    <div className="flex items-center gap-1">
                      {getRefundMethodIcon(returnPolicy.refundMethod)}
                      <span className="font-medium">
                        {formatRefundMethod(returnPolicy.refundMethod)}
                      </span>
                    </div>
                  </div>

                  {/* Receipt Required */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Receipt Required:</span>
                    {returnPolicy.requiresReceipt ? (
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
                    {returnPolicy.requiresOriginalTags ? (
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
                {returnPolicy.excludedCategories && returnPolicy.excludedCategories.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Items that cannot be returned:</p>
                    <div className="flex flex-wrap gap-1">
                      {returnPolicy.excludedCategories.map((category, index) => (
                        <Badge key={index} variant="outline" className="text-xs text-red-700 border-red-200">
                          {category.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Terms */}
                {returnPolicy.additionalTerms && (
                  <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Additional Terms:</strong> {returnPolicy.additionalTerms}
                    </p>
                  </div>
                )}

                {/* Restocking Fee Warning */}
                {returnPolicy.chargesRestockingFee && (
                  <div className="mt-3 p-3 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <strong>Restocking Fee:</strong> {returnPolicy.restockingFeePercent}% fee applies to returned items
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}