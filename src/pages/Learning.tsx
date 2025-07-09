import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Search, Filter, Plus, Edit, Trash2, Eye, Play, CheckCircle, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getUserEnrollments, unenrollFromCourse } from "@/services/api";
import { formatDistanceToNow } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import CourseModal from "@/components/CourseModal";
import placeholder from '@/../public/placeholder.svg';
import { useNavigate } from 'react-router-dom';

interface EnrolledCourse {
  _id: string;
  courseId: {
    _id: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    chapters: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  enrolledAt: string;
  status: 'active' | 'completed' | 'paused';
  progress: {
    completedTopics: Array<{
      chapterOrder: number;
      topicIndex: number;
      completedAt: string;
    }>;
    currentChapter: number;
    currentTopic: number;
    lastAccessedAt: string;
    totalTopics?: number;
    completionPercentage?: number;
  };
}

const Learning = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'Technology', 'Programming', 'Business', 'Marketing', 'Design', 
    'Health', 'Education', 'Science', 'Arts', 'Language'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const statuses = ['active', 'completed', 'paused'];

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [enrolledCourses, searchTerm, statusFilter, categoryFilter, difficultyFilter]);

  const fetchEnrolledCourses = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await getUserEnrollments(token);
      if (response.success) {
        setEnrolledCourses(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch enrolled courses",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = enrolledCourses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.courseId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseId.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(course => course.courseId.category === categoryFilter);
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(course => course.courseId.difficulty === difficultyFilter);
    }

    setFilteredCourses(filtered);
  };

  const handleCourseCreated = () => {
    fetchEnrolledCourses();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'completed': return 'bg-blue-600';
      case 'paused': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-600';
      case 'Intermediate': return 'bg-yellow-600';
      case 'Advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const calculateProgress = (enrollment: EnrolledCourse) => {
    // Use the accurate progress data from the backend
    if (enrollment.progress && typeof enrollment.progress.completionPercentage === 'number') {
      return enrollment.progress.completionPercentage;
    }
    
    // Fallback calculation if progress data is not available
    const course = enrollment.courseId;
    const estimatedTopicsPerChapter = 8;
    const totalTopics = course.chapters * estimatedTopicsPerChapter;
    const completedTopics = enrollment.progress.completedTopics.length;
    
    return totalTopics > 0 ? Math.min(Math.round((completedTopics / totalTopics) * 100), 100) : 0;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400">Loading your enrolled courses...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Learning</h1>
          <p className="text-gray-400">Track your progress in enrolled courses</p>
        </div>
        <Button 
          onClick={() => navigate('/explore')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Explore Courses
        </Button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search enrolled courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all" className="text-white">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status} className="text-white capitalize">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all" className="text-white">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-white">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all" className="text-white">All Levels</SelectItem>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty} className="text-white">
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {enrolledCourses.length === 0 ? "No enrolled courses yet" : "No courses match your filters"}
          </h3>
          <p className="text-gray-400 mb-6">
            {enrolledCourses.length === 0 
              ? "Explore and enroll in courses to start your learning journey"
              : "Try adjusting your search or filters"
            }
          </p>
          {enrolledCourses.length === 0 && (
            <Button 
              onClick={() => navigate('/explore')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Explore Courses
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((enrollment) => {
            const course = enrollment.courseId;
            const progress = calculateProgress(enrollment);
            
            return (
              <Card
                key={enrollment._id}
                className="bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all duration-300 rounded-2xl shadow-sm h-full flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg line-clamp-2">
                        {course.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400 mt-2 line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={`${getStatusColor(enrollment.status)} text-white capitalize`}>
                      {enrollment.status}
                    </Badge>
                    <Badge className={`${getDifficultyColor(course.difficulty)} text-white`}>
                      {course.difficulty}
                    </Badge>
                    <Badge className="bg-blue-600 text-white">
                      {course.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {course.chapters} chapters
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(enrollment.enrolledAt), { addSuffix: true })}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {enrollment.progress.completedTopics.length} of {enrollment.progress.totalTopics || '?'} topics completed
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto pt-2">
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" onClick={() => navigate(`/course/${course._id}`)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Continue
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate(`/preview/${course._id}`)}>
                      <BookOpen className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
       )}

       <CourseModal 
         isOpen={isCourseModalOpen}
         onClose={() => setIsCourseModalOpen(false)}
         onCourseCreated={handleCourseCreated}
       />
     </div>
   </DashboardLayout>
   );
 };

export default Learning; 