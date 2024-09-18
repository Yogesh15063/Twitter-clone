import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import { Toaster } from 'react-hot-toast';
import { useQuery } from 'react-query';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json(); // make sure to await the json response
        if (data.error) return null;
        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        return data;
      } catch (error) {
        console.error('Error fetching auth user:', error);
        return null; // In case of error, treat the user as unauthenticated
      }
    },
    retry: false,
  });

  // Ensure that loading spinner shows during fetching user status
  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <>
      <div className='flex max-w-6xl mx-auto'>
        {authUser && <Sidebar />}

        <Routes>
          <Route
            path='/'
            element={authUser ? <HomePage /> : <Navigate to='/login' replace />}
          />
          <Route
            path='/login'
            element={!authUser ? <LoginPage /> : <Navigate to='/' replace />}
          />
          <Route
            path='/signup'
            element={!authUser ? <SignUpPage /> : <Navigate to='/' replace />}
          />
          <Route
            path='/notifications'
            element={authUser ? <NotificationPage /> : <Navigate to='/login' replace />}
          />
          <Route
            path='/profile/:username'
            element={authUser ? <ProfilePage /> : <Navigate to='/login' replace />}
          />
        </Routes>
        
        {authUser && <RightPanel />}
        <Toaster />
      </div>
    </>
  );
}

export default App;
