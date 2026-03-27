import React from 'react';
import PlaceCard from '../places/PlaceCard';

const RecommendationList = ({ recommendations = [], title = "Recommended For You", subtitle = "Hand-picked destinations based on your preferences." }) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 text-lg">{subtitle}</p>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recommendations.map((place, index) => (
              <PlaceCard key={place.id || index} place={place} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No recommendations found right now.</p>
            <button className="mt-4 px-6 py-2 rounded-full border-2 border-blue-800 text-blue-800 font-bold hover:bg-blue-800 hover:text-white transition-all duration-300">
              Update Preferences
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendationList;
