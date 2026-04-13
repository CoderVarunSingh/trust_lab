import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';
import { getLabs } from '../services/api';
import LabCard from '../components/labs/LabCard';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('test') || searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    sortBy: searchParams.get('sort') || 'trust',
    homeCollection: searchParams.get('home') === 'true',
    minTrust: searchParams.get('trust') || '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const updateFilter = (key, value) => {
    setFilters(f => {
      const newFilters = { ...f, [key]: value };
      fetchLabsWithFilters(newFilters, userLocation);
      return newFilters;
    });
  };

  const fetchLabs = async (location = userLocation) => {
    fetchLabsWithFilters(filters, location);
  };

  const fetchLabsWithFilters = async (currentFilters, location = userLocation) => {
    setLoading(true);
    try {
      const params = {};
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.city) params.city = currentFilters.city;
      if (currentFilters.sortBy) params.sortBy = currentFilters.sortBy;
      if (currentFilters.homeCollection) params.homeCollection = 'true';
      if (currentFilters.minTrust) params.minTrust = currentFilters.minTrust;
      if (location) {
        params.lat = location.lat;
        params.lng = location.lng;
      }
      // Ensure we get all labs initially, bounded by backend limit 100
      params.limit = 100;
      
      const res = await getLabs(params);
      setLabs(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          fetchLabs(loc); // Fetch again with distance!
        },
        () => {
          fetchLabs(); // Proceed without location
        },
        { timeout: 5000 }
      );
    } else {
      fetchLabs();
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLabs();
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-display text-2xl font-bold text-surface-900 mb-4">Find Diagnostic Labs</h1>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                placeholder="Search labs or tests..."
                className="input-field !pl-11"
              />
            </div>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
              placeholder="City"
              className="input-field !w-40 hidden sm:block"
            />
            <button type="submit" className="btn-primary !px-6">Search</button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn-secondary !px-3"
            >
              <HiOutlineAdjustments className="text-xl" />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block fixed inset-0 z-40 bg-white p-6 overflow-y-auto' : 'hidden'} md:block md:static md:w-64 flex-shrink-0`}>
            {showFilters && (
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)}><HiOutlineX className="text-2xl" /></button>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-surface-200 p-5 space-y-6 md:sticky md:top-24">
              <h3 className="font-display font-bold text-surface-900">Filters</h3>

              {/* Sort */}
              <div>
                <label className="text-sm font-semibold text-surface-700 block mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="input-field !py-2 text-sm"
                >
                  <option value="trust">Trust Score (High→Low)</option>
                  <option value="rating">Rating (High→Low)</option>
                  <option value="name">Name (A→Z)</option>
                </select>
              </div>

              {/* Min Trust */}
              <div>
                <label className="text-sm font-semibold text-surface-700 block mb-2">Min Trust Score</label>
                <select
                  value={filters.minTrust}
                  onChange={(e) => updateFilter('minTrust', e.target.value)}
                  className="input-field !py-2 text-sm"
                >
                  <option value="">Any</option>
                  <option value="80">80+ (Reliable)</option>
                  <option value="50">50+ (Average+)</option>
                </select>
              </div>

              {/* Home Collection */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.homeCollection}
                  onChange={(e) => updateFilter('homeCollection', e.target.checked)}
                  className="w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-700">Home Collection Only</span>
              </label>

              <button onClick={fetchLabs} className="btn-primary w-full text-sm">Apply Filters</button>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-surface-500">
                {loading ? 'Searching...' : `${labs.length} labs found`}
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-surface-200 p-6 animate-pulse">
                    <div className="flex justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="h-5 bg-surface-200 rounded w-48" />
                        <div className="h-4 bg-surface-100 rounded w-32" />
                        <div className="flex gap-2">
                          <div className="h-6 bg-surface-100 rounded-full w-28" />
                          <div className="h-6 bg-surface-100 rounded-full w-24" />
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-surface-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : labs.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔬</div>
                <h3 className="font-display font-bold text-xl text-surface-700 mb-2">No labs found</h3>
                <p className="text-surface-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {labs.map(lab => (
                  <LabCard key={lab._id} lab={lab} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
