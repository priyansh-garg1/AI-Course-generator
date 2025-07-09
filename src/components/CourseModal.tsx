import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, BookOpen, Video, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCourse, generateCourseLayout, generateAndSaveFullCourse } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: () => void;
}

const CourseModal = ({ isOpen, onClose, onCourseCreated }: CourseModalProps) => {
  const [step, setStep] = useState<'input' | 'preview' | 'generating' | 'creating'>('input');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chapters: 5,
    includeVideos: true,
    category: '',
    difficulty: '',
    aiGeneratedLayout: null
  });
  const [isCreating, setIsCreating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { toast } = useToast();
  const { user, token } = useAuth();

  const categories = [
    'Technology', 'Programming', 'Business', 'Marketing', 'Design', 
    'Health', 'Education', 'Science', 'Arts', 'Language'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleInputChange = (field: string, value: any) => {
    if (field === 'chapters') {
      const numValue = parseInt(value);
      if (numValue > 7) {
        toast({
          title: "Invalid Chapter Count",
          description: "Maximum number of chapters is 7 for optimal content quality.",
          variant: "destructive"
        });
        return;
      }
      if (numValue < 1) {
        return;
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePreview = async () => {
    if (!formData.name || !formData.description || !formData.category || !formData.difficulty) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (formData.chapters < 1 || formData.chapters > 7) {
      toast({
        title: "Invalid Chapter Count",
        description: "Number of chapters must be between 1 and 7.",
        variant: "destructive"
      });
      return;
    }

    setStep('generating');
    
    try {
      const userInput = `Course Name: ${formData.name}
Description: ${formData.description}
Category: ${formData.category}
Difficulty: ${formData.difficulty}
Number of Chapters: ${formData.chapters}
Include Videos: ${formData.includeVideos}`;

      const response = await generateCourseLayout(userInput);
      
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          aiGeneratedLayout: response.data.course
        }));
        setStep('preview');
      } else {
        throw new Error(response.message || 'Failed to generate course layout');
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate course layout. Please try again.",
        variant: "destructive"
      });
      setStep('input');
    }
  };

  const handleCreateCourse = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a course.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.aiGeneratedLayout) {
      toast({
        title: "No Course Layout",
        description: "Please generate a course layout first.",
        variant: "destructive"
      });
      return;
    }

    setStep('creating');
    setGenerationProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 2000);

    try {
      // Call the new API to generate and save the full course
      const response = await generateAndSaveFullCourse(token, formData.aiGeneratedLayout);
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      if (response.success) {
        toast({
          title: "Course Created!",
          description: "Your full AI-generated course has been saved successfully.",
        });
        onClose();
        setStep('input');
        setFormData({
          name: '',
          description: '',
          chapters: 5,
          includeVideos: true,
          category: '',
          difficulty: '',
          aiGeneratedLayout: null
        });
        onCourseCreated?.();
      } else {
        throw new Error(response.message || 'Failed to create course');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      toast({
        title: "Error",
        description: error.message || "Failed to create course. Please try again.",
        variant: "destructive"
      });
      setStep('preview');
    } finally {
      setIsCreating(false);
      setGenerationProgress(0);
    }
  };

  const getPreviewData = () => {
    if (formData.aiGeneratedLayout) {
      return {
        chapters: formData.aiGeneratedLayout.chapters.map((chapter, index) => ({
          title: chapter.chapterName,
          description: `Duration: ${chapter.duration}`,
          objectives: chapter.topics,
          videoKeywords: chapter.chapterName.toLowerCase().replace(/\s+/g, ' ')
        }))
      };
    }
    
    // Fallback to mock data
    return {
      chapters: [
        {
          title: "Introduction to Machine Learning Fundamentals",
          description: "Understanding the basics of ML, its applications, and key concepts",
          objectives: ["Define machine learning", "Identify ML types", "Explore real-world applications"],
          videoKeywords: "machine learning introduction basics"
        },
        {
          title: "Data Preprocessing and Feature Engineering",
          description: "Learn how to clean and prepare data for machine learning models",
          objectives: ["Data cleaning techniques", "Feature selection", "Data transformation"],
          videoKeywords: "data preprocessing feature engineering"
        },
        {
          title: "Supervised Learning Algorithms",
          description: "Explore classification and regression algorithms",
          objectives: ["Linear regression", "Decision trees", "Support vector machines"],
          videoKeywords: "supervised learning algorithms classification"
        }
      ]
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="h-6 w-6 text-purple-400" />
            <DialogTitle className="text-2xl font-bold text-white">
              {step === 'input' && 'Create New Course'}
              {step === 'generating' && 'Generating Course...'}
              {step === 'preview' && 'Course Preview'}
              {step === 'creating' && 'Creating Full Course...'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-300">
            {step === 'input' && 'Provide course details and let AI generate comprehensive content'}
            {step === 'generating' && 'AI is creating your course structure and content'}
            {step === 'preview' && 'Review and customize your AI-generated course'}
            {step === 'creating' && 'AI is generating detailed content with examples, exercises, and videos'}
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="courseName" className="text-white">Course Name *</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g., Introduction to Machine Learning"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="chapters" className="text-white">Number of Chapters</Label>
                  <Input
                    id="chapters"
                    type="number"
                    min="1"
                    max="7"
                    value={formData.chapters}
                    onChange={(e) => handleInputChange('chapters', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">Maximum 7 chapters for optimal content quality</p>
                </div>

                <div>
                  <Label className="text-white">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-white">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Difficulty Level *</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-2">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty} className="text-white">
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-white">Course Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn in this course..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white mt-2 min-h-[120px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeVideos"
                    checked={formData.includeVideos}
                    onCheckedChange={(checked) => handleInputChange('includeVideos', checked)}
                  />
                  <Label htmlFor="includeVideos" className="text-white">
                    Include video recommendations
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={onClose} className="border-slate-600 text-gray-300">
                Cancel
              </Button>
              <Button onClick={handleGeneratePreview} className="bg-purple-600 hover:bg-purple-700">
                <Brain className="w-4 h-4 mr-2" />
                Generate Course Preview
              </Button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-purple-400 mx-auto mb-6 animate-pulse" />
            <h3 className="text-xl font-semibold text-white mb-2">AI is creating comprehensive content...</h3>
            <p className="text-gray-300 mb-6">Generating detailed course content with examples, exercises, and key takeaways. This may take a few minutes for thorough content creation.</p>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
            <div className="text-sm text-gray-400 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Creating course structure</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Adding examples and exercises</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>Finding relevant videos</span>
              </div>
            </div>
          </div>
        )}

        {step === 'creating' && (
          <div className="text-center py-12">
            <div className="relative mb-8">
              <Brain className="h-20 w-20 text-purple-400 mx-auto animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">Creating Your Full Course</h3>
            <p className="text-gray-300 mb-8 text-lg">AI is generating comprehensive content with detailed examples, exercises, and video recommendations. This process may take 2-3 minutes.</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-3 mb-6">
              <div 
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            
            <div className="text-white font-semibold mb-6">
              {Math.round(generationProgress)}% Complete
            </div>
            
            {/* Progress Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className={`p-4 rounded-lg border ${generationProgress >= 20 ? 'bg-green-600/20 border-green-500' : 'bg-slate-700 border-slate-600'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${generationProgress >= 20 ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                  <span className="text-sm font-medium">Content Generation</span>
                </div>
                <p className="text-xs text-gray-300">Creating detailed HTML content for each topic</p>
              </div>
              
              <div className={`p-4 rounded-lg border ${generationProgress >= 60 ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${generationProgress >= 60 ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                  <span className="text-sm font-medium">Video Integration</span>
                </div>
                <p className="text-xs text-gray-300">Finding relevant YouTube videos for each topic</p>
              </div>
              
              <div className={`p-4 rounded-lg border ${generationProgress >= 90 ? 'bg-purple-600/20 border-purple-500' : 'bg-slate-700 border-slate-600'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${generationProgress >= 90 ? 'bg-purple-400' : 'bg-gray-500'}`}></div>
                  <span className="text-sm font-medium">Course Saving</span>
                </div>
                <p className="text-xs text-gray-300">Saving course to database</p>
              </div>
            </div>
            
            {/* Current Activity */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>
                  {generationProgress < 20 && "Initializing content generation..."}
                  {generationProgress >= 20 && generationProgress < 60 && "Generating detailed content with examples and exercises..."}
                  {generationProgress >= 60 && generationProgress < 90 && "Finding and integrating relevant videos..."}
                  {generationProgress >= 90 && "Finalizing and saving course..."}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-2">{formData.name}</h3>
              <p className="text-gray-300 mb-4">{formData.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">{formData.category}</span>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">{formData.difficulty}</span>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">{formData.chapters} Chapters</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                Generated Course Structure
              </h4>
              
              {getPreviewData().chapters.slice(0, formData.chapters).map((chapter, index) => (
                <div key={index} className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-semibold text-white">Chapter {index + 1}: {chapter.title}</h5>
                    {formData.includeVideos && (
                      <Video className="w-4 h-4 text-red-400 mt-1" />
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{chapter.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-400">
                      <Target className="w-4 h-4 mr-2" />
                      Learning Objectives:
                    </div>
                    <ul className="text-sm text-gray-300 ml-6">
                      {chapter.objectives.map((obj, objIndex) => (
                        <li key={objIndex} className="list-disc">{obj}</li>
                      ))}
                    </ul>
                  </div>

                  {formData.includeVideos && (
                    <div className="mt-3 text-xs text-gray-400">
                      Video Keywords: "{chapter.videoKeywords}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setStep('input')} className="border-slate-600 text-gray-300" disabled={isCreating}>
                Back to Edit
              </Button>
              <Button onClick={handleCreateCourse} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CourseModal;
