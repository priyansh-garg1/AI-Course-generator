import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Search, Filter, Plus, Edit, Trash2, Eye, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses, deleteCourse, updateCourseStatus, CourseData } from "@/services/api";
import { formatDistanceToNow } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import CourseModal from "@/components/CourseModal";

interface Course extends CourseData {
  _id: string;
  createdBy: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const Learning = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  const categories = [
    'Technology', 'Programming', 'Business', 'Marketing', 'Design', 
    'Health', 'Education', 'Science', 'Arts', 'Language'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const statuses = ['draft', 'published', 'archived'];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, statusFilter, categoryFilter, difficultyFilter]);

  const fetchCourses = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await getCourses(token);
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch courses",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(course => course.difficulty === difficultyFilter);
    }

    setFilteredCourses(filtered);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!token) return;

    try {
      await deleteCourse(token, courseId);
      setCourses(courses.filter(course => course._id !== courseId));
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    if (!token) return;

    try {
      await updateCourseStatus(token, courseId, newStatus);
      setCourses(courses.map(course =>
        course._id === courseId ? { ...course, status: newStatus } : course
      ));
      toast({
        title: "Success",
        description: "Course status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course status",
        variant: "destructive"
      });
    }
  };

  const handleCourseCreated = () => {
    fetchCourses();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-600';
      case 'draft': return 'bg-yellow-600';
      case 'archived': return 'bg-gray-600';
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400">Loading your courses...</p>
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
          <p className="text-gray-400">Manage and track your AI-generated courses</p>
        </div>
        <Button 
          onClick={() => setIsCourseModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses..."
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
            {courses.length === 0 ? "No courses yet" : "No courses match your filters"}
          </h3>
          <p className="text-gray-400 mb-6">
            {courses.length === 0 
              ? "Create your first AI-generated course to get started"
              : "Try adjusting your search or filters"
            }
          </p>
                     {courses.length === 0 && (
             <Button 
               onClick={() => setIsCourseModalOpen(true)}
               className="bg-purple-600 hover:bg-purple-700"
             >
               <Plus className="w-4 h-4 mr-2" />
               Create Your First Course
             </Button>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg line-clamp-2">{course.name}</CardTitle>
                    <CardDescription className="text-gray-400 mt-2 line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={`${getStatusColor(course.status)} text-white capitalize`}>
                    {course.status}
                  </Badge>
                  <Badge className={`${getDifficultyColor(course.difficulty)} text-white`}>
                    {course.difficulty}
                  </Badge>
                  <Badge className="bg-blue-600 text-white">
                    {course.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {course.chapters} chapters
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700">
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                    onClick={() => handleDeleteCourse(course._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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