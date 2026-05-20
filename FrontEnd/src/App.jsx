import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './UI/AuthPage'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import TopProgressBar from './components/common/TopProgressBar'

import HomePage from './pages/Home/HomePage'
import PlaceDetailPage from './pages/PlaceDetail/PlaceDetailPage'
import RecommendationsPage from './pages/Recommendations/RecommendationsPage'
import MyItinerariesPage from './pages/MyItineraries/MyItinerariesPage'
import SearchPage from './pages/Search/SearchPage'
import AboutPage from './pages/About/AboutPage'
import DestinationsPage from './pages/Destinations/DestinationsPage'
import ContactPage from './pages/Contact/ContactPage'
import BlogPage from './pages/Blog/BlogPage'
import AiConciergePage from './pages/AiConcierge/AiConciergePage'
import BlogDetailPage from './pages/Blog/BlogDetailPage'
import WishlistPage from './pages/Wishlist/WishlistPage'
import SettingsPage from './pages/Settings/SettingsPage'

import './App.css'

function App() {
  return (
    <Router>
      <TopProgressBar />
      <Routes>
        {/* Public routes — có Navbar + Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/place/:id" element={<PlaceDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />

          {/* Protected routes — yêu cầu đăng nhập */}
          <Route element={<ProtectedRoute />}>
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/my-itineraries" element={<MyItinerariesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/ai-concierge" element={<AiConciergePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Auth routes — không có Layout */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  )
}

export default App
