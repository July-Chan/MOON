import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Додали Outlet
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Account from './pages/Account';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import FolderView from './pages/FolderView';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import './App.css';

const ProtectedLayout = () => {
    const { isLoggedIn } = useContext(AuthContext);
    
    return isLoggedIn ? (
        <>
            <Navbar />
            <Outlet />
        </>
    ) : (
        <Navigate to="/login" />
    );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/lists/:id" element={<FolderView />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;