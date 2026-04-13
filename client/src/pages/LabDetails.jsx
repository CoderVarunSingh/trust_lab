import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiOutlineStar, HiOutlineClock, HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail, HiOutlineShieldCheck } from 'react-icons/hi';
import { FaHome, FaUserMd, FaHospital } from 'react-icons/fa';
import { getLabById, createReview } from '../services/api';
import TrustBadge from '../components/labs/TrustBadge';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getTrustTier } from '../utils/helpers';

const LabDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');
  const [reviewForm, setReviewForm] = useState({ rating: 5, accuracyScore: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getLabById(id).then(res => { setLab(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      await createReview({ labId: id, ...reviewForm });
      const res = await getLabById(id);
      setLab(res.data);
      setReviewForm({ rating: 5, accuracyScore: 5, comment: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  if (!lab) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-surface-700">Lab not found</h2>
        <Link to="/search" className="text-primary-600 mt-2 inline-block">← Back to search</Link>
      </div>
    </div>
  );

  const tier = getTrustTier(lab.trustScore);

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Lab Header */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <TrustBadge score={lab.trustScore} size="lg" />
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-surface-900">{lab.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-surface-500 text-sm">
                <span className="flex items-center gap-1"><HiOutlineLocationMarker /> {lab.location?.address}</span>
                <span className="flex items-center gap-1"><HiOutlinePhone /> {lab.phone}</span>
                <span className="flex items-center gap-1"><HiOutlineClock /> {lab.operatingHours}</span>
              </div>
              <p className="text-surface-600 mt-3 max-w-2xl">{lab.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {lab.doctorRecommendations > 10 && <span className="tag-doctor flex items-center gap-1"><FaUserMd className="text-[10px]" /> {lab.doctorRecommendations} Doctor Recommendations</span>}
                {lab.hospitalRecommendations > 3 && <span className="tag-hospital flex items-center gap-1"><FaHospital className="text-[10px]" /> {lab.hospitalRecommendations} Hospital Recommendations</span>}
                {lab.homeCollection && <span className="tag-home flex items-center gap-1"><FaHome className="text-[10px]" /> Home Collection</span>}
                {lab.accreditedBy?.map((a, i) => (
                  <span key={i} className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100 flex items-center gap-1">
                    <HiOutlineShieldCheck className="text-xs" /> {a}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <HiOutlineStar className="text-accent-500 text-lg" />
                  <span className="font-bold text-lg">{lab.ratings}</span>
                  <span className="text-sm text-surface-400">({lab.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-1 bg-surface-100 rounded-xl p-1 mb-8 max-w-md">
          {['tests', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              {tab === 'tests' ? `Tests (${lab.tests?.length || 0})` : `Reviews (${lab.reviews?.length || 0})`}
            </button>
          ))}
        </div>

        {activeTab === 'tests' && (
          <div className="grid gap-4">
            {lab.tests?.map(test => (
              <div key={test._id} className="bg-white rounded-xl border border-surface-200 p-5 flex items-center justify-between card-hover">
                <div className="flex-1">
                  <h4 className="font-semibold text-surface-900">{test.testName}</h4>
                  <p className="text-sm text-surface-500 mt-1">{test.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-surface-400">
                    <span className="flex items-center gap-1"><HiOutlineClock /> {test.reportTime}h report time</span>
                    <span className="px-2 py-0.5 bg-surface-100 rounded-md text-xs">{test.category}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="font-display font-bold text-xl text-surface-900">{formatPrice(test.price)}</div>
                  <Link
                    to={`/booking?lab=${lab._id}&test=${test._id}`}
                    className="btn-primary !py-2 !px-5 text-sm mt-2 inline-block"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Review Form */}
            {user?.role === 'patient' && (
              <form onSubmit={handleReview} className="bg-white rounded-2xl border border-surface-200 p-6">
                <h3 className="font-display font-bold text-lg text-surface-900 mb-4">Write a Review</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-semibold text-surface-700 block mb-1">Rating</label>
                    <select value={reviewForm.rating} onChange={e => setReviewForm(f => ({ ...f, rating: Number(e.target.value) }))} className="input-field !py-2">
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-surface-700 block mb-1">Accuracy Score</label>
                    <select value={reviewForm.accuracyScore} onChange={e => setReviewForm(f => ({ ...f, accuracyScore: Number(e.target.value) }))} className="input-field !py-2">
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}
                    </select>
                  </div>
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  rows={3}
                  className="input-field mb-4"
                />
                <button type="submit" disabled={submitting} className="btn-primary text-sm">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            {lab.reviews?.map(review => (
              <div key={review._id} className="bg-white rounded-xl border border-surface-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-medical-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {review.userId?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-surface-800">{review.userId?.name || 'Anonymous'}</p>
                    <p className="text-xs text-surface-400">{formatDate(review.createdAt)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm">
                      <HiOutlineStar className="text-accent-500" />
                      <span className="font-semibold">{review.rating}/5</span>
                    </div>
                    <div className="text-xs bg-surface-100 px-2 py-1 rounded-md">
                      Accuracy: {review.accuracyScore}/5
                    </div>
                  </div>
                </div>
                {review.comment && <p className="text-surface-600 text-sm">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabDetails;
