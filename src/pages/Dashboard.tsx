
import { useState } from "react";
import { Plus, BookOpen, Users, CreditCard, User, Search, Filter, MoreVertical, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import CourseModal from "@/components/CourseModal";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const { user } = useAuth();

  const courses = [
    {
      id: 1,
      title: "Introduction to Machine Learning",
      description: "A comprehensive guide to ML fundamentals",
      chapters: 12,
      status: "Published",
      students: 1250,
      category: "Technology",
      difficulty: "Beginner",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Advanced React Development",
      description: "Master React patterns and best practices",
      chapters: 8,
      status: "Draft",
      students: 0,
      category: "Programming",
      difficulty: "Advanced",
      createdAt: "2024-01-20"
    },
    {
      id: 3,
      title: "Digital Marketing Essentials",
      description: "Complete guide to modern digital marketing",
      chapters: 15,
      status: "Published",
      students: 890,
      category: "Marketing",
      difficulty: "Intermediate",
      createdAt: "2024-01-10"
    }
  ];

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

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search courses..." 
              className="pl-10 bg-slate-800 border-slate-600 text-white"
            />
          </div>
          <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white mb-2">{course.title}</CardTitle>
                    <CardDescription className="text-gray-300">{course.description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={course.status === 'Published' ? 'default' : 'secondary'}
                    className={course.status === 'Published' ? 'bg-green-600' : 'bg-yellow-600'}
                  >
                    {course.status}
                  </Badge>
                  <Badge variant="outline" className="border-purple-400 text-purple-400">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="border-blue-400 text-blue-400">
                    {course.difficulty}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{course.chapters} chapters</span>
                  <span>{course.students} students</span>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex-1">
                    Edit Course
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600 text-gray-300">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CourseModal 
        isOpen={showCourseModal} 
        onClose={() => setShowCourseModal(false)} 
      />
    </DashboardLayout>
  );
};

export default Dashboard;
