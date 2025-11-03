import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Sparkles,
  Save,
  FileText,
  Lightbulb,
  BookOpen,
  Target
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Essay } from "@shared/schema";
import { Link } from "wouter";

export default function EssayEditor() {
  const [, params] = useRoute("/essays/:id");
  const essayId = params?.id;
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const { data: essay, isLoading } = useQuery<Essay>({
    queryKey: ["/api/essays", essayId],
    enabled: !!essayId,
  });

  const saveEssayMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      return await apiRequest("PATCH", `/api/essays/${essayId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/essays", essayId] });
      queryClient.invalidateQueries({ queryKey: ["/api/essays"] });
      setHasUnsavedChanges(false);
      toast({
        title: "Essay saved",
        description: "Your changes have been saved successfully",
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
        description: "Failed to save essay. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getFeedbackMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/essays/${essayId}/feedback`, { content });
    },
    onSuccess: (data) => {
      setFeedback(data);
      toast({
        title: "Feedback generated",
        description: "AI feedback is ready for your essay",
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
        description: "Failed to generate feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write some content before saving",
        variant: "destructive",
      });
      return;
    }
    saveEssayMutation.mutate({ content });
  };

  const handleGetFeedback = () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write some content before getting feedback",
        variant: "destructive",
      });
      return;
    }
    getFeedbackMutation.mutate();
  };

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading essay...</p>
        </div>
      </div>
    );
  }

  if (!essay) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-xl mb-2">Essay not found</h3>
            <p className="text-muted-foreground mb-6">
              The essay you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button asChild>
              <Link href="/essays">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Essays
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back-to-essays">
            <Link href="/essays">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl">
              {essay.title}
            </h1>
            {essay.prompt && (
              <p className="text-muted-foreground mt-1">{essay.prompt}</p>
            )}
          </div>
        </div>
        <Badge variant="secondary">v{essay.currentVersion || 1}</Badge>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading">Essay Content</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing your essay here..."
                className="min-h-[400px] resize-none"
                data-testid="textarea-essay-content"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saveEssayMutation.isPending}
                  className="gap-2"
                  data-testid="button-save-essay"
                >
                  <Save className="h-4 w-4" />
                  {saveEssayMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button 
                  onClick={handleGetFeedback}
                  disabled={getFeedbackMutation.isPending || !content.trim()}
                  variant="secondary"
                  className="gap-2"
                  data-testid="button-get-feedback"
                >
                  <Sparkles className="h-4 w-4" />
                  {getFeedbackMutation.isPending ? "Generating..." : "Get AI Feedback"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Panel */}
        <div className="space-y-4">
          {feedback ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Feedback
                </CardTitle>
                <CardDescription>
                  Personalized suggestions to improve your essay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score */}
                {feedback.overallScore && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Score</span>
                      <Badge variant={feedback.overallScore >= 8 ? "default" : "secondary"}>
                        {feedback.overallScore}/10
                      </Badge>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Tone */}
                {feedback.tone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Tone
                    </div>
                    <p className="text-sm text-muted-foreground">{feedback.tone}</p>
                  </div>
                )}

                {/* Clarity */}
                {feedback.clarity && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <Target className="h-4 w-4 text-primary" />
                      Clarity
                    </div>
                    <p className="text-sm text-muted-foreground">{feedback.clarity}</p>
                  </div>
                )}

                {/* Storytelling */}
                {feedback.storytelling && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <FileText className="h-4 w-4 text-primary" />
                      Storytelling
                    </div>
                    <p className="text-sm text-muted-foreground">{feedback.storytelling}</p>
                  </div>
                )}

                <Separator />

                {/* Suggestions */}
                {feedback.suggestions && feedback.suggestions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-medium">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      Suggestions
                    </div>
                    <ul className="space-y-2">
                      {feedback.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  No feedback yet
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Write some content and click "Get AI Feedback" to receive personalized suggestions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
