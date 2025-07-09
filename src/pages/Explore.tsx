import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { BookOpen, Clock, Users, Search, Filter, Star, Eye, Play, User, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAllCourses, getUserEnrollments, enrollInCourse, CourseData } from "@/services/api";
import { formatDistanceToNow } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";

interface Course extends CourseData {
  _id: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  } | string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface EnrolledCourse {
  _id: string;
  courseId: string;
  status: 'active' | 'completed' | 'paused';
}

const Explore = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
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
    if (token) {
      fetchUserEnrollments();
    }
  }, [currentPage, searchTerm, statusFilter, categoryFilter, difficultyFilter, token]);

  useEffect(() => {
    filterCourses();
  }, [courses, enrolledCourseIds, searchTerm, statusFilter, categoryFilter, difficultyFilter]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: 12
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (difficultyFilter !== "all") params.difficulty = difficultyFilter;

      const response = await getAllCourses(params);
      if (response.success) {
        setCourses(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
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

  const fetchUserEnrollments = async () => {
    if (!token) return;

    try {
      const response = await getUserEnrollments(token);
      if (response.success) {
        const enrolledIds = response.data.map((enrollment: EnrolledCourse) => enrollment.courseId);
        setEnrolledCourseIds(enrolledIds);
      }
    } catch (error: any) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter out enrolled courses
    filtered = filtered.filter(course => !enrolledCourseIds.includes(course._id));

    // Apply other filters
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

  const handleEnroll = async (courseId: string, courseName: string) => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in courses.",
        variant: "destructive"
      });
      return;
    }

    setEnrollingCourseId(courseId);
    try {
      const response = await enrollInCourse(token, courseId);
      if (response.success) {
        toast({
          title: "Successfully Enrolled!",
          description: `You are now enrolled in ${courseName}`,
        });
        // Add to enrolled courses and refresh
        setEnrolledCourseIds(prev => [...prev, courseId]);
        // Navigate to the course
        navigate(`/course/${courseId}`);
      }
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-600';
      case 'Intermediate': return 'bg-yellow-600';
      case 'Advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-600';
      case 'draft': return 'bg-yellow-600';
      case 'archived': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  if (isLoading && courses.length === 0) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400">Discovering amazing courses...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Explore Courses</h1>
          <p className="text-gray-400">Discover AI-generated courses you haven't enrolled in yet</p>
        </div>

        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses by name or description..."
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
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {courses.length === 0 ? "No courses found" : "No available courses to enroll in"}
            </h3>
            <p className="text-gray-400 mb-6">
              {courses.length === 0 
                ? "Try adjusting your search terms or filters to find what you're looking for"
                : "You've enrolled in all available courses or try adjusting your filters"
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setDifficultyFilter("all");
                  setCurrentPage(1);
                }}
                variant="outline"
                className="border-slate-600 text-gray-300"
              >
                Clear Filters
              </Button>
              {token && (
                <Button
                  onClick={() => navigate('/learning')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  View My Courses
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-400">
                Showing {filteredCourses.length} of {totalItems} available courses
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>

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

                    <div className="flex items-center text-sm text-gray-400 mb-4">
                      <User className="w-4 h-4 mr-1" />
                      <span className="truncate">
                        {typeof course.createdBy === 'string' ? 'Unknown Creator' : course.createdBy.name}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate(`/preview/${course._id}`)}>
                        <BookOpen className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleEnroll(course._id, course.name)}
                        disabled={enrollingCourseId === course._id}
                      >
                        {enrollingCourseId === course._id ? (
                          <>
                            <div className="w-4 h-4 mr-1 animate-spin border-2 border-white border-t-transparent rounded-full" />
                            Enrolling...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Enroll
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            className={`cursor-pointer ${currentPage === pageNum
                                ? "bg-purple-600 text-white"
                                : "text-gray-300 hover:bg-slate-700"
                              }`}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Explore; 