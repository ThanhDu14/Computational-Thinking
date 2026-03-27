import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './UI/Login'
import RegisterPage from './UI/Register'
import Layout from './components/layout/Layout'

// Existing Pages
import HomePage from './pages/Home/HomePage'
import PlaceDetailPage from './pages/PlaceDetail/PlaceDetailPage'
import RecommendationsPage from './pages/Recommendations/RecommendationsPage'
import SearchPage from './pages/Search/SearchPage'
import AboutPage from './pages/About/AboutPage'
import DestinationsPage from './pages/Destinations/DestinationsPage'
import ContactPage from './pages/Contact/ContactPage'
import BlogPage from './pages/Blog/BlogPage'

import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Protected/Main Routes wi  th Layout (Navbar & Footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/place/:id" element={<PlaceDetailPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  )
}

export default App
