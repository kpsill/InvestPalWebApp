import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageBubble } from './components/chat/MessageBubble';
import { InputArea } from './components/chat/InputArea';
import { Sidebar } from './components/ui/Sidebar';
import { Loader2, MessageSquare, Moon, Sun } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import { SignIn } from './components/auth/SignIn';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

const API_BASE_URL = import.meta.env.VITE_INVESTPAL_API_BASE_URL;

const SESSION_STORAGE_KEY = 'investpal_user';
const SESSION_EXPIRY_DAYS = 7;

function getSavedUser() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const { user, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

function saveUser(user) {
  const expiresAt = Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user, expiresAt }));
}

function App() {
  const [user, setUser] = useState(() => getSavedUser());
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessions, setSessions] = useState([]);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem(`theme_${getSavedUser()?.id || 'guest'}`) === 'dark';
  });

  useEffect(() => {
    const key = `theme_${user?.id || 'guest'}`;
    let savedTheme = localStorage.getItem(key);
    if (savedTheme === null) {
      // Fallback for existing users
      savedTheme = localStorage.getItem('theme') || 'light';
      localStorage.setItem(key, savedTheme);
    }
    setIsDarkMode(savedTheme === 'dark');
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem(`theme_${user?.id || 'guest'}`, newMode ? 'dark' : 'light');
    localStorage.setItem('theme', newMode ? 'dark' : 'light'); // Keep general default
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch session list for the current user
  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/sessions?user_id=${encodeURIComponent(user.id)}`);
      if (!res.ok) return;
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load session list', err);
    }
  }, [user]);

  // Create new session when user authenticates
  useEffect(() => {
    if (user) {
      createSession();
      fetchSessions();
    }
  }, [user]);

  const createSession = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      if (!response.ok) throw new Error('Failed to create session');

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages([]);
      setError(null);
      // Refresh sidebar after small delay so session exists in DB
      setTimeout(fetchSessions, 500);
    } catch (err) {
      setError('Failed to connect to backend. Is it running on port 8000?');
      console.error(err);
    }
  };

  // Load a past session's messages
  const loadSession = async (sid) => {
    if (sid === sessionId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/session/${sid}`);
      if (!res.ok) throw new Error('Failed to load session');
      const data = await res.json();

      // Convert stored messages back to the UI message format
      const uiMessages = data.messages.map((msg, i) => {
        let parsedComponents;
        if (msg.role === 'agent') {
          try {
            parsedComponents = JSON.parse(msg.content);
          } catch (e) {
            parsedComponents = [{ type: 'text', content: msg.content }];
          }
        } else {
          parsedComponents = [{ type: 'text', content: msg.content }];
        }
        
        return {
          id: `${sid}_${i}`,
          role: msg.role === 'agent' ? 'assistant' : 'user',
          components: Array.isArray(parsedComponents) ? parsedComponents : [{ type: 'text', content: msg.content }],
        };
      });

      setSessionId(sid);
      setMessages(uiMessages);
      setError(null);
    } catch (err) {
      console.error('Failed to load session', err);
      setError('Could not load this chat. Please try again.');
    }
  };

  const simulateStreaming = async (components) => {
    if (!components || components.length === 0) return;

    const assistantId = Date.now().toString() + '_bot';

    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      components: []
    }]);

    for (const component of components) {
      if (component.type === 'text' && component.content) {
        const fullText = component.content;
        let currentText = '';

        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, components: [...m.components, { ...component, content: '' }] }
            : m
        ));

        const batchSize = 3;
        for (let i = 0; i < fullText.length; i += batchSize) {
          currentText += fullText.substring(i, i + batchSize);
          setMessages(prev => prev.map(m => {
            if (m.id !== assistantId) return m;
            const newComponents = [...m.components];
            newComponents[newComponents.length - 1] = {
              ...newComponents[newComponents.length - 1],
              content: currentText
            };
            return { ...m, components: newComponents };
          }));
          await new Promise(r => setTimeout(r, 20));
        }
      } else {
        await new Promise(r => setTimeout(r, 600));
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, components: [...m.components, component] }
            : m
        ));
      }
    }
  };

  const handleSendMessage = async (manualMessage = null) => {
    const messageToSend = manualMessage || inputMessage.trim();
    if (!messageToSend || !sessionId || isLoading) return;

    if (!manualMessage) {
      setInputMessage('');
    }

    const userEntry = {
      id: Date.now().toString(),
      role: 'user',
      components: [{ type: 'text', content: messageToSend }]
    };

    setMessages(prev => [...prev, userEntry]);
    setIsLoading(true);
    setError(null);

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE_URL}/chat/gen-ui`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: messageToSend
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setIsLoading(false);

      await simulateStreaming(data.components || []);

      // Update sidebar title after first message in a new session
      fetchSessions();
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Message generation stopped by user');
      } else {
        setError('Failed to send message. Check your backend connection.');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopMessage = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  const handleNewChat = async () => {
    // Delete current session if it's empty (no messages sent yet)
    if (sessionId && messages.length === 0) {
      try {
        await fetch(`${API_BASE_URL}/session/${sessionId}`, { method: 'DELETE' });
      } catch (_) { /* ignore */ }
    }
    setMessages([]);
    createSession();
  };

  const handleDeleteSession = async (sid) => {
    try {
      await fetch(`${API_BASE_URL}/session/${sid}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.session_id !== sid));
      // If deleting the active session, start a new one
      if (sid === sessionId) {
        setMessages([]);
        createSession();
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  const handleRenameSession = async (sid, newTitle) => {
    try {
      await fetch(`${API_BASE_URL}/session/${sid}/title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      setSessions(prev => prev.map(s =>
        s.session_id === sid ? { ...s, title: newTitle } : s
      ));
    } catch (err) {
      console.error('Failed to rename session', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    setSessionId(null);
    setMessages([]);
    setSessions([]);
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const userId = decoded.email;

      try {
        await fetch(`${API_BASE_URL}/user_context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            user_profile: { name: decoded.name, picture: decoded.picture },
            user_portfolio: []
          })
        });
      } catch (err) {
        console.warn('User context creation skipped', err);
      }

      const userData = {
        id: userId,
        name: decoded.name,
        picture: decoded.picture
      };
      saveUser(userData);
      setUser(userData);
    } catch (err) {
      console.error('Login failed', err);
      setError('Login failed. Please try again.');
    }
  };

  if (!user) {
    return <SignIn onLoginSuccess={handleLoginSuccess} onLoginError={() => setError('Login Failed')} />;
  }

  return (
    <div className="h-screen flex flex-row font-sans overflow-hidden bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        user={user}
        onLogout={handleLogout}
        sessions={sessions.filter(s => !s.is_empty)}
        activeSessionId={sessionId}
        onSelectSession={loadSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-200">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">InvestPal</h1>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-gray-500 font-medium">AI Financial Assistant</p>
                  {user && <span className="text-[10px] text-blue-600 font-medium">| {user.name}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                title="Toggle Dark Mode"
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-full text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                <span className={`w-2 h-2 rounded-full ${sessionId ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                {sessionId ? 'Connected' : 'Connecting...'}
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={createSession} className="underline hover:no-underline font-medium">Retry</button>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mb-2 shadow-sm transition-colors duration-200">
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to InvestPal</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Your intelligent financial companion. Ask about market trends, analyze stocks, or track your portfolio.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-8">
                {['Analyze AAPL stock', 'Show my portfolio summary', 'Latest market news', 'Compare TSLA and F'].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all text-left shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4 max-w-3xl mx-auto">
              {messages.map((msg, index) => (
                <ErrorBoundary key={index}>
                  <MessageBubble
                    message={msg}
                    isUser={msg.role === 'user'}
                    onAction={handleSendMessage}
                  />
                </ErrorBoundary>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3 transition-colors duration-200">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        <footer className="sticky bottom-0 z-40">
          <InputArea
            value={inputMessage}
            onChange={setInputMessage}
            onSend={() => handleSendMessage()}
            onStop={handleStopMessage}
            isLoading={isLoading}
            disabled={!sessionId}
          />
        </footer>
      </div>
    </div>
  );
}

export default App;
