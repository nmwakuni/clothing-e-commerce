'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress, Alert } from '@lms/ui';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  BookOpen,
  MessageCircle,
  Play,
  Pause,
  Volume2,
  Settings,
  Maximize,
  Code,
  Send,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

// Mock data (replace with API calls)
const courseData = {
  id: '1',
  title: 'Web Development Fundamentals',
  description: 'Master the basics of web development',
  totalLessons: 42,
  completedLessons: 28,
};

const lessons = [
  { id: '1', title: 'Introduction to HTML', type: 'video', duration: 15, completed: true },
  { id: '2', title: 'HTML Structure', type: 'text', duration: 10, completed: true },
  { id: '3', title: 'Build Your First Page', type: 'interactive', duration: 20, completed: true },
  { id: '4', title: 'HTML Quiz', type: 'quiz', duration: 15, completed: true },
  { id: '5', title: 'Introduction to CSS', type: 'video', duration: 18, completed: false },
  { id: '6', title: 'CSS Selectors', type: 'text', duration: 12, completed: false },
  { id: '7', title: 'Style a Webpage', type: 'interactive', duration: 25, completed: false },
  { id: '8', title: 'CSS Flexbox', type: 'video', duration: 22, completed: false },
  { id: '9', title: 'CSS Grid Layout', type: 'video', duration: 20, completed: false },
];

