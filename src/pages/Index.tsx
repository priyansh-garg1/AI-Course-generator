
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, BookOpen, Video, Users, Star, ArrowRight, Sparkles, Target, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGetStarted = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div onClick={() => navigate('/')} className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-purple-400" />
          <span className="text-2xl font-bold text-white">CourseAI</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-white hover:text-gray-900 hover:bg-pink-100" onClick={handleLogin}>
            Login
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleGetStarted}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-purple-100 text-purple-800 hover:bg-purple-200">
            <Sparkles className="w-4 h-4 mr-1" />
            Powered by AI
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Generate Complete
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {" "}AI Courses{" "}
            </span>
            in Minutes
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your ideas into structured, comprehensive courses with AI-generated content, 
            video recommendations, and interactive learning materials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
              onClick={handleGetStarted}
            >
              Generate Your Course Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose CourseAI?</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Our AI-powered platform makes course creation effortless and efficient
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Brain className="h-12 w-12 text-purple-400 mb-2" />
              <CardTitle className="text-white">AI-Powered Generation</CardTitle>
              <CardDescription className="text-gray-300">
                Google Gemini AI creates comprehensive course content tailored to your specifications
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-blue-400 mb-2" />
              <CardTitle className="text-white">Structured Learning</CardTitle>
              <CardDescription className="text-gray-300">
                Automatically organized chapters with clear learning objectives and progression
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Video className="h-12 w-12 text-green-400 mb-2" />
              <CardTitle className="text-white">Video Integration</CardTitle>
              <CardDescription className="text-gray-300">
                Smart YouTube video recommendations perfectly matched to your course content
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Target className="h-12 w-12 text-red-400 mb-2" />
              <CardTitle className="text-white">Learning Objectives</CardTitle>
              <CardDescription className="text-gray-300">
                Clear, measurable goals for each chapter to track student progress
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Clock className="h-12 w-12 text-yellow-400 mb-2" />
              <CardTitle className="text-white">Quick Generation</CardTitle>
              <CardDescription className="text-gray-300">
                From concept to complete course in minutes, not weeks
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Award className="h-12 w-12 text-purple-400 mb-2" />
              <CardTitle className="text-white">Professional Quality</CardTitle>
              <CardDescription className="text-gray-300">
                Enterprise-grade content suitable for professional training and education
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-300 text-lg">Simple steps to create your perfect course</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Input Course Details</h3>
            <p className="text-gray-300">Provide course name, description, chapters count, and preferences</p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Generation</h3>
            <p className="text-gray-300">Our AI creates comprehensive course outline and content</p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Review & Publish</h3>
            <p className="text-gray-300">Preview, customize, and publish your complete course</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-3xl p-12 border border-purple-500/20">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Create Your First AI Course?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of educators and trainers who are revolutionizing learning with AI-generated courses
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl"
            onClick={handleGetStarted}
          >
            Start Creating Now
            <Sparkles className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div onClick={() => navigate('/')} className="flex items-center space-x-2 mb-4 md:mb-0 cursor-pointer">
              <Brain className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold text-white">CourseAI</span>
            </div>
            <p className="text-gray-400">© 2024 CourseAI. Powered by AI.</p>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default Index;
