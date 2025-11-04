import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search,
  GraduationCap,
  MapPin,
  DollarSign,
  ExternalLink,
  Circle,
  TrendingUp,
  Star,
  Info
} from "lucide-react";
import { Link } from "wouter";
import type { University, Scholarship, User } from "@shared/schema";

export default function Universities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [aidFilter, setAidFilter] = useState<string>("all");
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: universities, isLoading: loadingUniversities } = useQuery<University[]>({
    queryKey: ["/api/universities"],
  });

  const { data: scholarships, isLoading: loadingScholarships } = useQuery<Scholarship[]>({
    queryKey: ["/api/scholarships"],
  });

  const isRecommended = (uni: University) => {
    if (!user?.intendedMajor) return false;
    
    return uni.majorsOffered?.some(major => 
      major.toLowerCase().includes(user.intendedMajor!.toLowerCase()) ||
      user.intendedMajor!.toLowerCase().includes(major.toLowerCase())
    ) || false;
  };

  const filteredUniversities = universities?.filter(uni => {
    const matchesSearch = !searchQuery || 
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || uni.type === typeFilter;
    
    const matchesAid = aidFilter === "all" || 
      (aidFilter === "full-need" && uni.meetFullNeed) ||
      (aidFilter === "aid-available" && uni.financialAidAvailable);
    
    const matchesRecommended = !showRecommendedOnly || isRecommended(uni);
    
    return matchesSearch && matchesType && matchesAid && matchesRecommended;
  }).sort((a, b) => {
    if (!user?.intendedMajor) return 0;
    const aRecommended = isRecommended(a);
    const bRecommended = isRecommended(b);
    if (aRecommended && !bRecommended) return -1;
    if (!aRecommended && bRecommended) return 1;
    return 0;
  });

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
          University Matcher
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover universities that match your profile and goals
        </p>
      </div>

      {/* Recommendation prompt */}
      {!user?.intendedMajor && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium mb-1">Get Personalized Recommendations</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Select your intended major in your profile to see universities that offer programs matching your interests.
                </p>
                <Link href="/profile">
                  <Button size="sm" data-testid="button-set-major">
                    Set Your Major
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended filter toggle */}
      {user?.intendedMajor && (
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Recommended for {user.intendedMajor}</p>
                  <p className="text-sm text-muted-foreground">
                    {filteredUniversities?.filter(isRecommended).length || 0} universities match your major
                  </p>
                </div>
              </div>
              <Button
                variant={showRecommendedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRecommendedOnly(!showRecommendedOnly)}
                data-testid="button-toggle-recommended"
              >
                {showRecommendedOnly ? "Show All" : "Recommended Only"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search universities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-universities"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="select-type-filter">
                <SelectValue placeholder="University Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="liberal arts">Liberal Arts</SelectItem>
                <SelectItem value="research">Research University</SelectItem>
                <SelectItem value="technical">Technical/Engineering</SelectItem>
              </SelectContent>
            </Select>
            <Select value={aidFilter} onValueChange={setAidFilter}>
              <SelectTrigger data-testid="select-aid-filter">
                <SelectValue placeholder="Financial Aid" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                <SelectItem value="full-need">Meets Full Need</SelectItem>
                <SelectItem value="aid-available">Aid Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Universities Grid */}
      {loadingUniversities ? (
        <div className="text-center py-12">
          <Circle className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : !filteredUniversities || filteredUniversities.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center max-w-md mx-auto">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-heading font-semibold text-xl mb-2">
                {searchQuery || typeFilter !== "all" || aidFilter !== "all" 
                  ? "No universities match your filters"
                  : "No universities available"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== "all" || aidFilter !== "all"
                  ? "Try adjusting your filters to see more results"
                  : "University data will be available soon"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((uni) => (
            <Card key={uni.id} className="hover-elevate flex flex-col" data-testid={`card-university-${uni.id}`}>
              {uni.imageUrl && (
                <div className="aspect-video w-full bg-muted overflow-hidden">
                  <img 
                    src={uni.imageUrl} 
                    alt={uni.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-heading text-lg line-clamp-2 flex-1">{uni.name}</CardTitle>
                  {isRecommended(uni) && (
                    <Badge className="bg-primary text-primary-foreground flex-shrink-0" data-testid={`badge-recommended-${uni.id}`}>
                      <Star className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
                {uni.location && (
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {uni.location}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {uni.type && (
                    <Badge variant="secondary">{uni.type}</Badge>
                  )}
                  {uni.meetFullNeed && (
                    <Badge variant="default">Meets Full Need</Badge>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  {uni.tuitionUSD && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Tuition
                      </span>
                      <span className="font-medium">{formatCurrency(uni.tuitionUSD)}</span>
                    </div>
                  )}
                  {uni.acceptanceRate && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Acceptance
                      </span>
                      <span className="font-medium">{uni.acceptanceRate}%</span>
                    </div>
                  )}
                </div>

                {uni.websiteUrl && (
                  <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                    <a href={uni.websiteUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-university-${uni.id}`}>
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Scholarships Section */}
      <div className="pt-8">
        <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">
          Available Scholarships
        </h2>
        <p className="text-muted-foreground mb-6">
          Funding opportunities for Kenyan students
        </p>

        {loadingScholarships ? (
          <div className="text-center py-12">
            <Circle className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : !scholarships || scholarships.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                Scholarship information coming soon
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {scholarships.map((scholarship) => (
              <Card key={scholarship.id} className="hover-elevate" data-testid={`card-scholarship-${scholarship.id}`}>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">{scholarship.name}</CardTitle>
                  {scholarship.organization && (
                    <CardDescription>{scholarship.organization}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {scholarship.needBased && (
                      <Badge variant="secondary">Need-Based</Badge>
                    )}
                    {scholarship.meritBased && (
                      <Badge variant="secondary">Merit-Based</Badge>
                    )}
                    {scholarship.forKenyanStudents && (
                      <Badge variant="default">For Kenyan Students</Badge>
                    )}
                  </div>

                  {scholarship.amountUSD && (
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(scholarship.amountUSD)}
                    </div>
                  )}

                  {scholarship.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {scholarship.description}
                    </p>
                  )}

                  {scholarship.applicationUrl && (
                    <Button variant="outline" size="sm" className="w-full gap-2" asChild data-testid={`button-apply-scholarship-${scholarship.id}`}>
                      <a href={scholarship.applicationUrl} target="_blank" rel="noopener noreferrer">
                        Apply Now
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
