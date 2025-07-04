import { useState } from "react";
import { Check, Star, Zap, Crown, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const Billing = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '5 courses per month',
        'Basic AI generation',
        'Standard support',
        'Community access'
      ],
      icon: Star,
      color: 'text-gray-400',
      bgColor: 'bg-gray-600',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'For serious course creators',
      features: [
        'Unlimited courses',
        'Advanced AI generation',
        'Priority support',
        'Custom branding',
        'Analytics dashboard',
        'Export to multiple formats'
      ],
      icon: Zap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$49',
      period: 'per month',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'White-label solution',
        'API access',
        'Dedicated support',
        'Custom integrations',
        'Advanced analytics'
      ],
      icon: Crown,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-600',
      popular: false
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    toast({
      title: "Coming Soon!",
      description: "Billing and subscription features will be available soon. Stay tuned for updates!",
    });
  };

  const handleUpgrade = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Subscription management and billing features are currently in development. We'll notify you when they're ready!",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-400" />
            <Badge className="bg-yellow-600 text-white">
              Coming Soon
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-white">Choose Your Plan</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock the full potential of AI-powered course creation with our flexible pricing plans
          </p>
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/20 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center space-x-2 text-purple-300">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Billing features are currently in development</span>
            </div>
            <p className="text-gray-300 text-sm mt-2">
              We're working hard to bring you seamless subscription management. 
              All plans below are for preview purposes only.
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${plan.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className={`w-8 h-8 ${plan.color}`} />
                </div>
                <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                <CardDescription className="text-gray-300">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full mt-6 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {plan.id === 'free' ? 'Current Plan' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Plan Info */}
        <Card className="bg-slate-800/50 border-slate-700 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white">Current Plan</CardTitle>
            <CardDescription className="text-gray-300">
              You're currently on the Free plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">5</div>
                <div className="text-gray-400">Courses Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">2</div>
                <div className="text-gray-400">Courses Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Free</div>
                <div className="text-gray-400">Plan Type</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-600">
              <Button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">When will billing be available?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  We're working hard to bring you seamless subscription management. 
                  Expected release is in the next few weeks.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Can I change plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Yes! You can upgrade or downgrade your plan at any time. 
                  Changes will be prorated for the current billing period.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">What payment methods will be accepted?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  We'll support all major credit cards, PayPal, and other popular 
                  payment methods for your convenience.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Yes! All paid plans will include a 14-day free trial so you can 
                  experience the full features before committing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-gray-300 mb-4">
                Have questions about our pricing or plans? Our support team is here to help.
              </p>
              <Button 
                variant="outline" 
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
                onClick={() => {
                  toast({
                    title: "Support Coming Soon",
                    description: "Support features will be available when billing launches.",
                  });
                }}
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Billing; 