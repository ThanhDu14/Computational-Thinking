export const fetchPlaces = async () => {
  return fetch('/api/places').then(res => res.json());
};