const lessonContent = {
  '5': {
    type: 'video',
    title: 'Introduction to CSS',
    description: 'Learn the fundamentals of Cascading Style Sheets and how to style your web pages',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    transcript: `Welcome to this lesson on CSS! In this video, we'll cover...`,
    duration: 18,
    keyPoints: [
      'What is CSS and why do we need it?',
      'CSS syntax: selectors, properties, and values',
      'Three ways to add CSS: inline, internal, and external',
      'Basic styling properties',
    ],
  },
  '6': {
    type: 'text',
    title: 'CSS Selectors',
    description: 'Master CSS selectors to target specific HTML elements',
    content: `# CSS Selectors

CSS selectors are patterns used to select the HTML elements you want to style.

## Types of Selectors

### 1. Element Selector
Selects all elements of a specific type.

\`\`\`css
p {
  color: blue;
}
\`\`\`

### 2. Class Selector
Selects elements with a specific class attribute.

\`\`\`css
.highlight {
  background-color: yellow;
}
\`\`\`

### 3. ID Selector
Selects a single element with a specific ID.

\`\`\`css
#header {
  font-size: 24px;
}
\`\`\`

### 4. Descendant Selector
Selects elements nested inside other elements.

\`\`\`css
div p {
  margin: 10px;
}
\`\`\`

## Real-World Example: Styling a Matatu Booking Site

Think of CSS selectors like addressing matatu routes in Nairobi:
- **Element selector** (p): All matatus (any paragraph)
- **Class selector** (.route14): Specific route matatus (paragraphs with class "route14")
- **ID selector** (#matatu-001): One specific matatu (unique element)

\`\`\`css
/* Style all route names */
.route {
  color: green;
  font-weight: bold;
}

/* Style the specific Ngong route */
#ngong-route {
  background-color: yellow;
}
\`\`\`

## Practice Exercise

Try selecting the following elements in your browser's DevTools!`,
    duration: 12,
  },
  '7': {
    type: 'interactive',
    title: 'Style a Webpage',
    description: 'Apply CSS styles to create a beautiful webpage',
    instructions: `Your task: Style the HTML below to create an attractive M-Pesa transaction card.

Requirements:
1. Set card background to white with rounded corners
2. Make the amount text large and green
3. Add padding and shadow to the card
4. Style the status badge

Hint: Use classes like .card, .amount, .status`,
    starterCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    /* Add your CSS here */
    body {
      background-color: #f0f0f0;
      font-family: Arial, sans-serif;
    }

    /* TODO: Style the .card class */

    /* TODO: Style the .amount class */

    /* TODO: Style the .status class */
  </style>
</head>
<body>
  <div class="card">
    <h3>M-Pesa Transaction</h3>
    <p class="amount">KES 2,500</p>
    <p>To: John Kamau</p>
    <span class="status">Completed</span>
  </div>
</body>
</html>`,
    solution: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background-color: #f0f0f0;
      font-family: Arial, sans-serif;
      padding: 20px;
    }

    .card {
      background-color: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 400px;
    }

    .amount {
      font-size: 32px;
      font-weight: bold;
      color: #16a34a;
      margin: 16px 0;
    }

    .status {
      background-color: #dcfce7;
      color: #166534;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <h3>M-Pesa Transaction</h3>
    <p class="amount">KES 2,500</p>
    <p>To: John Kamau</p>
    <span class="status">Completed</span>
  </div>
</body>
</html>`,
    duration: 25,
  },
  '9': {
    type: 'quiz',
    title: 'CSS Grid Layout Quiz',
    description: 'Test your understanding of CSS Grid',
    questions: [
      {
        id: 'q1',
        question: 'Which property defines a grid container?',
        options: [
          'display: grid;',
          'grid-container: true;',
          'layout: grid;',
          'container: grid;',
        ],
        correctAnswer: 0,
        explanation: 'display: grid; is the correct property to create a grid container.',
      },
      {
        id: 'q2',
        question: 'How do you create 3 equal columns in CSS Grid?',
        options: [
          'grid-columns: 3;',
          'grid-template-columns: 1fr 1fr 1fr;',
          'columns: 3;',
          'grid-layout: 3-columns;',
        ],
        correctAnswer: 1,
        explanation:
          'grid-template-columns: 1fr 1fr 1fr; creates 3 equal fractional columns.',
      },
      {
        id: 'q3',
        question: 'In the context of a matatu sacco layout, if you want to display routes in a 3-column grid, which is the best approach?',
        options: [
          'Use tables',
          'Use CSS Grid with grid-template-columns: repeat(3, 1fr);',
          'Use float: left;',
          'Use inline-block',
        ],
        correctAnswer: 1,
        explanation:
          'CSS Grid with repeat(3, 1fr) is the modern, flexible approach for creating equal columns.',
      },
    ],
    duration: 15,
  },
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(lessonContent[lessonId as keyof typeof lessonContent]);
  const [userCode, setUserCode] = useState(currentLesson?.type === 'interactive' ? currentLesson.starterCode : '');
  const [showSolution, setShowSolution] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([
    {
      role: 'ai',
      content: `Hi! I'm your AI tutor. I'm here to help you understand "${currentLesson?.title}". Ask me anything! 🎓`,
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [lessonComplete, setLessonComplete] = useState(false);

  const currentLessonIndex = lessons.findIndex((l) => l.id === lessonId);
  const currentLessonData = lessons[currentLessonIndex];
  const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  const handleNavigateLesson = (targetLessonId: string) => {
    router.push(`/courses/${courseId}/lessons/${targetLessonId}`);
  };

  const handleMarkComplete = () => {
    setLessonComplete(true);
    // TODO: Call API to mark lesson complete
    setTimeout(() => {
      if (nextLesson) {
        handleNavigateLesson(nextLesson.id);
      }
    }, 1500);
  };

  const handleRunCode = () => {
    // In a real app, this would execute in an iframe sandbox
    const preview = document.getElementById('code-preview');
    if (preview) {
      const doc = preview as HTMLIFrameElement;
      doc.srcdoc = userCode;
    }
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    const allCorrect =
      currentLesson?.type === 'quiz' &&
      currentLesson.questions.every((q, idx) => quizAnswers[q.id] === q.correctAnswer);

    if (allCorrect) {
      setTimeout(() => handleMarkComplete(), 2000);
    }
  };

  const handleSendAiMessage = async () => {
    if (!aiInput.trim()) return;

    const userMessage = aiInput;
    setAiMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setAiInput('');

    // TODO: Call AI tutor API
    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `Great question! Let me explain... (AI response would go here based on the lesson context)`,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Course Outline Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } bg-white border-r transition-all duration-300 overflow-hidden flex-shrink-0`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg">{courseData.title}</h2>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>
          <Progress
            value={(courseData.completedLessons / courseData.totalLessons) * 100}
            showLabel
            className="mt-2"
          />
          <p className="text-sm text-gray-600 mt-1">
            {courseData.completedLessons} of {courseData.totalLessons} lessons
          </p>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-180px)]">
          {lessons.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => handleNavigateLesson(lesson.id)}
              className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                lesson.id === lessonId ? 'bg-green-50 border-l-4 border-l-green-600' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {lesson.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{lesson.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={lesson.type === 'video' ? 'default' : 'outline'} className="text-xs">
                      {lesson.type}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}m
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-6 w-6" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold">{currentLesson?.title}</h1>
                <p className="text-sm text-gray-600">{currentLesson?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setAiChatOpen(!aiChatOpen)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Ask AI Tutor
              </Button>
              {!lessonComplete && (
                <Button size="sm" onClick={handleMarkComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              {lessonComplete && (
                <Badge variant="success" className="px-3 py-1">
                  ✓ Completed
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Lesson Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Video Player */}
            {currentLesson?.type === 'video' && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative bg-black aspect-video">
                    <video
                      controls
                      className="w-full h-full"
                      src={currentLesson.videoUrl}
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold mb-2">Key Points</h3>
                      <ul className="space-y-2">
                        {currentLesson.keyPoints?.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {currentLesson.transcript && (
                      <div>
                        <h3 className="font-bold mb-2">Transcript</h3>
                        <p className="text-gray-700">{currentLesson.transcript}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Text Content */}
            {currentLesson?.type === 'text' && (
              <Card>
                <CardContent className="p-8 prose max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: currentLesson.content
                        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
                        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-6">$1</h2>')
                        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2 mt-4">$1</h3>')
                        .replace(/```css\n([\s\S]*?)```/gim, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code>$1</code></pre>')
                        .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code>$1</code></pre>')
                        .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>')
                        .replace(/\n\n/gim, '</p><p class="mb-4">'),
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Interactive Code Exercise */}
            {currentLesson?.type === 'interactive' && (
              <div className="space-y-4">
                <Alert>
                  <BookOpen className="h-4 w-4" />
                  <div>
                    <h4 className="font-bold">Instructions</h4>
                    <p className="text-sm mt-1">{currentLesson.instructions}</p>
                  </div>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Code Editor */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Code Editor</CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setShowSolution(!showSolution)}>
                            {showSolution ? 'Hide' : 'Show'} Solution
                          </Button>
                          <Button size="sm" onClick={handleRunCode}>
                            <Play className="h-4 w-4 mr-1" />
                            Run
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        value={showSolution ? currentLesson.solution : userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        className="w-full h-96 font-mono text-sm p-4 bg-gray-900 text-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                        spellCheck={false}
                      />
                    </CardContent>
                  </Card>

                  {/* Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <iframe
                        id="code-preview"
                        className="w-full h-96 bg-white border rounded-lg"
                        title="Preview"
                        sandbox="allow-scripts"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Quiz */}
            {currentLesson?.type === 'quiz' && (
              <div className="space-y-6">
                {currentLesson.questions.map((question, qIdx) => {
                  const userAnswer = quizAnswers[question.id];
                  const isCorrect = userAnswer === question.correctAnswer;

                  return (
                    <Card key={question.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Question {qIdx + 1}: {question.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {question.options.map((option, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          const isCorrectAnswer = optIdx === question.correctAnswer;

                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                !quizSubmitted &&
                                setQuizAnswers((prev) => ({ ...prev, [question.id]: optIdx }))
                              }
                              disabled={quizSubmitted}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                                quizSubmitted
                                  ? isCorrectAnswer
                                    ? 'border-green-500 bg-green-50'
                                    : isSelected
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200'
                                  : isSelected
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-green-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    quizSubmitted
                                      ? isCorrectAnswer
                                        ? 'border-green-500 bg-green-500'
                                        : isSelected
                                        ? 'border-red-500 bg-red-500'
                                        : 'border-gray-300'
                                      : isSelected
                                      ? 'border-green-500 bg-green-500'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {quizSubmitted && isCorrectAnswer && (
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                  )}
                                  {quizSubmitted && isSelected && !isCorrectAnswer && (
                                    <X className="h-4 w-4 text-white" />
                                  )}
                                  {!quizSubmitted && isSelected && (
                                    <div className="w-3 h-3 bg-white rounded-full" />
                                  )}
                                </div>
                                <span>{option}</span>
                              </div>
                            </button>
                          );
                        })}

                        {quizSubmitted && (
                          <Alert variant={isCorrect ? 'success' : 'destructive'}>
                            <div>
                              <p className="font-bold">
                                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                              </p>
                              <p className="text-sm mt-1">{question.explanation}</p>
                            </div>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {!quizSubmitted && (
                  <Button
                    onClick={handleSubmitQuiz}
                    className="w-full"
                    disabled={
                      currentLesson.questions.length !== Object.keys(quizAnswers).length
                    }
                  >
                    Submit Quiz
                  </Button>
                )}

                {quizSubmitted && (
                  <Alert variant="success">
                    <CheckCircle2 className="h-4 w-4" />
                    <div>
                      <p className="font-bold">Quiz Complete!</p>
                      <p className="text-sm">
                        You got{' '}
                        {
                          currentLesson.questions.filter(
                            (q) => quizAnswers[q.id] === q.correctAnswer
                          ).length
                        }{' '}
                        out of {currentLesson.questions.length} correct.
                      </p>
                    </div>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <footer className="bg-white border-t px-6 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div>
              {previousLesson ? (
                <Button
                  variant="outline"
                  onClick={() => handleNavigateLesson(previousLesson.id)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous: {previousLesson.title}
                </Button>
              ) : (
                <div />
              )}
            </div>
            <div>
              {nextLesson ? (
                <Button onClick={() => handleNavigateLesson(nextLesson.id)}>
                  Next: {nextLesson.title}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => router.push(`/courses/${courseId}`)}>
                  Back to Course
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* AI Tutor Chat Sidebar */}
      {aiChatOpen && (
        <aside className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold">AI Tutor</h3>
            </div>
            <button onClick={() => setAiChatOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiMessages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendAiMessage()}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button size="sm" onClick={handleSendAiMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
