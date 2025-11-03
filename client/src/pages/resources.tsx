import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  FileText, 
  GraduationCap, 
  ExternalLink,
  BookOpen,
  Users,
  Award
} from "lucide-react";

const resources = [
  {
    category: "Financial Aid",
    icon: DollarSign,
    items: [
      {
        title: "CSS Profile Guide",
        description: "Complete guide to filling out the CSS Profile for international students seeking institutional financial aid.",
        badges: ["Essential", "Step-by-step"],
        content: [
          "The CSS Profile is required by many U.S. colleges to determine institutional financial aid eligibility.",
          "As a Kenyan student, you'll need to submit documents in KSH and USD equivalents.",
          "Key sections: Family Information, Parent Income, Student Income, Assets, and Special Circumstances.",
          "Tip: Be thorough and honest—inconsistencies can delay your aid package."
        ]
      },
      {
        title: "Understanding FAFSA",
        description: "While FAFSA is primarily for U.S. citizens, some schools may request it for international students.",
        badges: ["Advanced"],
        content: [
          "Most international students don't qualify for federal aid through FAFSA.",
          "However, some colleges use it to assess aid eligibility for all students.",
          "Check each university's financial aid requirements carefully.",
          "Alternative: Focus on CSS Profile and institutional aid forms."
        ]
      },
      {
        title: "Need-Based Aid Schools",
        description: "List of universities that meet 100% demonstrated financial need for international students.",
        badges: ["Updated 2025"],
        content: [
          "Harvard, Yale, Princeton, MIT, and Amherst meet full demonstrated need.",
          "These schools are need-blind for all applicants, including internationals.",
          "Admission is highly competitive—focus on building a strong application.",
          "Apply to a mix of need-blind and need-aware schools for better chances."
        ]
      }
    ]
  },
  {
    category: "Essay Writing",
    icon: FileText,
    items: [
      {
        title: "Crafting Your Personal Statement",
        description: "How to tell your unique story in 650 words for the Common Application.",
        badges: ["Most Popular"],
        content: [
          "Start with a compelling hook that draws readers into your story.",
          "Show, don't tell: Use specific examples and vivid details.",
          "Reflect on growth: What did you learn? How did you change?",
          "Kenyan context: Your background is unique—embrace it authentically.",
          "Avoid clichés: Generic statements about 'making a difference' don't stand out."
        ]
      },
      {
        title: "Supplemental Essay Tips",
        description: "Strategies for answering 'Why This College?' and other supplemental prompts.",
        badges: ["Advanced"],
        content: [
          "Research each school thoroughly—mention specific programs, professors, or opportunities.",
          "Connect your goals to what the school offers uniquely.",
          "Be specific: Generic praise doesn't demonstrate genuine interest.",
          "Proofread carefully—errors suggest lack of attention to detail."
        ]
      }
    ]
  },
  {
    category: "Success Stories",
    icon: Award,
    items: [
      {
        title: "From Nairobi to Harvard",
        description: "How Jane Wanjiku secured a full scholarship to Harvard University.",
        badges: ["Inspiring"],
        content: [
          "Jane applied to 15 universities with a KCSE score of A-.",
          "She focused on her passion for environmental advocacy in her essays.",
          "Applied for CSS Profile and received full financial aid from Harvard.",
          "Key advice: Start early, be authentic, and don't give up."
        ]
      },
      {
        title: "Scholarship Success at MIT",
        description: "John Kamau's journey to Massachusetts Institute of Technology with full funding.",
        badges: ["STEM Focus"],
        content: [
          "John excelled in mathematics and physics, winning national competitions.",
          "He highlighted his robotics projects and community teaching in his application.",
          "MIT met his full financial need, covering tuition, housing, and travel.",
          "Tip: Showcase your passion through projects and real-world impact."
        ]
      }
    ]
  },
  {
    category: "Application Basics",
    icon: GraduationCap,
    items: [
      {
        title: "Common App vs Coalition App",
        description: "Understanding the two main application platforms and which schools accept them.",
        badges: ["Beginner Friendly"],
        content: [
          "Common App: Accepted by 900+ colleges. One application for multiple schools.",
          "Coalition App: Focuses on access and affordability, used by 150+ schools.",
          "Most schools accept both—check your target universities' requirements.",
          "Recommendation: Start with Common App for broader reach."
        ]
      },
      {
        title: "Standardized Testing",
        description: "SAT, ACT, and test-optional policies for international students.",
        badges: ["Important"],
        content: [
          "Many top schools are test-optional, but strong scores can strengthen your application.",
          "SAT is more common internationally than ACT.",
          "Prepare using free resources like Khan Academy.",
          "Kenyan context: KCSE scores are important, but SAT/ACT can complement your profile."
        ]
      }
    ]
  }
];

export default function Resources() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
          Resources Hub
        </h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive guides and success stories to support your journey
        </p>
      </div>

      {/* Resource Sections */}
      <div className="space-y-12">
        {resources.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-heading font-bold text-2xl md:text-3xl">
                  {section.category}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {section.items.map((item, index) => (
                  <Card key={index} className="hover-elevate" data-testid={`card-resource-${section.category}-${index}`}>
                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.badges.map((badge, badgeIndex) => (
                          <Badge key={badgeIndex} variant="secondary">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="font-heading text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {item.content.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-sm leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* External Resources */}
      <Card className="bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <CardTitle className="font-heading">External Resources</CardTitle>
          </div>
          <CardDescription>
            Helpful links to official resources and tools
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Button variant="outline" className="justify-between h-auto py-3" asChild data-testid="link-common-app">
            <a href="https://www.commonapp.org" target="_blank" rel="noopener noreferrer">
              <span>Common Application</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" className="justify-between h-auto py-3" asChild data-testid="link-coalition-app">
            <a href="https://www.coalitionforcollegeaccess.org" target="_blank" rel="noopener noreferrer">
              <span>Coalition Application</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" className="justify-between h-auto py-3" asChild data-testid="link-css-profile">
            <a href="https://cssprofile.collegeboard.org" target="_blank" rel="noopener noreferrer">
              <span>CSS Profile</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" className="justify-between h-auto py-3" asChild data-testid="link-education-usa">
            <a href="https://educationusa.state.gov" target="_blank" rel="noopener noreferrer">
              <span>EducationUSA Kenya</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
