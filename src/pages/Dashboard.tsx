
import { useState, useEffect } from "react";
import { Plus, BookOpen, Users, CreditCard, User, Search, Filter, MoreVertical, LogOut, Eye, Edit, Trash2, Loader2, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import CourseModal from "@/components/CourseModal";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses, updateCourseStatus, deleteCourse } from "@/services/api";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Course {
  _id: string;
  name: string;
  description: string;
  chapters: number;
  status: string;
  category: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
  generatedChapters?: Array<{
    title: string;
    description: string;
    order: number;
  }>;
}

const Dashboard = () => {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = [
    'Technology', 'Programming', 'Business', 'Marketing', 'Design', 
    'Health', 'Education', 'Science', 'Arts', 'Language'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const statuses = ['draft', 'published', 'archived'];

  useEffect(() => {
    fetchCourses();
  }, [token]);

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

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    if (!token) return;

    try {
      const response = await updateCourseStatus(token, courseId, newStatus);
      if (response.success) {
        setCourses(courses.map(course => 
          course._id === courseId ? { ...course, status: newStatus } : course
        ));
        toast({
          title: "Status Updated",
          description: `Course status changed to ${newStatus}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!token) return;

    if (!confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingCourseId(courseId);
    try {
      const response = await deleteCourse(token, courseId);
      if (response.success) {
        setCourses(courses.filter(course => course._id !== courseId));
        toast({
          title: "Course Deleted",
          description: `"${courseName}" has been deleted successfully`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive"
      });
    } finally {
      setDeletingCourseId(null);
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

  const getTotalTopics = (course: Course) => {
    return course.generatedChapters?.length || 0;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Welcome back, {user?.name}! Manage your AI-generated courses
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCourseModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Courses</p>
                  <p className="text-2xl font-bold text-white">{courses.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Published</p>
                  <p className="text-2xl font-bold text-white">
                    {courses.filter(c => c.status === 'published').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Drafts</p>
                  <p className="text-2xl font-bold text-white">
                    {courses.filter(c => c.status === 'draft').length}
                  </p>
                </div>
                <Edit className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Topics</p>
                  <p className="text-2xl font-bold text-white">
                    {courses.reduce((total, course) => total + getTotalTopics(course), 0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white"
            />
          </div>
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-purple-500" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {courses.length === 0 ? "No courses yet" : "No courses found"}
            </h3>
            <p className="text-gray-400 mb-6">
              {courses.length === 0 
                ? "Explore the courses and create your own"
                : "Try adjusting your search or filters"
              }
            </p>
            {courses.length === 0 && (
              <Button 
                onClick={() => navigate('/explore')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Explore Courses
              </Button>
            )}
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course._id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white mb-2 line-clamp-2">{course.name}</CardTitle>
                      <CardDescription className="text-gray-300 line-clamp-2">{course.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-white"
                        onClick={() => navigate(`/course/${course._id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-white"
                        onClick={() => navigate(`/course/${course._id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteCourse(course._id, course.name)}
                        disabled={deletingCourseId === course._id}
                      >
                        {deletingCourseId === course._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      className={`${getStatusColor(course.status)} text-white capitalize`}
                    >
                      {course.status}
                    </Badge>
                    <Badge className={`${getDifficultyColor(course.difficulty)} text-white`}>
                      {course.difficulty}
                    </Badge>
                    <Badge className="bg-blue-600 text-white">
                      {course.category}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.chapters} chapters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{getTotalTopics(course)} topics</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700 flex-1"
                      onClick={() => navigate(`/course/${course._id}/edit`)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-slate-600 text-gray-300"
                      onClick={() => navigate(`/course/${course._id}`)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CourseModal 
        isOpen={showCourseModal} 
        onClose={() => setShowCourseModal(false)}
        onCourseCreated={handleCourseCreated}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
