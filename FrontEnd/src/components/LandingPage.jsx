import React from 'react';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="bg-white font-sans text-gray-900 overflow-x-hidden min-h-screen">
      {/* HEADER */}
      <header className="fixed w-full z-50 top-0 left-0 bg-white/90 backdrop-blur-md border-b border-gray-100" data-purpose="navigation-bar">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2" data-purpose="logo-container">
            <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">SmartTravel</span>
          </div>
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 font-medium text-gray-600">
            <a className="hover:text-blue-800 transition-colors" href="#explore">Explore</a>
            <a className="hover:text-blue-800 transition-colors" href="#features">Features</a>
            <a className="hover:text-blue-800 transition-colors" href="#community">Community</a>
            <a className="hover:text-blue-800 transition-colors" href="#about">About</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('login')}
              className="px-6 py-2 rounded-full border-2 border-blue-800 text-blue-800 font-bold hover:bg-blue-800 hover:text-white transition-all duration-300">
              LOGIN
            </button>
          </div>
        </nav>
      </header>

      <main className="pt-16">
        {/* HERO SECTION */}
        <section className="relative h-[90vh] flex items-center justify-center text-center px-4" data-purpose="hero-banner">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img alt="World Travel background" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn-oj1p4Jt07qFd7Ip4d_yBY0vydv00lLA64Wi1tNOhjM1jXJ-_RNuWyNE8DRbYGETaD_pQCMjlHyW-eJ7eC75BDBJ7NmQ0nwyzpj-cFzz8kMV4qeGvnupks-kK4M2W88C1mucjHIJxqxwsmio9MQDXoMv25ESlguIEDg8Fe7SkqkLEqJ_PsIhVMN4drsEsosq2exKA1Tn6DhNaTId_BzZ0J3Y3HJ9XUzpm-rRpORwRxTbeXkwK-m0IAyRKjJ9XpZQoHuBsVWEuKE" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-white">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              YOUR JOURNEY,<br /><span className="text-orange-500">REIMAGINED.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 font-light max-w-2xl mx-auto">
              Smart AI travel assistant for personalized itineraries and real-time recommendations.
            </p>
            <button 
              onClick={() => onNavigate('login')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg transform hover:scale-105 transition-all">
              START EXPLORING
            </button>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 bg-gray-50" id="features">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Elevate Your Travel Experience</h2>
              <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                <div className="w-14 h-14 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-800 group-hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">AI Recommendations</h3>
                <p className="text-gray-500">Smart logic tailored to your personal taste and past travels.</p>
              </div>
              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time Updates</h3>
                <p className="text-gray-500">Instant flight alerts, weather changes, and local crowd statuses.</p>
              </div>
              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                <div className="w-14 h-14 bg-green-100 text-green-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Itinerary Planner</h3>
                <p className="text-gray-500">Effortlessly drag and drop activities to build your perfect day.</p>
              </div>
              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Local Experiences</h3>
                <p className="text-gray-500">Discover hidden gems and authentic local spots away from crowds.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CHATBOT PREVIEW */}
        <section className="py-24 bg-white" data-purpose="ai-chatbot-preview">
          <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <span className="text-blue-800 font-bold tracking-widest uppercase mb-4 block">Meet your guide</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">Your Personal AI Concierge</h2>
              <p className="text-lg text-gray-600 mb-8">Ask anything. From finding the best ramen in Tokyo to booking a sunset cruise in Rio, our AI assistant handles the details so you can focus on the memories.</p>
              <ul className="space-y-4 text-gray-700 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Available 24/7 in 50+ languages
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Integrated with bookings and reservations
                </li>
              </ul>
              
              <button 
                onClick={() => onNavigate('login')}
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                Login to Chat
              </button>
            </div>
            
            <div className="lg:w-1/2 w-full max-w-md mx-auto">
              {/* Chatbot mock */}
              <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-800 relative group cursor-pointer" onClick={() => onNavigate('login')}>
                {/* Overlay asking to login */}
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                    Login required to chat
                  </div>
                </div>

                <div className="bg-gray-800 p-4 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-300 text-xs font-mono ml-auto">SmartTravel Assistant</span>
                </div>
                <div className="p-6 h-[400px] overflow-y-auto space-y-4 bg-gray-900 text-sm">
                  <div className="bg-gray-700 text-white p-3 rounded-lg rounded-tl-none self-start inline-block max-w-[80%]">
                    Hi! I'm planning a 3-day trip to Paris. Any suggestions?
                  </div>
                  <div className="bg-blue-800 text-white p-3 rounded-lg rounded-tr-none self-end block ml-auto max-w-[80%]">
                    Bonjour! I've curated a mix of classics and local secrets. Would you prefer a focus on Art, Gastronomy, or Romance?
                  </div>
                  <div className="bg-gray-700 text-white p-3 rounded-lg rounded-tl-none self-start inline-block max-w-[80%]">
                    Gastronomy for sure!
                  </div>
                  <div className="bg-blue-800 text-white p-3 rounded-lg rounded-tr-none self-end block ml-auto max-w-[80%]">
                    Excellent. I recommend starting with a pastry tour in Le Marais...
                  </div>
                </div>
                <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
                  <div className="flex-1 bg-gray-900 rounded-full px-4 py-2 text-gray-500 text-xs italic">Login to type a message...</div>
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white py-12 border-t border-gray-100 mt-20" data-purpose="main-footer">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">SmartTravel</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-medium">
              <a className="hover:text-blue-800" href="#">Privacy Policy</a>
              <a className="hover:text-blue-800" href="#">Terms of Service</a>
              <a className="hover:text-blue-800" href="#">Help Center</a>
            </div>
            <p className="text-sm text-gray-400">© 2026 SmartTravel Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
