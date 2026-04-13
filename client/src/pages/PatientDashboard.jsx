import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineUser, HiOutlineLocationMarker, HiOutlineHeart, HiOutlinePhone, HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineCurrencyRupee, HiOutlinePencil, HiX, HiOutlineStar, HiStar } from 'react-icons/hi';
import { getPatientDashboard, updateProfile, createReview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '../utils/helpers';
import ReportTracker from '../components/tracking/ReportTracker';

const PatientDashboard = () => {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, accuracyScore: 5, comment: '' });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    age: user?.age || '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
    address: user?.address || '',
    medicalHistory: user?.medicalHistory || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const payload = { ...profileForm };
      if (payload.age === '') delete payload.age; // allow empty age
      const res = await updateProfile(payload);
      updateUser(res.data);
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
    setProfileSaving(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await createReview({
        labId: reviewModal.labId._id,
        rating: reviewForm.rating,
        accuracyScore: reviewForm.accuracyScore,
        comment: reviewForm.comment
      });
      alert('Review successfully published! Thanks for helping build trust.');
      setReviewModal(null);
      setReviewForm({ rating: 5, accuracyScore: 5, comment: '' });
      getPatientDashboard().then(res => setData(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review. You may have already reviewed this lab.');
    }
    setProfileSaving(false);
  };

  useEffect(() => {
    getPatientDashboard().then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  const stats = data?.stats || {};

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-900">
            Welcome, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-surface-500 mt-1">Track your bookings and reports</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <HiOutlineClipboardList className="text-2xl" />, label: 'Total Bookings', value: stats.totalBookings, color: 'from-primary-500 to-teal-500' },
            { icon: <HiOutlineClock className="text-2xl" />, label: 'Active', value: stats.activeBookings, color: 'from-medical-500 to-blue-500' },
            { icon: <HiOutlineCheckCircle className="text-2xl" />, label: 'Completed', value: stats.completedBookings, color: 'from-emerald-500 to-green-500' },
            { icon: <HiOutlineCurrencyRupee className="text-2xl" />, label: 'Total Spent', value: formatPrice(stats.totalSpent || 0), color: 'from-accent-500 to-orange-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-surface-200 p-5 card-hover">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>
                {s.icon}
              </div>
              <div className="font-display font-bold text-2xl text-surface-900">{s.value}</div>
              <div className="text-xs text-surface-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Bookings List */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-bold text-xl text-surface-900 mb-4">Your Bookings</h2>
            {data?.bookings?.length === 0 ? (
              <div className="bg-white rounded-2xl border border-surface-200 p-8 text-center">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-surface-500">No bookings yet</p>
                <Link to="/search" className="btn-primary mt-4 inline-block text-sm">Find Labs</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.bookings?.map(booking => (
                  <button
                    key={booking._id}
                    onClick={() => setSelectedBooking(selectedBooking?._id === booking._id ? null : booking)}
                    className={`w-full text-left bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                      selectedBooking?._id === booking._id ? 'border-primary-500' : 'border-surface-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-surface-900">{booking.testId?.testName}</h4>
                        <p className="text-sm text-surface-500 mt-0.5">{booking.labId?.name}</p>
                        <p className="text-xs text-surface-400 mt-1">{formatDate(booking.date)} · {booking.timeSlot}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                        <p className="text-sm font-semibold text-surface-700 mt-1">{formatPrice(booking.totalAmount)}</p>
                        {booking.status === 'delivered' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setReviewModal(booking); }}
                            className="mt-2 text-xs font-bold text-accent-600 hover:text-accent-700 block text-right w-full"
                          >
                            ⭐ Rate Experience
                          </button>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Tracker & Profile */}
          <div className="space-y-8">
            <div>
              {selectedBooking ? (
                <ReportTracker booking={selectedBooking} />
              ) : (
                <div className="bg-white rounded-2xl border border-surface-200 p-6 text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-surface-500 text-sm">Select a booking to track its report</p>
                </div>
              )}
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
              <div className="bg-surface-50 p-5 border-b border-surface-200 flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-surface-900 flex items-center gap-2">
                  <HiOutlineUser className="text-primary-500" /> Patient Profile
                </h3>
                <button onClick={() => setIsEditingProfile(true)} className="text-primary-600 hover:text-primary-700 bg-white p-2 rounded-lg border border-surface-200 shadow-sm transition-colors" title="Edit Profile">
                  <HiOutlinePencil />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-bold text-surface-400 tracking-wider uppercase">Contact Info</div>
                  <div className="text-sm font-medium text-surface-800 flex items-center gap-2"><HiOutlinePhone className="text-surface-400" /> {user?.phone || <span className="text-surface-300 italic">Not provided</span>}</div>
                  <div className="text-sm font-medium text-surface-800 flex items-center gap-2"><HiOutlineLocationMarker className="text-surface-400" /> {user?.city || <span className="text-surface-300 italic">Not provided</span>}</div>
                  {user?.address && <div className="text-sm text-surface-600 mt-1 pl-6">{user.address}</div>}
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-surface-100 pt-4">
                  <div>
                    <div className="text-xs font-bold text-surface-400 tracking-wider uppercase flex items-center gap-1 mb-1"><HiOutlineHeart /> Age</div>
                    <div className="text-sm font-semibold text-surface-800">{user?.age ? `${user.age} yrs` : '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-surface-400 tracking-wider uppercase flex items-center gap-1 mb-1"><HiOutlineUser /> Gender</div>
                    <div className="text-sm font-semibold text-surface-800">{user?.gender || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-surface-400 tracking-wider uppercase flex items-center gap-1 mb-1">🩸 Blood</div>
                    <div className="text-sm font-semibold text-surface-800">{user?.bloodGroup || '-'}</div>
                  </div>
                </div>
                {user?.medicalHistory && (
                  <div className="border-t border-surface-100 pt-4">
                    <div className="text-xs font-bold text-surface-400 tracking-wider uppercase mb-1">Medical History</div>
                    <p className="text-sm text-surface-600 leading-relaxed bg-surface-50 p-3 rounded-xl border border-surface-100">{user.medicalHistory}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up">
            <div className="p-6 border-b border-surface-200 flex items-center justify-between bg-surface-50 rounded-t-2xl">
              <h2 className="font-display font-bold text-xl text-surface-900">Edit Patient Profile</h2>
              <button disabled={profileSaving} onClick={() => setIsEditingProfile(false)} className="text-surface-400 hover:text-surface-600 p-1">
                <HiX className="text-2xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="profileForm" onSubmit={handleProfileSave} className="space-y-5">
                <p className="text-sm text-surface-500 mb-6 bg-primary-50 p-3 rounded-lg border border-primary-100 line-clamp-2">
                  <span className="font-semibold text-primary-700">Optional:</span> Fill in any medical or contact details below. These are not required to use the platform but help streamline your diagnostic bookings!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Phone Number</label>
                    <input type="text" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+91..." />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">City</label>
                    <input type="text" value={profileForm.city} onChange={e => setProfileForm(f => ({ ...f, city: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Age</label>
                    <input type="number" min="0" max="150" value={profileForm.age} onChange={e => setProfileForm(f => ({ ...f, age: e.target.value }))} className="input-field" placeholder="Yrs" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Blood Group</label>
                    <select value={profileForm.bloodGroup} onChange={e => setProfileForm(f => ({ ...f, bloodGroup: e.target.value }))} className="input-field bg-white">
                      <option value="">Select</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Gender</label>
                    <div className="flex gap-4">
                      {['Male', 'Female', 'Other'].map(g => (
                        <label key={g} className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer p-2 border border-surface-200 rounded-lg hover:bg-surface-50 flex-1 justify-center">
                          <input type="radio" name="gender" value={g} checked={profileForm.gender === g} onChange={e => setProfileForm(f => ({ ...f, gender: e.target.value }))} className="text-primary-600 focus:ring-primary-500" />
                          {g}
                        </label>
                      ))}
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Full Address</label>
                  <input type="text" value={profileForm.address} onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))} className="input-field" placeholder="House No, Street, Landmark" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Medical History / Allergies</label>
                  <textarea value={profileForm.medicalHistory} onChange={e => setProfileForm(f => ({ ...f, medicalHistory: e.target.value }))} className="input-field resize-none h-24" placeholder="Briefly describe any chronic conditions, allergies, or regular medications..." />
                </div>
                
                <div className="pt-6 mt-4 border-t border-surface-200 flex justify-end gap-3">
                  <button disabled={profileSaving} type="button" onClick={() => setIsEditingProfile(false)} className="btn-secondary !px-6">Cancel</button>
                  <button type="submit" disabled={profileSaving} className="btn-primary !px-8">
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Leave Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden">
            <div className="bg-gradient-to-r from-accent-500 to-orange-500 p-6 text-white relative">
              <h2 className="font-display font-bold text-xl">Rate Your Experience</h2>
              <p className="text-accent-100 text-sm mt-1">For {reviewModal.labId?.name}</p>
              <button 
                onClick={() => setReviewModal(null)} 
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                disabled={profileSaving}
              >
                <HiX className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-6">
              
              {/* Overall Experience */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Overall Experience Score (1-5)</label>
                <div className="flex gap-2 text-2xl text-surface-300">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={`rating-${star}`} onClick={() => setReviewForm(f => ({ ...f, rating: star }))} className={`focus:outline-none transition-colors ${reviewForm.rating >= star ? 'text-accent-500' : 'hover:text-accent-300'}`}>
                      {reviewForm.rating >= star ? <HiStar /> : <HiOutlineStar />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accuracy / Hygiene */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Diagnostic Reliability Score (1-5)</label>
                <div className="flex gap-2 text-2xl text-surface-300">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={`acc-${star}`} onClick={() => setReviewForm(f => ({ ...f, accuracyScore: star }))} className={`focus:outline-none transition-colors ${reviewForm.accuracyScore >= star ? 'text-primary-500' : 'hover:text-primary-300'}`}>
                      {reviewForm.accuracyScore >= star ? <HiStar /> : <HiOutlineStar />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Box */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Elaborate (Optional)</label>
                <textarea 
                  value={reviewForm.comment} 
                  onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))}
                  placeholder="Drop a quick note about staff behavior, cleanliness, or report delivery speed..."
                  className="input-field resize-none h-24 text-sm"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={profileSaving}
                  className="btn-primary w-full shadow-lg shadow-primary-500/30"
                >
                  {profileSaving ? 'Publishing...' : 'Publish Public Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDashboard;
