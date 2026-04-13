import { useState, useEffect } from 'react';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineCurrencyRupee, HiOutlineStar, HiX, HiUpload, HiOutlinePencilAlt, HiOutlinePhotograph, HiTrash } from 'react-icons/hi';
import { getLabDashboard, updateBookingStatus, uploadReportPDF, createLabTest, updateLabProfile, uploadLabPhoto, deleteLabPhoto, deleteLabTest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '../utils/helpers';
import TrustBadge from '../components/labs/TrustBadge';

const statusFlow = ['booked', 'sample_collected', 'testing', 'report_ready', 'delivered'];

const LabDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Physical PDF Upload State
  const [reportModal, setReportModal] = useState({ isOpen: false, bookingId: null, file: null });

  // New Test State
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [testForm, setTestForm] = useState({ testName: '', category: 'General', price: '', minPrice: '', turnAroundTime: '24', requirements: '', fastingRequired: false, popular: false });
  const [testError, setTestError] = useState('');

  // Lab Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '', phone: '', email: '', operatingHours: '', description: '',
    city: '', area: '', address: '', file: null
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = () => {
    getLabDashboard().then(res => {
      setData(res.data);
      if (res.data?.lab) {
        setProfileForm({
          name: res.data.lab.name || '',
          phone: res.data.lab.phone || '',
          email: res.data.lab.email || '',
          operatingHours: res.data.lab.operatingHours || '',
          description: res.data.lab.description || '',
          city: res.data.lab.location?.city || '',
          area: res.data.lab.location?.area || '',
          address: res.data.lab.location?.address || '',
          file: null
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (bookingId, currentStatus) => {
    const currentIdx = statusFlow.indexOf(currentStatus);
    if (currentIdx >= statusFlow.length - 1) return;
    const nextStatus = statusFlow[currentIdx + 1];

    if (nextStatus === 'delivered') {
      // Intercept and ask for physical PDF 
      setReportModal({ isOpen: true, bookingId, file: null });
      return;
    }

    setIsUpdating(true);
    try {
      await updateBookingStatus(bookingId, {
        status: nextStatus,
        note: `Status updated to ${getStatusLabel(nextStatus)}`
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
    setIsUpdating(false);
  };

  const handleFileUpload = async () => {
    if (!reportModal.file) return;
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('reportPDF', reportModal.file);

      await uploadReportPDF(reportModal.bookingId, formData);
      fetchData();
      setReportModal({ isOpen: false, bookingId: null, file: null });
    } catch (err) {
      alert(err.response?.data?.message || 'File upload securely failed.');
    }
    setIsUpdating(false);
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setTestError('');
    try {
      const payload = {
        testName: testForm.testName,
        category: testForm.category,
        price: Number(testForm.price),
        reportTime: Number(testForm.turnAroundTime),
        description: testForm.requirements || '',
        popular: testForm.popular
      };
      await createLabTest(payload);
      fetchData();
      setIsAddingTest(false);
      setTestForm({ testName: '', category: 'General', price: '', minPrice: '', turnAroundTime: '24', requirements: '', fastingRequired: false, popular: false });
    } catch (err) {
      setTestError(err.response?.data?.message || err.message || 'Failed to create test due to server error.');
      alert(err.response?.data?.message || 'Failed to create test.');
    }
    setIsUpdating(false);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setTestError('');
    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
        email: profileForm.email,
        description: profileForm.description,
        operatingHours: profileForm.operatingHours,
        location: {
          city: profileForm.city,
          area: profileForm.area,
          address: profileForm.address,
        }
      };

      await updateLabProfile(data.lab._id, payload);

      if (profileForm.file) {
        const formData = new FormData();
        formData.append('photo', profileForm.file);
        formData.append('isProfile', 'true');
        await uploadLabPhoto(data.lab._id, formData);
      }

      fetchData();
      setIsEditingProfile(false);
    } catch (err) {
      setTestError(err.response?.data?.message || 'Failed to save profile changes.');
    }
    setIsUpdating(false);
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await uploadLabPhoto(data.lab._id, formData);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to securely upload gallery image.');
    }
    setIsUpdating(false);
    e.target.value = null; // reset input
  };

  const handleDeleteTest = async (testId) => {
    setIsUpdating(true);
    setTestError('');
    try {
      await deleteLabTest(testId);
      getLabDashboard().then(res => setData(res.data)); // Hard refresh local state explicitly
    } catch (err) {
      setTestError(err.response?.data?.message || 'Failed to delete test. Please try again.');
    }
    setIsUpdating(false);
  };

  const handleGalleryDelete = async (photoPath) => {
    setIsUpdating(true);
    setTestError('');
    try {
      await deleteLabPhoto(data.lab._id, photoPath);
      getLabDashboard().then(res => setData(res.data)); // Hard refresh local state explicitly
    } catch (err) {
      setTestError(err.response?.data?.message || 'Failed to delete gallery image.');
    }
    setIsUpdating(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  const stats = data?.stats || {};

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rich Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src={data?.lab?.image || `https://ui-avatars.com/api/?name=${data?.lab?.name}&background=random`}
            alt={data?.lab?.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-surface-50 shadow-sm"
          />
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-surface-900">{data?.lab?.name}</h1>
                <p className="text-surface-500 mt-1 text-sm max-w-2xl">{data?.lab?.description || "No public description provided yet."}</p>
              </div>
              <div className="flex items-center gap-4">
                <TrustBadge score={stats.trustScore || 0} size="md" />
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="btn-secondary !py-2 flex items-center gap-2 whitespace-nowrap"
                >
                  <HiOutlinePencilAlt /> Edit Profile Details
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-surface-100">
              <div>
                <p className="text-xs text-surface-400 font-semibold mb-1 uppercase tracking-wider">Contact Phone</p>
                <p className="text-sm font-semibold text-surface-800">{data?.lab?.phone || "Not set"}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400 font-semibold mb-1 uppercase tracking-wider">Contact Email</p>
                <p className="text-sm font-semibold text-surface-800 break-all">{data?.lab?.email || "Not set"}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400 font-semibold mb-1 uppercase tracking-wider">Operating Hours</p>
                <p className="text-sm font-semibold text-surface-800">{data?.lab?.operatingHours || "Not set"}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400 font-semibold mb-1 uppercase tracking-wider">Primary Location</p>
                <p className="text-sm font-semibold text-surface-800">{data?.lab?.location?.area || "Area Not Set"}, {data?.lab?.location?.city || "City Not Set"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Notification Bar */}
        {testError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between animate-fade-in shadow-sm">
            <div className="flex items-center gap-2">
              <HiX className="text-xl" />
              <span className="font-semibold text-sm">{testError}</span>
            </div>
            <button onClick={() => setTestError('')} className="text-red-500 hover:text-red-700 transition-colors">
              <HiX />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-surface-200 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview & Bookings' },
            { id: 'tests', label: `Test Inventory (${stats.totalTests || 0})` },
            { id: 'patients', label: `Patients CRM (${data?.patients?.length || 0})` },
            { id: 'reviews', label: `Trust Ratings (${data?.reviews?.length || 0})` },
            { id: 'photos', label: `Gallery Photos (${data?.lab?.photos?.length || 0})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 font-semibold text-sm transition-all border-b-2 ${activeTab === tab.id ? 'border-primary-500 text-primary-700' : 'border-transparent text-surface-500 hover:text-surface-800'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview & Bookings */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: <HiOutlineClipboardList />, label: 'Total Bookings', value: stats.totalBookings, color: 'from-primary-500 to-teal-500' },
                { icon: <HiOutlineClock />, label: 'Pending', value: stats.pendingBookings, color: 'from-amber-500 to-orange-500' },
                { icon: <HiOutlineClock />, label: 'In Progress', value: stats.inProgressBookings, color: 'from-medical-500 to-blue-500' },
                { icon: <HiOutlineCheckCircle />, label: 'Completed', value: stats.completedBookings, color: 'from-emerald-500 to-green-500' },
                { icon: <HiOutlineCurrencyRupee />, label: 'Revenue', value: formatPrice(stats.totalRevenue || 0), color: 'from-purple-500 to-pink-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-surface-200 p-4 card-hover">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-lg mb-2`}>
                    {s.icon}
                  </div>
                  <div className="font-display font-bold text-xl text-surface-900">{s.value}</div>
                  <div className="text-xs text-surface-400">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
              <div className="p-5 border-b border-surface-100 flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-surface-900">Active Bookings Pipeline</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-50">
                      <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Patient</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Test</th>
                      <th className="text-center py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Date</th>
                      <th className="text-center py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Status</th>
                      <th className="text-center py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Amount</th>
                      <th className="text-right py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {data?.bookings?.map(booking => (
                      <tr key={booking._id} className="hover:bg-surface-50 transition-colors">
                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-sm text-surface-800">{booking.userId?.name}</p>
                          <p className="text-xs text-surface-400">{booking.userId?.phone}</p>
                        </td>
                        <td className="py-3.5 px-5 text-sm text-surface-700">{booking.testId?.testName}</td>
                        <td className="py-3.5 px-5 text-center text-sm text-surface-600">{formatDate(booking.date || booking.createdAt)}</td>
                        <td className="py-3.5 px-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </span>
                          {booking.reportUrl && (
                            <a href={booking.reportUrl} target="_blank" rel="noreferrer" className="block text-xs text-primary-600 hover:underline mt-1">View Report</a>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-center text-sm font-semibold">{formatPrice(booking.totalAmount)}</td>
                        <td className="py-3.5 px-5 text-right">
                          {booking.status !== 'delivered' && (
                            <button disabled={isUpdating} onClick={() => handleStatusUpdate(booking._id, booking.status)} className="btn-primary !py-1.5 !px-3 text-xs">
                              {booking.status === 'report_ready' ? 'Upload PDF & Deliver →' : 'Next Stage →'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Test Inventory */}
        {activeTab === 'tests' && (
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-surface-100 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-surface-900">Lab Test Offerings</h2>
              <button onClick={() => setIsAddingTest(true)} className="btn-secondary !py-1.5 text-xs">+ Add New Test</button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Test Name</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Category</th>
                  <th className="text-center py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Price</th>
                  <th className="text-center py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Fasting Req</th>
                  <th className="text-right py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {data?.tests?.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-surface-500">No tests registered yet.</td></tr>
                ) : data?.tests?.map(t => (
                  <tr key={t._id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-sm text-surface-800">{t.testName}</td>
                    <td className="py-3.5 px-5 text-sm text-surface-600">{t.category}</td>
                    <td className="py-3.5 px-5 text-center text-sm font-semibold text-surface-900">{formatPrice(t.price)}</td>
                    <td className="py-3.5 px-5 text-center text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${t.fastingRequired ? 'bg-amber-100 text-amber-800' : 'bg-surface-100 text-surface-600'}`}>
                        {t.fastingRequired ? 'Required' : 'No'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button 
                        disabled={isUpdating}
                        onClick={() => handleDeleteTest(t._id)}
                        className="text-red-500 hover:text-red-600 font-semibold text-sm transition-colors flex items-center justify-end gap-1 w-full"
                      >
                        <HiTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Patients CRM */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-surface-100">
              <h2 className="font-display font-bold text-lg text-surface-900">Patient CRM Database</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Patient Name</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Contact Email</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Phone Number</th>
                  <th className="text-center py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Lifetime Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {data?.patients?.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-4 text-surface-500">No patients have booked yet.</td></tr>
                ) : data?.patients?.map((p, idx) => (
                  <tr key={idx} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-sm text-surface-800">{p.name}</td>
                    <td className="py-3.5 px-5 text-sm text-surface-600">{p.email}</td>
                    <td className="py-3.5 px-5 text-sm text-surface-600">{p.phone || '-'}</td>
                    <td className="py-3.5 px-5 text-center text-sm font-semibold text-primary-600">{p.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Tab 4: Photos Gallery */}
        {activeTab === 'photos' && (
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden animate-fade-in p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-surface-900">Lab Media Gallery</h2>
              <p className="text-surface-500 text-sm">Upload interior shots, equipment, or facility premises.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Upload Trigger Block */}
              <div className="relative aspect-square border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center text-surface-500 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50 transition-colors group cursor-pointer bg-surface-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  disabled={isUpdating}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <HiUpload className="text-3xl mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">{isUpdating ? 'Uploading...' : 'Add New Photo'}</span>
              </div>

              {/* Existing Photos Grid */}
              {data?.lab?.photos?.map((photoUrl, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-surface-200 group">
                  <img src={photoUrl} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-surface-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      disabled={isUpdating}
                      onClick={() => handleGalleryDelete(photoUrl)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transform scale-75 group-hover:scale-100 transition-all shadow-lg"
                    >
                      <HiTrash className="text-xl" />
                    </button>
                  </div>
                  {data?.lab?.image === photoUrl && (
                    <div className="absolute top-2 left-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      Profile Active
                    </div>
                  )}
                </div>
              ))}
            </div>

            {data?.lab?.photos?.length === 0 && (
              <div className="mt-8 text-center text-surface-500 py-12 border-t border-surface-100">
                <HiOutlinePhotograph className="text-4xl mx-auto mb-3 text-surface-300" />
                Your media gallery is currently empty.<br />Add photos of your storefront or hardware to build patient trust!
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Patient Feedback & Trust Ratings */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-surface-100 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-surface-900">Patient Feedback & Reviews</h2>
              <p className="text-sm text-surface-500 hidden md:block">TrustScore automatically isolates contact data for poor experiences.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-50">
                    <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Patient Name</th>
                    <th className="text-center py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Rating</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Feedback Comment</th>
                    <th className="text-right py-3 px-5 text-xs font-semibold text-surface-500 uppercase">Conflict Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {data?.reviews?.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-8 text-surface-500">No patient reviews received yet.</td></tr>
                  ) : data?.reviews?.map((r) => {
                    const isPoor = r.rating <= 3 || r.accuracyScore <= 3;
                    return (
                      <tr key={r._id} className={`hover:bg-surface-50 transition-colors ${isPoor ? 'bg-red-50/30' : ''}`}>
                        <td className="py-4 px-5">
                          <span className="font-semibold text-sm text-surface-800">{r.userId?.name || 'Anonymous'}</span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-sm text-surface-900 leading-none">⭐ {r.rating}/5</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <p className="text-sm text-surface-700 italic max-w-sm xl:max-w-md line-clamp-3">"{r.comment || 'No comment provided.'}"</p>
                        </td>
                        <td className="py-4 px-5 text-right w-64 block xl:table-cell h-full border-t border-surface-100/50 xl:border-0 border-transparent bg-transparent">
                          {isPoor ? (
                            <div className="flex flex-col gap-1.5 float-right xl:float-none p-1 bg-surface-50 xl:bg-transparent rounded-lg">
                              <span className="text-[10px] font-bold text-red-500 tracking-wide uppercase px-2">POOR EXPERIENCE</span>
                              <a href={`mailto:${r.userId?.email}`} className="text-xs font-medium bg-surface-200/50 hover:bg-surface-200 text-surface-800 px-3 py-1.5 rounded-md transition-colors block xl:inline-block max-w-max border border-surface-300">
                                ✉️ {r.userId?.email}
                              </a>
                              {r.userId?.phone && (
                                <a href={`tel:${r.userId?.phone}`} className="text-xs font-medium bg-surface-200/50 hover:bg-surface-200 text-surface-800 px-3 py-1.5 rounded-md transition-colors block xl:inline-block max-w-max border border-surface-300">
                                  📞 {r.userId?.phone}
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full whitespace-nowrap hidden xl:inline-block border border-emerald-100">
                              Positive Outlook
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Secure Physical File Upload Modal */}
      {reportModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-xl text-surface-900">Upload Final Patient Report</h3>
              <button onClick={() => setReportModal({ isOpen: false, bookingId: null, file: null })} className="text-surface-400 hover:text-surface-600"><HiX className="text-2xl" /></button>
            </div>
            <p className="text-sm text-surface-500 mb-6">Please attach the successfully generated medical PDF report from your local drive. This file will be permanently sealed onto the patient's record online.</p>

            <div className="relative border-2 border-dashed border-surface-200 rounded-xl p-8 mb-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors group cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setReportModal({ ...reportModal, file: e.target.files[0] })}
              />
              <HiUpload className="mx-auto text-4xl text-surface-400 group-hover:text-primary-500 mb-3" />
              {reportModal.file ? (
                <div className="text-sm font-semibold text-primary-700 break-all px-4">{reportModal.file.name}</div>
              ) : (
                <div className="text-sm text-surface-600"><span className="font-semibold text-primary-600">Click to browse</span> or securely drag and drop<br /><span className="text-xs text-surface-400">(PDF only, up to 5MB)</span></div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-surface-100 pt-5">
              <button disabled={isUpdating} onClick={() => setReportModal({ ...reportModal, isOpen: false, file: null })} className="btn-secondary !px-5">Cancel</button>
              <button disabled={isUpdating || !reportModal.file} onClick={handleFileUpload} className="btn-primary !px-5 flex items-center gap-2">
                {isUpdating ? 'Uploading binary...' : 'Securely Upload & Deliver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Test Form Modal */}
      {isAddingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-up">
            <div className="p-6 border-b border-surface-200 flex justify-between items-center bg-surface-50 rounded-t-2xl">
              <h3 className="font-display font-bold text-xl text-surface-900">Configure New Lab Test</h3>
              <button disabled={isUpdating} onClick={() => setIsAddingTest(false)} className="text-surface-400 hover:text-surface-600"><HiX className="text-2xl" /></button>
            </div>

            <div className="p-6 overflow-y-auto w-full">
              {testError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">{testError}</div>}
              <form id="addTestForm" onSubmit={handleCreateTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Test Name / Title <span className="text-red-500">*</span></label>
                  <input type="text" required value={testForm.testName} onChange={e => setTestForm({ ...testForm, testName: e.target.value })} className="input-field" placeholder="e.g. Complete Blood Count (CBC)" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                    <select required value={testForm.category} onChange={e => setTestForm({ ...testForm, category: e.target.value })} className="input-field bg-white">
                      <option value="General">General</option>
                      <option value="Blood">Blood</option>
                      <option value="Pathology">Pathology</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Cardiac">Cardiac</option>
                      <option value="Diabetes">Diabetes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Your Price (₹) <span className="text-red-500">*</span></label>
                    <input type="number" required min="0" value={testForm.price} onChange={e => setTestForm({ ...testForm, price: e.target.value })} className="input-field" placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Turnaround Time</label>
                    <div className="relative">
                      <input type="number" min="1" value={testForm.turnAroundTime} onChange={e => setTestForm({ ...testForm, turnAroundTime: e.target.value })} className="input-field pr-12" />
                      <span className="absolute right-3 top-2.5 text-sm font-semibold text-surface-400">hrs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-8">
                    <input type="checkbox" id="fastingRequired" checked={testForm.fastingRequired} onChange={e => setTestForm({ ...testForm, fastingRequired: e.target.checked })} className="w-5 h-5 text-primary-600 rounded border-surface-300 focus:ring-primary-500" />
                    <label htmlFor="fastingRequired" className="text-sm font-semibold text-surface-800 cursor-pointer">Fasting Required?</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Specific Requirements</label>
                  <input type="text" value={testForm.requirements} onChange={e => setTestForm({ ...testForm, requirements: e.target.value })} className="input-field" placeholder="e.g. Empty stomach for 12 hours" />
                </div>

                <div className="pt-6 mt-4 border-t border-surface-200 flex justify-end gap-3">
                  <button disabled={isUpdating} type="button" onClick={() => setIsAddingTest(false)} className="btn-secondary !px-6">Cancel</button>
                  <button disabled={isUpdating} type="submit" className="btn-primary flex items-center gap-2 !px-8">
                    {isUpdating ? 'Saving...' : 'Add to Lab Inventory'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lab Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-up">
            <div className="p-6 border-b border-surface-200 flex justify-between items-center bg-surface-50 rounded-t-2xl">
              <h3 className="font-display font-bold text-xl text-surface-900">Edit Lab Profile</h3>
              <button disabled={isUpdating} onClick={() => setIsEditingProfile(false)} className="text-surface-400 hover:text-surface-600">
                <HiX className="text-2xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full">
              {testError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">{testError}</div>}

              <form id="editProfileForm" onSubmit={handleProfileSave} className="space-y-5">
                <div className="flex items-center gap-6 mb-6">
                  <img
                    src={profileForm.file ? URL.createObjectURL(profileForm.file) : (data.lab.image || `https://ui-avatars.com/api/?name=${profileForm.name}&background=random`)}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-surface-50 shadow-sm"
                  />
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Lab Profile Update Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileForm({ ...profileForm, file: e.target.files[0] })}
                      className="block w-full text-sm text-surface-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100 cursor-pointer"
                    />
                    <p className="text-xs text-surface-400 mt-2">JPG, PNG, or WEBP up to 5MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Official Lab Name <span className="text-red-500">*</span></label>
                    <input type="text" required value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Operating Hours</label>
                    <input type="text" value={profileForm.operatingHours} onChange={e => setProfileForm({ ...profileForm, operatingHours: e.target.value })} placeholder="e.g. 8:00 AM - 9:00 PM" className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Contact Phone</label>
                    <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="input-field" placeholder="+91 xxxxxxxxxx" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Public Email</label>
                    <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-surface-100 pt-5">
                  <h4 className="text-sm font-bold text-surface-800 uppercase tracking-wider">Location Overview</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-surface-700 mb-1.5">City <span className="text-red-500">*</span></label>
                      <input type="text" required value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-surface-700 mb-1.5">Area / Neighborhood <span className="text-red-500">*</span></label>
                      <input type="text" required value={profileForm.area} onChange={e => setProfileForm({ ...profileForm, area: e.target.value })} className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Full Street Address</label>
                    <textarea value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} className="input-field h-16 resize-none" placeholder="Shop No, Building, Street..." />
                  </div>
                </div>

                <div className="border-t border-surface-100 pt-5">
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">About Lab (Description)</label>
                  <textarea value={profileForm.description} onChange={e => setProfileForm({ ...profileForm, description: e.target.value })} className="input-field h-24 resize-none" placeholder="Provide a brief overview of your diagnostic services..." />
                </div>

                <div className="pt-6 mt-4 border-t border-surface-200 flex justify-end gap-3">
                  <button disabled={isUpdating} type="button" onClick={() => setIsEditingProfile(false)} className="btn-secondary !px-6">Cancel</button>
                  <button disabled={isUpdating} type="submit" className="btn-primary flex items-center gap-2 !px-8">
                    {isUpdating ? 'Saving...' : 'Save Public Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabDashboard;
