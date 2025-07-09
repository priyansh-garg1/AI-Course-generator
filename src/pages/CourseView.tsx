import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, getEnrollmentDetails, markTopicCompleted, enrollInCourse } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Youtube, BookOpen, Clock, Target, Play, CheckCircle, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  const [enrollment, setEnrollment] = useState<any>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [completingTopic, setCompletingTopic] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, token } = useAuth();

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

  useEffect(() => {
    async function checkEnrollment() {
      if (token && id) {
        try {
          const response = await getEnrollmentDetails(token, id);
          setEnrollment(response.data.enrollment);
          setProgress(response.data.progress);
        } catch (err) {
          // User is not enrolled
          setEnrollment(null);
          setProgress(null);
        }
      }
    }
    checkEnrollment();
  }, [token, id]);

  // Reset active topic when chapter changes
  useEffect(() => {
    setActiveTopic(0);
  }, [activeChapter]);

  const handleEnroll = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in this course.",
        variant: "destructive"
      });
      return;
    }

    setEnrolling(true);
    try {
      const response = await enrollInCourse(token, id!);
      if (response.success) {
        toast({
          title: "Successfully Enrolled!",
          description: "You can now track your progress.",
        });
        setEnrollment(response.data);
        // Refresh enrollment details to get progress
        const enrollmentResponse = await getEnrollmentDetails(token, id);
        setProgress(enrollmentResponse.data.progress);
      }
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleNextTopic = async () => {
    // Mark current topic as completed before moving to next
    if (token && enrollment) {
      await markTopicAsCompleted(currentChapter.order, activeTopic);
    }

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

  const handleTopicClick = async (chapterOrder: number, topicIndex: number) => {
    // Mark the previous topic as completed if user is enrolled
    if (token && enrollment && activeChapter !== undefined && activeTopic !== undefined) {
      await markTopicAsCompleted(currentChapter.order, activeTopic);
    }
    
    // Find the chapter index and topic index
    const chapterIndex = chapterGroups.findIndex(ch => ch.order === chapterOrder);
    if (chapterIndex !== -1) {
      setActiveChapter(chapterIndex);
      setActiveTopic(topicIndex);
    }
  };

  const markTopicAsCompleted = async (chapterOrder: number, topicIndex: number) => {
    if (!token || !enrollment) return;

    const topicKey = `${chapterOrder}-${topicIndex}`;
    setCompletingTopic(topicKey);

    try {
      const response = await markTopicCompleted(token, id!, chapterOrder, topicIndex);
      if (response.success) {
        setProgress(response.data.progress);
        // Update the enrollment state with new progress
        setEnrollment(prev => ({
          ...prev,
          progress: response.data.enrollment.progress
        }));
        
        // Show success feedback
        toast({
          title: "Topic Completed!",
          description: "Great job! You've completed this topic.",
        });
      }
    } catch (error) {
      console.error('Failed to mark topic as completed:', error);
      toast({
        title: "Error",
        description: "Failed to mark topic as completed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCompletingTopic(null);
    }
  };

  const isTopicCompleted = (chapterOrder: number, topicIndex: number) => {
    if (!enrollment) return false;
    return enrollment.progress.completedTopics.some((topic: any) => 
      topic.chapterOrder === chapterOrder && topic.topicIndex === topicIndex
    );
  };

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
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-blue-600 text-white">
                      {course.category}
                    </Badge>
                    <Badge className={`${getDifficultyColor(course.difficulty)} text-white`}>
                      {course.difficulty}
                    </Badge>
                    <Badge className="bg-purple-600 text-white">
                      {course.chapters} Chapters
                    </Badge>
                    {enrollment && (
                      <Badge className="bg-green-600 text-white flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        Enrolled
                      </Badge>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  {progress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{progress.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress.completionPercentage}%` }} 
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {progress.completedTopics} of {progress.totalTopics} topics completed
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{chapterGroups.length}</div>
                    <div className="text-gray-400 text-sm">Total Chapters</div>
                  </div>
                  {!enrollment && (
                    <Button 
                      onClick={handleEnroll} 
                      disabled={enrolling}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        'Enroll Now'
                      )}
                    </Button>
                  )}
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
                              onClick={() => handleTopicClick(chapterGroup.order, topicIdx)}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  isTopicCompleted(chapterGroup.order, topicIdx) 
                                    ? 'bg-green-400' 
                                    : activeTopic === topicIdx 
                                      ? 'bg-purple-400' 
                                      : 'bg-gray-500'
                                }`} />
                                <div className="text-sm leading-relaxed flex-1">
                                  {topic.description}
                                </div>
                                {isTopicCompleted(chapterGroup.order, topicIdx) && (
                                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                )}
                                {completingTopic === `${chapterGroup.order}-${topicIdx}` && (
                                  <Loader2 className="w-4 h-4 text-purple-400 flex-shrink-0 animate-spin" />
                                )}
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
                      {isTopicCompleted(currentChapter?.order, activeTopic) && (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                      )}
                      {completingTopic === `${currentChapter?.order}-${activeTopic}` && (
                        <div className="flex items-center gap-1 text-purple-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Marking as completed...</span>
                        </div>
                      )}
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
                      <div className="course-content overflow-auto leading-relaxed"
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