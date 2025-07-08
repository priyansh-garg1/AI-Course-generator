import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Youtube } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Chapter {
  title: string;
  description: string;
  content?: string;
  youtubeVideo?: string;
  order: number;
}

export default function CourseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
        // You may need to pass a token if required by your API
        const token = localStorage.getItem('token');
        const response = await getCourseById(token || '', id!);
        setCourse(response.data);
        console.log(response.data);
        
      } catch (err) {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-purple-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-2xl font-bold text-white mb-2">Oops! Page not found</p>
        <Button onClick={() => navigate('/')} variant="outline" className="mt-4 border-slate-600 text-gray-300">
          Return to Home
        </Button>
      </div>
    );
  }

  const chapters: Chapter[] = course.generatedChapters || [];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-slate-600 text-gray-300">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
        </Button>
        <Card className="bg-slate-800 border border-slate-700 rounded-2xl shadow-md mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl mb-2">{course.name}</CardTitle>
            <p className="text-gray-300 text-lg">{course.description}</p>
          </CardHeader>
        </Card>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar or Tabs for Chapters */}
          <div className="md:w-1/4 w-full">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-white text-lg font-semibold mb-4">Chapters</h3>
              <ul className="space-y-2">
                {chapters.map((ch, idx) => (
                  <li key={idx}>
                    <Button
                      variant={activeChapter === idx ? 'default' : 'outline'}
                      className={`w-full text-left ${activeChapter === idx ? 'bg-purple-600 text-white' : 'border-slate-600 text-gray-300 hover:bg-slate-700'}`}
                      onClick={() => setActiveChapter(idx)}
                    >
                      Chapter {ch.order}: {ch.title}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Chapter Content */}
          <div className="flex-1 min-w-0">
            <Card className="bg-slate-800 border border-slate-700 rounded-xl shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-white text-xl mb-2">
                  Chapter {chapters[activeChapter]?.order}: {chapters[activeChapter]?.title}
                </CardTitle>
                <p className="text-gray-300 mb-2">{chapters[activeChapter]?.description}</p>
              </CardHeader>
              <CardContent>
                {chapters[activeChapter]?.youtubeVideo && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Youtube className="w-5 h-5 text-red-500" />
                      <span className="text-gray-200 text-sm">Related YouTube Video</span>
                    </div>
                    <div className="aspect-video rounded-lg overflow-hidden border border-slate-700 bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${chapters[activeChapter].youtubeVideo.split('v=')[1]}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
                {chapters[activeChapter]?.content && (
                  <div className="prose prose-invert max-w-none text-gray-100 overflow-auto" style={{maxHeight: '60vh'}} dangerouslySetInnerHTML={{ __html: chapters[activeChapter].content }} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 