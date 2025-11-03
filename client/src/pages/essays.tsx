import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus,
  FileText,
  Sparkles,
  Clock,
  ArrowRight,
  Circle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Essay, EssayVersion } from "@shared/schema";
import { Link } from "wouter";

export default function Essays() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEssayTitle, setNewEssayTitle] = useState("");
  const [newEssayPrompt, setNewEssayPrompt] = useState("");

  const { data: essays, isLoading } = useQuery<Essay[]>({
    queryKey: ["/api/essays"],
  });

  const createEssayMutation = useMutation({
    mutationFn: async (data: { title: string; prompt?: string }) => {
      return await apiRequest("POST", "/api/essays", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/essays"] });
      setDialogOpen(false);
      setNewEssayTitle("");
      setNewEssayPrompt("");
      toast({
        title: "Essay created",
        description: "Your new essay has been created successfully",
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
        description: "Failed to create essay. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateEssay = () => {
    if (!newEssayTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your essay",
        variant: "destructive",
      });
      return;
    }

    createEssayMutation.mutate({
      title: newEssayTitle,
      prompt: newEssayPrompt || undefined,
    });
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
            Essay Lab
          </h1>
          <p className="text-muted-foreground text-lg">
            Craft compelling essays with AI-powered feedback
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-new-essay">
              <Plus className="h-4 w-4" />
              New Essay
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Create New Essay</DialogTitle>
              <DialogDescription>
                Start a new essay draft with AI-powered feedback
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="essay-title" className="text-sm font-medium">
                  Essay Title
                </label>
                <Input
                  id="essay-title"
                  placeholder="e.g., Common App Personal Statement"
                  value={newEssayTitle}
                  onChange={(e) => setNewEssayTitle(e.target.value)}
                  data-testid="input-essay-title"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="essay-prompt" className="text-sm font-medium">
                  Prompt (Optional)
                </label>
                <Textarea
                  id="essay-prompt"
                  placeholder="Enter the essay prompt or question..."
                  value={newEssayPrompt}
                  onChange={(e) => setNewEssayPrompt(e.target.value)}
                  rows={4}
                  data-testid="input-essay-prompt"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  data-testid="button-cancel-essay"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEssay}
                  disabled={createEssayMutation.isPending}
                  data-testid="button-create-essay"
                >
                  {createEssayMutation.isPending ? "Creating..." : "Create Essay"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Essay Cards */}
      {isLoading ? (
        <div className="text-center py-12">
          <Circle className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : !essays || essays.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center max-w-md mx-auto">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">
                No essays yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start writing your first college essay and get AI-powered feedback to help you craft a compelling story.
              </p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2" data-testid="button-create-first-essay">
                <Plus className="h-4 w-4" />
                Create Your First Essay
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {essays.map((essay) => (
            <Card key={essay.id} className="hover-elevate" data-testid={`card-essay-${essay.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="font-heading truncate">{essay.title}</CardTitle>
                    {essay.prompt && (
                      <CardDescription className="line-clamp-2 mt-2">
                        {essay.prompt}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0">
                    v{essay.currentVersion || 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(essay.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Feedback Available</span>
                  </div>
                </div>
                <Button asChild className="w-full gap-2" data-testid={`button-edit-essay-${essay.id}`}>
                  <Link href={`/essays/${essay.id}`}>
                    Continue Writing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
