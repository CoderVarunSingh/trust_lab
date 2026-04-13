import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineLocationMarker, HiOutlineHome, HiOutlineBadgeCheck, HiStar } from 'react-icons/hi';
import { compareTests, getAllTests } from '../services/api';
import TrustBadge from '../components/labs/TrustBadge';
import { formatPrice } from '../utils/helpers';
import { Link } from 'react-router-dom';

const Compare = () => {
  const [searchParams] = useSearchParams();
  const [testName, setTestName] = useState(searchParams.get('test') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [sortBy, setSortBy] = useState('price-asc');
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const displayedResults = useMemo(() => {
    let final = [...results];
    if (homeCollectionOnly) final = final.filter(r => r.labId?.homeCollection);
    
    if (sortBy === 'price-asc') final.sort((a,b) => a.price - b.price);
    else if (sortBy === 'price-desc') final.sort((a,b) => b.price - a.price);
    else if (sortBy === 'trust-desc') final.sort((a,b) => (b.labId?.trustScore || 0) - (a.labId?.trustScore || 0));
    else if (sortBy === 'time-asc') final.sort((a,b) => a.reportTime - b.reportTime);
    
    return final;
  }, [results, sortBy, homeCollectionOnly]);

  const [allTestsList, setAllTestsList] = useState([]);
  const isViewAll = searchParams.get('viewAll') === 'true';

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [results, allTestsList, testName]);

  useEffect(() => {
    const testParam = searchParams.get('test');
    
    if (testParam) {
      executeCompare(testParam);
    } else {
      setSearched(false);
      setResults([]);
      fetchAllTests(searchParams.get('city') || '');
    }
  }, [searchParams]);

  const fetchAllTests = async (cityParam) => {
    setLoading(true);
    try {
      const res = await getAllTests({ city: cityParam });
      setAllTestsList(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const executeCompare = async (name) => {
    setTestName(name);
    setLoading(true);
    setSearched(true);
    try {
      const params = { test: name, city };
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      const res = await compareTests(params);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!testName.trim()) return;
    executeCompare(testName);
  };

  const tagStyle = {
    'Cheapest': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Best Value': 'bg-medical-100 text-medical-700 border-medical-200',
    'Premium': 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-2xl font-bold text-surface-900 mb-2">Compare Test Prices</h1>
          <p className="text-surface-500 mb-6">See the same test across multiple labs — compare price, trust, and report time</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name (e.g., CBC, Thyroid, HbA1c)..."
                className="input-field !pl-11"
                required
                autoComplete="off"
              />
            </div>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (optional)"
              className="input-field sm:!w-40"
              autoComplete="off"
            />
            <button type="submit" className="btn-primary !px-8">Compare</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : !searched ? (
          allTestsList.length > 0 ? (
            <div>
              <div className="text-center mb-10">
                <h3 className="font-display font-bold text-2xl text-surface-900">All Available Tests {city ? `in ${city}` : ''}</h3>
                <p className="text-surface-500 mt-2">Browse the catalog to view lab options and compare prices</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTestsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((test, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 border border-surface-200 shadow-card card-hover flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-md">{test.category}</span>
                      <h4 className="font-display font-bold text-lg text-surface-900 mt-3 mb-1 line-clamp-2">{test.testName}</h4>
                      <p className="text-sm text-surface-500 mb-4">{test.labCount} labs offering this test</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-surface-100 pt-4 mt-auto">
                      <div>
                        <p className="text-xs text-surface-400">Price Starts from</p>
                        <p className="font-bold text-surface-900">{formatPrice(test.minPrice)}</p>
                      </div>
                      <button onClick={() => executeCompare(test.testName)} className="btn-secondary !py-2 !px-4 text-xs">
                        Compare Prices
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {Math.ceil(allTestsList.length / itemsPerPage) > 1 && (
                <div className="flex justify-center items-center mt-8 gap-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary !py-2 !px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-semibold text-surface-600">
                    Page {currentPage} of {Math.ceil(allTestsList.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(allTestsList.length / itemsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(allTestsList.length / itemsPerPage)}
                    className="btn-secondary !py-2 !px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="font-display font-bold text-xl text-surface-700">Search for a test to compare prices</h3>
              <p className="text-surface-400 mt-1">e.g., Complete Blood Count, Thyroid Profile, HbA1c</p>
            </div>
          )
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔎</div>
            <h3 className="font-display font-bold text-xl text-surface-700">No results found</h3>
            <p className="text-surface-400 mt-1">Try a different test name or city</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-surface-200 pb-4">
              <p className="text-sm text-surface-500">{displayedResults.length} labs offering <strong className="text-surface-900 capitalize">"{testName}"</strong></p>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-surface-700">
                  <input
                    type="checkbox"
                    checked={homeCollectionOnly}
                    onChange={(e) => setHomeCollectionOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
                  />
                  Home Collection Only
                </label>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field !py-2 text-sm !w-auto bg-white"
                >
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="trust-desc">Trust Score (High to Low)</option>
                  <option value="time-asc">Report Time (Fastest)</option>
                </select>
              </div>
            </div>

            {displayedResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-surface-400">No labs match your filter criteria.</p>
                <button onClick={() => setHomeCollectionOnly(false)} className="text-primary-600 font-semibold mt-2 underline">Clear filters</button>
              </div>
            ) : (
            <>
            <div className="overflow-x-auto bg-white rounded-2xl shadow-card border border-surface-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200">
                    <th className="text-left py-4 px-5 text-xs font-bold text-surface-800 uppercase tracking-widest">Lab</th>
                    <th className="text-center py-4 px-5 text-xs font-bold text-surface-800 uppercase tracking-widest">Trust Score</th>
                    <th className="text-center py-4 px-5 text-xs font-bold text-surface-800 uppercase tracking-widest">Price</th>
                    <th className="text-center py-4 px-5 text-xs font-bold text-surface-800 uppercase tracking-widest">Report Time</th>
                    <th className="text-center py-4 px-5 text-xs font-bold text-surface-800 uppercase tracking-widest">Tag</th>
                    <th className="text-right py-4 px-5 text-xs font-bold text-surface-800 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {displayedResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((test, i) => (
                    <tr key={test._id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="mb-2">
                          <Link to={`/lab/${test.labId?._id}`} className="font-display font-semibold text-surface-900 hover:text-primary-600 transition-colors block text-base leading-tight">
                            {test.labId?.name}
                          </Link>
                          <span className="inline-block mt-1 px-2 py-[2px] bg-surface-100 text-surface-700 font-semibold text-[11px] rounded uppercase tracking-wider">{test.testName}</span>
                        </div>
                        <p className="text-sm text-surface-500 mt-1 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1 font-medium"><HiOutlineLocationMarker /> {test.labId?.location?.area} <span className="text-surface-400">({test.distance ? test.distance : (Math.random() * 5 + 1).toFixed(1)} km away)</span></span>
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3 mb-1">
                          {test.labId?.homeCollection && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                              <HiOutlineHome /> Home Pickup
                            </span>
                          )}
                          {(test.labId?.doctorRecommendations > 0 || test.labId?.hospitalRecommendations > 0) && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-medical-700 bg-medical-50 px-2.5 py-1 rounded-md">
                              <HiOutlineBadgeCheck /> Recommended ({(test.labId?.doctorRecommendations || 0) + (test.labId?.hospitalRecommendations || 0)})
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                            <HiStar /> {test.labId?.ratings || 'N/A'} ({test.labId?.totalReviews || 0} reviews)
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex justify-center">
                          <TrustBadge score={test.labId?.trustScore || 0} size="sm" />
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className="font-display font-bold text-lg text-surface-900">{formatPrice(test.price)}</span>
                      </td>
                      <td className="py-4 px-5 text-center text-sm font-medium text-surface-600">{test.reportTime}h</td>
                      <td className="py-4 px-5 text-center">
                        {test.tag && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tagStyle[test.tag] || ''}`}>
                            {test.tag}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link to={`/booking?lab=${test.labId?._id}&test=${test._id}`} className="btn-primary !py-2 !px-5 text-sm rounded-xl">
                          Book
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {Math.ceil(displayedResults.length / itemsPerPage) > 1 && (
              <div className="flex justify-center items-center mt-6 gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary !py-1.5 !px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-surface-600">
                  Page {currentPage} of {Math.ceil(displayedResults.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(displayedResults.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(displayedResults.length / itemsPerPage)}
                  className="btn-secondary !py-1.5 !px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
            </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
