import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Youtube, BookOpen, Clock, Target, Play } from 'lucide-react';
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
  const [activeTopic, setActiveTopic] = useState(0);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
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

  // Reset active topic when chapter changes
  useEffect(() => {
    setActiveTopic(0);
  }, [activeChapter]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin w-8 h-8 text-purple-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
          <p className="text-2xl font-bold text-white mb-2">Oops! Page not found</p>
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4 border-slate-600 text-gray-300">
            Return to Home
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const chapters: Chapter[] = course.generatedChapters || [];

  // Group chapters by their order/title
  const groupedChapters = chapters.reduce((acc, chapter) => {
    const key = chapter.order;
    if (!acc[key]) {
      acc[key] = {
        order: chapter.order,
        title: chapter.title,
        topics: []
      };
    }
    acc[key].topics.push({
      description: chapter.description,
      content: chapter.content,
      youtubeVideo: chapter.youtubeVideo
    });
    return acc;
  }, {} as Record<number, { order: number; title: string; topics: Array<{ description: string; content?: string; youtubeVideo?: string }> }>);

  const chapterGroups = Object.values(groupedChapters).sort((a, b) => a.order - b.order);
  const currentChapter = chapterGroups[activeChapter];
  const currentTopic = currentChapter?.topics[activeTopic];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-600';
      case 'Intermediate': return 'bg-yellow-600';
      case 'Advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const handleNextTopic = () => {
    if (activeTopic < currentChapter.topics.length - 1) {
      setActiveTopic(activeTopic + 1);
    } else if (activeChapter < chapterGroups.length - 1) {
      setActiveChapter(activeChapter + 1);
      setActiveTopic(0);
    }
  };

  const handlePreviousTopic = () => {
    if (activeTopic > 0) {
      setActiveTopic(activeTopic - 1);
    } else if (activeChapter > 0) {
      setActiveChapter(activeChapter - 1);
      setActiveTopic(chapterGroups[activeChapter - 1].topics.length - 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={() => navigate(-1)} variant="outline" className="mb-4 border-slate-600 text-gray-300">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
          </Button>

          {/* Course Overview */}
          <Card className="bg-slate-800 border border-slate-700 rounded-2xl shadow-md mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-white text-3xl mb-3">{course.name}</CardTitle>
                  <p className="text-gray-300 text-lg mb-4">{course.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-600 text-white">
                      {course.category}
                    </Badge>
                    <Badge className={`${getDifficultyColor(course.difficulty)} text-white`}>
                      {course.difficulty}
                    </Badge>
                    <Badge className="bg-purple-600 text-white">
                      {course.chapters} Chapters
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{chapterGroups.length}</div>
                    <div className="text-gray-400 text-sm">Total Chapters</div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Chapter Navigation Sidebar */}
          <div className="lg:w-1/3 w-full">
            <Card className="bg-slate-800 border border-slate-700 rounded-xl shadow-md">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chapterGroups.map((chapterGroup, idx) => (
                    <div key={idx}>
                      <div
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${activeChapter === idx
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          }`}
                        onClick={() => setActiveChapter(idx)}
                      >
                        <div className="font-medium text-sm mb-1">
                          Chapter {chapterGroup.order}: {chapterGroup.title}
                        </div>
                        <div className="text-xs opacity-80">
                          {chapterGroup.topics.length} topics
                        </div>
                      </div>
                      {activeChapter === idx && (
                        <div className="mt-3 ml-4 space-y-2">
                          {chapterGroup.topics.map((topic, topicIdx) => (
                            <div 
                              key={topicIdx} 
                              className={`p-2 rounded-md cursor-pointer transition-all duration-200 ${
                                activeTopic === topicIdx 
                                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50' 
                                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 hover:text-gray-200 border border-transparent'
                              }`}
                              onClick={() => setActiveTopic(topicIdx)}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  activeTopic === topicIdx ? 'bg-purple-400' : 'bg-gray-500'
                                }`} />
                                <div className="text-sm leading-relaxed">
                                  {topic.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chapter Content */}
          <div className="flex-1 min-w-0">
            <Card className="bg-slate-800 border border-slate-700 rounded-xl shadow-md h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-2xl mb-2">
                      Chapter {currentChapter?.order}: {currentChapter?.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>Topic {activeTopic + 1} of {currentChapter?.topics.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>~{Math.floor(currentTopic?.content?.length / 10)} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Topic Content */}
                {currentTopic && (
                  <div className="bg-slate-900 rounded-xl p-6 border border-slate-600">
                    <div className="flex items-center gap-2 mb-4">
                      <Play className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-semibold">{currentTopic.description}</span>
                    </div>

                    {/* YouTube Video for this topic */}
                    {currentTopic.youtubeVideo && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Youtube className="w-5 h-5 text-red-500" />
                          <span className="text-gray-300 text-sm">Related Video</span>
                        </div>
                        <div className="aspect-video rounded-lg overflow-hidden border border-slate-700 bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${currentTopic.youtubeVideo.split('v=')[1]}`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Topic Content */}
                    {currentTopic.content && (
                      <div className="prose prose-invert max-w-none text-gray-100 overflow-auto leading-relaxed"
                           style={{ maxHeight: '50vh' }}
                           dangerouslySetInnerHTML={{ 
                             __html: currentTopic.content.replace(/<video[^>]*>.*?<\/video>/gs, '') 
                           }} />
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                    disabled={activeTopic === 0 && activeChapter === 0}
                    onClick={handlePreviousTopic}
                  >
                    Previous Topic
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={activeTopic === currentChapter?.topics.length - 1 && activeChapter === chapterGroups.length - 1}
                    onClick={handleNextTopic}
                  >
                    Next Topic
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 