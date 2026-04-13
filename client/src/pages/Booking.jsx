import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HiOutlineCheck, HiOutlineClock, HiOutlineLocationMarker, HiOutlineHome } from 'react-icons/hi';
import { getLabById, createBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import TrustBadge from '../components/labs/TrustBadge';

const timeSlots = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

const Booking = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [lab, setLab] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    timeSlot: '',
    date: '',
    homeCollection: false,
    address: '',
  });
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const labId = searchParams.get('lab');
    const testId = searchParams.get('test');
    if (labId) {
      getLabById(labId).then(res => {
        setLab(res.data);
        if (testId) {
          const t = res.data.tests?.find(t => t._id === testId);
          if (t) setSelectedTest(t);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, []);

  const handleSubmit = async () => {
    if (!selectedTest || !bookingData.timeSlot || !bookingData.date) return;
    setSubmitting(true);
    try {
      const res = await createBooking({
        labId: lab._id,
        testId: selectedTest._id,
        timeSlot: bookingData.timeSlot,
        date: bookingData.date,
        homeCollection: bookingData.homeCollection,
        address: bookingData.address,
        totalAmount: selectedTest.price,
      });
      setBookingResult(res.data);
      setStep(4);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {['Select Test', 'Choose Slot', 'Confirm', 'Done'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > i + 1 ? 'bg-primary-500 text-white' : step === i + 1 ? 'bg-primary-500 text-white animate-pulse' : 'bg-surface-200 text-surface-500'
              }`}>
                {step > i + 1 ? <HiOutlineCheck /> : i + 1}
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 ${step > i + 1 ? 'bg-primary-500' : 'bg-surface-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Test */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-surface-900 mb-2">Select a Test</h2>
            <p className="text-surface-500 mb-6">from {lab?.name}</p>
            <div className="space-y-3">
              {lab?.tests?.map(test => (
                <button
                  key={test._id}
                  onClick={() => { setSelectedTest(test); setStep(2); }}
                  className={`w-full text-left bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                    selectedTest?._id === test._id ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-surface-900">{test.testName}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-surface-400">
                        <span><HiOutlineClock className="inline mr-1" />{test.reportTime}h</span>
                        <span className="bg-surface-100 px-2 py-0.5 rounded text-xs">{test.category}</span>
                      </div>
                    </div>
                    <span className="font-display font-bold text-xl text-surface-900">{formatPrice(test.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Choose Slot */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-surface-900 mb-6">Choose Date & Time</h2>

            <div className="bg-white rounded-2xl border border-surface-200 p-6 mb-6">
              <label className="text-sm font-semibold text-surface-700 block mb-2">Select Date</label>
              <input
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData(d => ({ ...d, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
              />
            </div>

            <div className="bg-white rounded-2xl border border-surface-200 p-6 mb-6">
              <label className="text-sm font-semibold text-surface-700 block mb-3">Select Time Slot</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setBookingData(d => ({ ...d, timeSlot: slot }))}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      bookingData.timeSlot === slot
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-surface-200 text-surface-600 hover:border-primary-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {lab?.homeCollection && (
              <div className="bg-white rounded-2xl border border-surface-200 p-6 mb-6">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={bookingData.homeCollection}
                    onChange={(e) => setBookingData(d => ({ ...d, homeCollection: e.target.checked }))}
                    className="w-5 h-5 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="font-semibold text-surface-800 flex items-center gap-2">
                    <HiOutlineHome className="text-primary-500" /> Home Sample Collection
                  </span>
                </label>
                {bookingData.homeCollection && (
                  <textarea
                    value={bookingData.address}
                    onChange={(e) => setBookingData(d => ({ ...d, address: e.target.value }))}
                    placeholder="Enter your full address for home collection..."
                    rows={3}
                    className="input-field"
                  />
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!bookingData.date || !bookingData.timeSlot}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-surface-900 mb-6">Confirm Booking</h2>
            <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-surface-100">
                <TrustBadge score={lab?.trustScore || 0} size="sm" />
                <div>
                  <h3 className="font-bold text-surface-900">{lab?.name}</h3>
                  <p className="text-sm text-surface-500 flex items-center gap-1"><HiOutlineLocationMarker />{lab?.location?.area}, {lab?.location?.city}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-surface-500">Test</span><span className="font-semibold">{selectedTest?.testName}</span></div>
                <div className="flex justify-between"><span className="text-surface-500">Date</span><span className="font-semibold">{bookingData.date}</span></div>
                <div className="flex justify-between"><span className="text-surface-500">Time</span><span className="font-semibold">{bookingData.timeSlot}</span></div>
                <div className="flex justify-between"><span className="text-surface-500">Collection</span><span className="font-semibold">{bookingData.homeCollection ? '🏠 Home' : '🏥 Lab Visit'}</span></div>
                {bookingData.address && <div className="flex justify-between"><span className="text-surface-500">Address</span><span className="font-semibold text-right max-w-xs">{bookingData.address}</span></div>}
                <div className="flex justify-between"><span className="text-surface-500">Report Time</span><span className="font-semibold">{selectedTest?.reportTime} hours</span></div>
              </div>

              <div className="border-t border-surface-200 pt-4 flex justify-between items-center">
                <span className="text-surface-600 font-medium">Total Amount</span>
                <span className="font-display font-bold text-2xl text-surface-900">{formatPrice(selectedTest?.price || 0)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Booking...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center animate-scale-in py-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineCheck className="text-4xl text-emerald-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-surface-900 mb-2">Booking Confirmed! 🎉</h2>
            <p className="text-surface-500 mb-8">Your test has been booked successfully. Track your report in the dashboard.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to Dashboard</button>
              <button onClick={() => navigate('/search')} className="btn-secondary">Book Another</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
