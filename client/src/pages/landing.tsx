import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Map, FileText, DollarSign, Trophy, ArrowRight } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Map,
      title: "Step-by-Step Roadmap",
      description: "Navigate the U.S. college application process with clear, actionable phases from research to visa prep."
    },
    {
      icon: FileText,
      title: "AI-Powered Essay Lab",
      description: "Get intelligent feedback on your essays with AI trained on admission best practices, plus version tracking."
    },
    {
      icon: GraduationCap,
      title: "University Matcher",
      description: "Find schools that match your KCSE scores, budget, and interests with smart filtering."
    },
    {
      icon: DollarSign,
      title: "Financial Aid Resources",
      description: "Access comprehensive guides for CSS Profile, FAFSA, and scholarships designed for Kenyan students."
    },
    {
      icon: Trophy,
      title: "Track Your Progress",
      description: "Celebrate milestones with gamified badges and visualize your journey to studying abroad."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-10" />
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight mb-6">
              Your roadmap to studying in the U.S.,{" "}
              <span className="text-primary">built for Kenyan students</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Navigate the college application process with confidence. Get AI-powered essay feedback, 
              find matching universities, and access financial aid resources—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 gap-2"
                asChild
                data-testid="button-get-started"
              >
                <a href="/api/login">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
                asChild
                data-testid="button-learn-more"
              >
                <a href="#features">
                  Learn More
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-semibold text-3xl md:text-4xl mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From application planning to essay writing to financial aid—we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover-elevate transition-all duration-200" data-testid={`card-feature-${index}`}>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-semibold text-3xl md:text-4xl mb-6">
            Ready to start your journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Kenyan students who are making their U.S. college dreams a reality
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8"
            asChild
            data-testid="button-start-journey"
          >
            <a href="/api/login">
              Start Your Application Journey
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-heading font-semibold text-foreground mb-2">Kijiji Scholars</p>
            <p>Empowering Kenyan students to reach global opportunities</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
