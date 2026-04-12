import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import TaskList from './components/TaskList';

const AppContent = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),transparent_22%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-slate-950 via-slate-950/90 to-transparent pointer-events-none" />
      <div className="relative">
        <Header />
        <main className="relative mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <TaskList />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '13px',
            },
            success: {
              iconTheme: { primary: '#a855f7', secondary: '#1e293b' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#1e293b' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
