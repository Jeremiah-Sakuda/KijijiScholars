import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  CheckCircle2, 
  Circle, 
  Search,
  FileText,
  Users,
  DollarSign,
  MessageSquare,
  Plane
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { RoadmapProgress } from "@shared/schema";

const roadmapPhases = [
  {
    id: "research",
    title: "Researching Schools & Majors",
    icon: Search,
    description: "Discover universities that match your academic goals and interests",
    checklist: [
      "Research U.S. university types (liberal arts, research universities, etc.)",
      "Identify potential majors and career paths",
      "Create a list of 15-20 potential universities",
      "Review admission requirements for each school",
      "Check KCSE score requirements and GPA equivalents"
    ]
  },
  {
    id: "profile_building",
    title: "Building Your Profile",
    icon: Users,
    description: "Strengthen your extracurricular and leadership experiences",
    checklist: [
      "Document all extracurricular activities and leadership roles",
      "Gather volunteer experience and community service records",
      "Compile academic achievements and awards",
      "Request recommendation letters from teachers",
      "Prepare activity resume for applications"
    ]
  },
  {
    id: "essay_writing",
    title: "Writing Personal Essays",
    icon: FileText,
    description: "Craft compelling essays that showcase your unique story",
    checklist: [
      "Brainstorm essay topics and personal stories",
      "Write Common App personal statement (650 words)",
      "Draft supplemental essays for each university",
      "Get feedback from mentors and peers",
      "Polish and finalize all essay drafts"
    ]
  },
  {
    id: "applications",
    title: "Submitting Applications",
    icon: CheckCircle2,
    description: "Complete and submit your college applications",
    checklist: [
      "Create Common App and Coalition App accounts",
      "Complete application forms with accurate information",
      "Upload required documents (transcripts, essays)",
      "Pay or request fee waivers for application fees",
      "Submit applications before deadlines"
    ]
  },
  {
    id: "financial_aid",
    title: "Applying for Financial Aid",
    icon: DollarSign,
    description: "Secure funding for your education",
    checklist: [
      "Complete CSS Profile for institutional aid",
      "Research scholarship opportunities for international students",
      "Write compelling financial need statements",
      "Submit all financial aid forms before deadlines",
      "Follow up on scholarship applications"
    ]
  },
  {
    id: "interviews",
    title: "Interview Preparation",
    icon: MessageSquare,
    description: "Prepare for alumni and admissions interviews",
    checklist: [
      "Research common interview questions",
      "Practice answering questions about yourself",
      "Prepare questions to ask interviewers",
      "Schedule mock interviews with mentors",
      "Follow up with thank-you emails after interviews"
    ]
  },
  {
    id: "visa_prep",
    title: "Visa & Travel Preparation",
    icon: Plane,
    description: "Get ready for your journey to the U.S.",
    checklist: [
      "Receive I-20 form from your chosen university",
      "Pay SEVIS fee and schedule visa interview",
      "Prepare visa interview documents",
      "Attend U.S. embassy visa interview",
      "Arrange housing and travel to the U.S."
    ]
  }
];

export default function Roadmap() {
  const { toast } = useToast();
  const [expandedPhases, setExpandedPhases] = useState<string[]>(["research"]);

  const { data: progress, isLoading } = useQuery<RoadmapProgress[]>({
    queryKey: ["/api/roadmap"],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ phaseId, checklist, completed }: { 
      phaseId: string; 
      checklist: { item: string; completed: boolean }[];
      completed: boolean;
    }) => {
      return await apiRequest("POST", "/api/roadmap", { 
        phase: phaseId, 
        checklist,
        completed
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap"] });
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
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getPhaseProgress = (phaseId: string) => {
    return progress?.find(p => p.phase === phaseId);
  };

  const handleChecklistToggle = (phaseId: string, itemIndex: number) => {
    const phaseProgress = getPhaseProgress(phaseId);
    const phase = roadmapPhases.find(p => p.id === phaseId);
    
    if (!phase) return;

    const currentChecklist = phaseProgress?.checklist || phase.checklist.map(item => ({
      item,
      completed: false
    }));

    const updatedChecklist = currentChecklist.map((item, index) => 
      index === itemIndex ? { ...item, completed: !item.completed } : item
    );

    const allCompleted = updatedChecklist.every(item => item.completed);

    updateProgressMutation.mutate({
      phaseId,
      checklist: updatedChecklist,
      completed: allCompleted
    });
  };

  const completedPhases = progress?.filter(p => p.completed).length || 0;
  const totalPhases = roadmapPhases.length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
          Application Roadmap
        </h1>
        <p className="text-muted-foreground text-lg">
          Your step-by-step guide to U.S. college applications
        </p>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading">Overall Progress</CardTitle>
              <CardDescription>
                {completedPhases} of {totalPhases} phases completed
              </CardDescription>
            </div>
            <div className="text-3xl font-bold text-primary" data-testid="text-progress-percentage">
              {Math.round((completedPhases / totalPhases) * 100)}%
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Roadmap Phases */}
      <Accordion 
        type="multiple" 
        value={expandedPhases}
        onValueChange={setExpandedPhases}
        className="space-y-4"
      >
        {roadmapPhases.map((phase, index) => {
          const phaseProgress = getPhaseProgress(phase.id);
          const checklist = phaseProgress?.checklist || phase.checklist.map(item => ({
            item,
            completed: false
          }));
          const completedItems = checklist.filter(item => item.completed).length;
          const isCompleted = phaseProgress?.completed || false;
          const Icon = phase.icon;

          return (
            <AccordionItem 
              key={phase.id} 
              value={phase.id}
              className="border rounded-lg overflow-hidden"
            >
              <Card className={isCompleted ? "border-primary/50" : ""}>
                <AccordionTrigger 
                  className="hover:no-underline px-6 py-4"
                  data-testid={`accordion-phase-${phase.id}`}
                >
                  <div className="flex items-start gap-4 w-full text-left">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-lg">
                          {index + 1}. {phase.title}
                        </h3>
                        {isCompleted && (
                          <Badge variant="default" className="ml-2">Complete</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {phase.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{completedItems}/{checklist.length} tasks</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 px-6 pb-6">
                    <div className="space-y-3">
                      {checklist.map((item, itemIndex) => (
                        <div 
                          key={itemIndex} 
                          className="flex items-start gap-3 p-3 rounded-lg hover-elevate"
                        >
                          <Checkbox
                            id={`${phase.id}-${itemIndex}`}
                            checked={item.completed}
                            onCheckedChange={() => handleChecklistToggle(phase.id, itemIndex)}
                            disabled={updateProgressMutation.isPending}
                            data-testid={`checkbox-${phase.id}-${itemIndex}`}
                          />
                          <label
                            htmlFor={`${phase.id}-${itemIndex}`}
                            className={`flex-1 text-sm leading-relaxed cursor-pointer ${
                              item.completed ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {item.item}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>

      {isLoading && (
        <div className="text-center py-12">
          <Circle className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
