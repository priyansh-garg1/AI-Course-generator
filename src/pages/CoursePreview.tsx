import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, BookOpen, Clock, Target, Play, Users, Calendar } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface Chapter {
  chapterName: string;
  duration: string;
  topics: string[];
}

interface CourseLayout {
  name: string;
  description: string;
  category: string;
  level: string;
  includeVideo: boolean;
  noOfChapters: number;
  bannerImagePrompt: string;
  chapters: Chapter[];
}

export default function CoursePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
        console.log('Fetching course preview for ID:', id);
        const response = await api.get(`/courses/preview/${id}`);
        console.log('Course preview response:', response.data);
        setCourse(response.data);
      } catch (err: any) {
        console.error('Error fetching course preview:', err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-purple-500" />
      </div>
    );
  }

  if (!course || !course.data || !course.data.aiGeneratedLayout) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-2xl font-bold text-white mb-2">Course not found</p>
        <p className="text-gray-400 mb-4">Course ID: {id}</p>
        <p className="text-gray-400 mb-6">The course may not exist or may not have been published yet.</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/')} variant="outline" className="border-slate-600 text-gray-300">
            Return to Home
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-600 text-gray-300">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const layout: CourseLayout = course.data.aiGeneratedLayout;

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-600';
      case 'Intermediate': return 'bg-yellow-600';
      case 'Advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technology': return 'bg-blue-600';
      case 'Programming': return 'bg-purple-600';
      case 'Business': return 'bg-emerald-600';
      case 'Design': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <Button onClick={() => navigate(-1)} variant="outline" className="border-slate-600 text-gray-300">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Course Overview */}
        <Card className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg mb-8">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <CardTitle className="text-white text-4xl mb-4">{layout.name}</CardTitle>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">{layout.description}</p>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge className={`${getCategoryColor(layout.category)} text-white px-4 py-2 text-sm`}>
                    {layout.category}
                  </Badge>
                  <Badge className={`${getDifficultyColor(layout.level)} text-white px-4 py-2 text-sm`}>
                    {layout.level}
                  </Badge>
                  <Badge className="bg-purple-600 text-white px-4 py-2 text-sm">
                    {layout.noOfChapters} Chapters
                  </Badge>
                  {layout.includeVideo && (
                    <Badge className="bg-red-600 text-white px-4 py-2 text-sm">
                      Includes Videos
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">
                      {layout.chapters.reduce((total, ch) => {
                        const hours = parseInt(ch.duration.split(' ')[0]);
                        return total + hours;
                      }, 0)}h
                    </div>
                    <div className="text-gray-400 text-sm">Total Duration</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">{layout.noOfChapters}</div>
                    <div className="text-gray-400 text-sm">Chapters</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">
                      {layout.chapters.reduce((total, ch) => total + ch.topics.length, 0)}
                    </div>
                    <div className="text-gray-400 text-sm">Topics</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <Play className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">
                      {layout.includeVideo ? 'Yes' : 'No'}
                    </div>
                    <div className="text-gray-400 text-sm">Videos</div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Course Content */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Course Content
          </h2>
          
          {layout.chapters.map((chapter, chapterIndex) => (
            <Card key={chapterIndex} className="bg-slate-800 border border-slate-700 rounded-xl shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-xl mb-2">
                      Chapter {chapterIndex + 1}: {chapter.chapterName}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{chapter.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{chapter.topics.length} topics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {chapter.topics.map((topic, topicIndex) => (
                    <div 
                      key={topicIndex}
                      className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                        <span className="text-gray-200 text-sm leading-relaxed">
                          {topic}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-slate-800 border border-slate-700 rounded-2xl mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Learning?</h3>
            <p className="text-gray-300 mb-6">
              Sign up to access the full course content, track your progress, and earn certificates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/auth')} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              >
                Sign Up to Access Course
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-slate-600 text-gray-300 px-8 py-3"
              >
                Explore More Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 