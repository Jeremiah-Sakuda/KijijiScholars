import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, GraduationCap } from "lucide-react";
import type { User as UserType } from "@shared/schema";

const commonMajors = [
  "Computer Science",
  "Engineering",
  "Business Administration",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Economics",
  "Psychology",
  "Political Science",
  "Medicine",
  "Nursing",
  "Law",
  "Education",
  "Architecture",
  "Environmental Science",
  "International Relations",
  "Communications",
  "English",
  "History",
  "Sociology",
  "Anthropology",
  "Philosophy",
  "Fine Arts",
  "Music",
  "Other",
];

export default function Profile() {
  const { toast } = useToast();
  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  const [selectedMajor, setSelectedMajor] = useState<string>("");

  useEffect(() => {
    if (user?.intendedMajor) {
      setSelectedMajor(user.intendedMajor);
    }
  }, [user?.intendedMajor]);

  const updateMajorMutation = useMutation({
    mutationFn: async (intendedMajor: string) => {
      const res = await apiRequest("PATCH", "/api/auth/user/intended-major", { intendedMajor });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Your intended major has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update intended major",
        variant: "destructive",
      });
    },
  });

  const handleSaveMajor = () => {
    if (selectedMajor) {
      updateMajorMutation.mutate(selectedMajor);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
          Your Profile
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your academic profile and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Personal Information</CardTitle>
          </div>
          <CardDescription>
            Your basic profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Name</Label>
              <p className="text-base font-medium" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="text-base font-medium" data-testid="text-user-email">
                {user?.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle>Academic Interests</CardTitle>
          </div>
          <CardDescription>
            Select your intended major to get personalized university recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="major-select">Intended Major</Label>
            <Select
              value={selectedMajor}
              onValueChange={setSelectedMajor}
            >
              <SelectTrigger id="major-select" data-testid="select-major">
                <SelectValue placeholder="Select your intended major" />
              </SelectTrigger>
              <SelectContent>
                {commonMajors.map((major) => (
                  <SelectItem key={major} value={major}>
                    {major}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSaveMajor}
            disabled={!selectedMajor || selectedMajor === user?.intendedMajor || updateMajorMutation.isPending}
            data-testid="button-save-major"
          >
            {updateMajorMutation.isPending ? "Saving..." : "Save Major"}
          </Button>
        </CardContent>
      </Card>

      {user?.intendedMajor && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium mb-1">Personalized Recommendations Ready</p>
                <p className="text-sm text-muted-foreground">
                  Visit the Universities page to see schools that offer programs in {user.intendedMajor}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
