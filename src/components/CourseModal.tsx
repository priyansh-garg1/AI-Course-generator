
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

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CourseModal = ({ isOpen, onClose }: CourseModalProps) => {
  const [step, setStep] = useState<'input' | 'preview' | 'generating'>('input');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chapters: 5,
    includeVideos: true,
    category: '',
    difficulty: ''
  });
  const { toast } = useToast();

  const categories = [
    'Technology', 'Programming', 'Business', 'Marketing', 'Design', 
    'Health', 'Education', 'Science', 'Arts', 'Language'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePreview = () => {
    if (!formData.name || !formData.description || !formData.category || !formData.difficulty) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setStep('generating');
    
    // Simulate AI generation delay
    setTimeout(() => {
      setStep('preview');
    }, 3000);
  };

  const handleCreateCourse = () => {
    toast({
      title: "Course Created!",
      description: "Your AI-generated course has been created successfully.",
    });
    onClose();
    setStep('input');
  };

  const mockPreviewData = {
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
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-300">
            {step === 'input' && 'Provide course details and let AI generate comprehensive content'}
            {step === 'generating' && 'AI is creating your course structure and content'}
            {step === 'preview' && 'Review and customize your AI-generated course'}
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
                    max="20"
                    value={formData.chapters}
                    onChange={(e) => handleInputChange('chapters', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white mt-2"
                  />
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
            <h3 className="text-xl font-semibold text-white mb-2">AI is working its magic...</h3>
            <p className="text-gray-300 mb-6">Generating course structure and content based on your specifications</p>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
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
              
              {mockPreviewData.chapters.slice(0, formData.chapters).map((chapter, index) => (
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
              <Button variant="outline" onClick={() => setStep('input')} className="border-slate-600 text-gray-300">
                Back to Edit
              </Button>
              <Button onClick={handleCreateCourse} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Create Course
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CourseModal;
