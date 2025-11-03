import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Save, Plus, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";

const KCSE_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
const ALEVEL_GRADES = ['A*', 'A', 'B', 'C', 'D', 'E'];

export function AcademicProfile() {
  const { toast } = useToast();
  const { data: user } = useQuery<User>({ queryKey: ["/api/auth/user"] });

  const [examType, setExamType] = useState<'kcse' | 'alevel' | 'both'>(
    user?.academicScores?.examType || 'kcse'
  );
  const [kcseGrade, setKcseGrade] = useState(user?.academicScores?.kcseGrade || '');
  const [kcsePoints, setKcsePoints] = useState(user?.academicScores?.kcsePoints?.toString() || '');
  const [kcseSubjects, setKcseSubjects] = useState<{ subject: string; grade: string }[]>(
    user?.academicScores?.kcseSubjects || []
  );
  const [aLevelGrades, setALevelGrades] = useState<{ subject: string; grade: string }[]>(
    user?.academicScores?.aLevelGrades || []
  );
  const [aLevelPoints, setALevelPoints] = useState(user?.academicScores?.aLevelPoints?.toString() || '');

  const updateScoresMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/auth/user/academic-scores", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Academic scores updated",
        description: "Your academic information has been saved successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update academic scores. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const academicData = {
      examType,
      kcseGrade: examType === 'kcse' || examType === 'both' ? kcseGrade : undefined,
      kcsePoints: examType === 'kcse' || examType === 'both' ? Number(kcsePoints) || undefined : undefined,
      kcseSubjects: examType === 'kcse' || examType === 'both' ? kcseSubjects : undefined,
      aLevelGrades: examType === 'alevel' || examType === 'both' ? aLevelGrades : undefined,
      aLevelPoints: examType === 'alevel' || examType === 'both' ? Number(aLevelPoints) || undefined : undefined,
    };

    updateScoresMutation.mutate(academicData);
  };

  const addKcseSubject = () => {
    setKcseSubjects([...kcseSubjects, { subject: '', grade: '' }]);
  };

  const updateKcseSubject = (index: number, field: 'subject' | 'grade', value: string) => {
    const updated = [...kcseSubjects];
    updated[index][field] = value;
    setKcseSubjects(updated);
  };

  const removeKcseSubject = (index: number) => {
    setKcseSubjects(kcseSubjects.filter((_, i) => i !== index));
  };

  const addALevelSubject = () => {
    setALevelGrades([...aLevelGrades, { subject: '', grade: '' }]);
  };

  const updateALevelSubject = (index: number, field: 'subject' | 'grade', value: string) => {
    const updated = [...aLevelGrades];
    updated[index][field] = value;
    setALevelGrades(updated);
  };

  const removeALevelSubject = (index: number) => {
    setALevelGrades(aLevelGrades.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <CardTitle className="font-heading">Academic Profile</CardTitle>
        </div>
        <CardDescription>
          Add your KCSE or A-Level scores to help match universities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exam Type Selection */}
        <div className="space-y-2">
          <Label>Examination System</Label>
          <Select value={examType} onValueChange={(value: any) => setExamType(value)}>
            <SelectTrigger data-testid="select-exam-type">
              <SelectValue placeholder="Select exam system" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kcse">KCSE (Kenya Certificate of Secondary Education)</SelectItem>
              <SelectItem value="alevel">A-Levels</SelectItem>
              <SelectItem value="both">Both KCSE and A-Levels</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KCSE Section */}
        {(examType === 'kcse' || examType === 'both') && (
          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">KCSE Results</h3>
              <Badge variant="secondary">Kenya</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kcse-grade">Overall Grade</Label>
                <Select value={kcseGrade} onValueChange={setKcseGrade}>
                  <SelectTrigger id="kcse-grade" data-testid="select-kcse-grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {KCSE_GRADES.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kcse-points">Total Points</Label>
                <Input
                  id="kcse-points"
                  type="number"
                  placeholder="e.g., 84"
                  value={kcsePoints}
                  onChange={(e) => setKcsePoints(e.target.value)}
                  data-testid="input-kcse-points"
                />
              </div>
            </div>

            {/* KCSE Subject Grades */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Subject Grades (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addKcseSubject}
                  className="gap-1"
                  data-testid="button-add-kcse-subject"
                >
                  <Plus className="h-3 w-3" />
                  Add Subject
                </Button>
              </div>
              {kcseSubjects.map((subject, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Subject name"
                    value={subject.subject}
                    onChange={(e) => updateKcseSubject(index, 'subject', e.target.value)}
                    data-testid={`input-kcse-subject-${index}`}
                  />
                  <Select
                    value={subject.grade}
                    onValueChange={(value) => updateKcseSubject(index, 'grade', value)}
                  >
                    <SelectTrigger className="w-32" data-testid={`select-kcse-subject-grade-${index}`}>
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {KCSE_GRADES.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKcseSubject(index)}
                    data-testid={`button-remove-kcse-subject-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* A-Level Section */}
        {(examType === 'alevel' || examType === 'both') && (
          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">A-Level Results</h3>
              <Badge variant="secondary">International</Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alevel-points">UCAS Points (Optional)</Label>
              <Input
                id="alevel-points"
                type="number"
                placeholder="e.g., 120"
                value={aLevelPoints}
                onChange={(e) => setALevelPoints(e.target.value)}
                data-testid="input-alevel-points"
              />
            </div>

            {/* A-Level Subject Grades */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Subject Grades</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addALevelSubject}
                  className="gap-1"
                  data-testid="button-add-alevel-subject"
                >
                  <Plus className="h-3 w-3" />
                  Add Subject
                </Button>
              </div>
              {aLevelGrades.map((subject, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Subject name"
                    value={subject.subject}
                    onChange={(e) => updateALevelSubject(index, 'subject', e.target.value)}
                    data-testid={`input-alevel-subject-${index}`}
                  />
                  <Select
                    value={subject.grade}
                    onValueChange={(value) => updateALevelSubject(index, 'grade', value)}
                  >
                    <SelectTrigger className="w-32" data-testid={`select-alevel-subject-grade-${index}`}>
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALEVEL_GRADES.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeALevelSubject(index)}
                    data-testid={`button-remove-alevel-subject-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updateScoresMutation.isPending}
          className="gap-2"
          data-testid="button-save-academic-scores"
        >
          <Save className="h-4 w-4" />
          {updateScoresMutation.isPending ? "Saving..." : "Save Academic Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}
