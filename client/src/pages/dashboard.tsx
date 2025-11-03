import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Map, 
  FileText, 
  GraduationCap, 
  Trophy,
  ArrowRight,
  CheckCircle2,
  Circle
} from "lucide-react";
import { Link } from "wouter";
import type { RoadmapProgress, UserAchievement, Essay } from "@shared/schema";
import { AcademicProfile } from "@/components/AcademicProfile";

export default function Dashboard() {
  const { data: roadmapData, isLoading: loadingRoadmap } = useQuery<RoadmapProgress[]>({
    queryKey: ["/api/roadmap"],
  });

  const { data: essays } = useQuery<Essay[]>({
    queryKey: ["/api/essays"],
  });

  const { data: achievements } = useQuery<UserAchievement[]>({
    queryKey: ["/api/achievements/user"],
  });

  const completedPhases = roadmapData?.filter(p => p.completed).length || 0;
  const totalPhases = roadmapData?.length || 7;
  const progressPercentage = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  const getNextAction = () => {
    if (!roadmapData || roadmapData.length === 0) {
      return {
        title: "Start Your Journey",
        description: "Begin by exploring the application roadmap",
        icon: Map,
        link: "/roadmap",
        linkText: "View Roadmap"
      };
    }

    const incompletePhase = roadmapData.find(p => !p.completed);
    if (incompletePhase) {
      return {
        title: "Continue Your Roadmap",
        description: `Work on: ${incompletePhase.phase.replace('_', ' ')}`,
        icon: Map,
        link: "/roadmap",
        linkText: "Continue"
      };
    }

    if (!essays || essays.length === 0) {
      return {
        title: "Start Writing Your Essay",
        description: "Use AI-powered feedback to craft a compelling story",
        icon: FileText,
        link: "/essays",
        linkText: "Write Essay"
      };
    }

    return {
      title: "Find Your Universities",
      description: "Discover schools that match your profile",
      icon: GraduationCap,
      link: "/universities",
      linkText: "Explore Universities"
    };
  };

  const nextAction = getNextAction();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-lg">
          Let's continue building your path to U.S. colleges
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Your Progress</CardTitle>
          <CardDescription>
            {completedPhases} of {totalPhases} roadmap phases completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-3" data-testid="progress-roadmap" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
              {progressPercentage === 100 && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  All phases complete!
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout for Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Essays Card */}
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Essays</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-essay-count">{essays?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {essays?.length === 0 ? "Start your first essay" : "Drafts in progress"}
            </p>
          </CardContent>
        </Card>

        {/* Roadmap Card */}
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phases Complete</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-phases-complete">
              {completedPhases}/{totalPhases}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Application roadmap
            </p>
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-achievement-count">{achievements?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {achievements?.length === 0 ? "Unlock your first badge" : "Milestones reached"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Action Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <nextAction.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="font-heading mb-2">{nextAction.title}</CardTitle>
              <CardDescription className="text-base">{nextAction.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild data-testid="button-next-action">
            <Link href={nextAction.link}>
              {nextAction.linkText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity / Empty State */}
      {loadingRoadmap ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Circle className="h-8 w-8 animate-spin mx-auto mb-4" />
              Loading your progress...
            </div>
          </CardContent>
        </Card>
      ) : !roadmapData || roadmapData.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center max-w-md mx-auto">
              <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-heading font-semibold text-xl mb-2">
                Ready to begin?
              </h3>
              <p className="text-muted-foreground mb-6">
                Start your journey by exploring the step-by-step application roadmap designed for Kenyan students.
              </p>
              <Button asChild data-testid="button-start-roadmap">
                <Link href="/roadmap">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Academic Profile */}
      <AcademicProfile />
    </div>
  );
}
