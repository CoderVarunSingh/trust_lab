import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLabs } from '../services/api';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import TrustBadge from '../components/labs/TrustBadge';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    getLabs({ sortBy: 'trust' }).then(res => setLabs(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-900">Doctor Dashboard</h1>
          <p className="text-surface-500 mt-1">Welcome, {user?.name} 🩺</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 p-6 mb-8">
          <h2 className="font-display font-bold text-lg text-surface-900 mb-2 flex items-center gap-2">
            <HiOutlineShieldCheck className="text-primary-500" /> Recommend Trusted Labs
          </h2>
          <p className="text-surface-500 text-sm mb-4">Your recommendations boost lab trust scores and help patients make better decisions.</p>
        </div>

        <h3 className="font-display font-bold text-lg text-surface-900 mb-4">All Labs (by Trust Score)</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map(lab => (
            <div key={lab._id} className="bg-white rounded-xl border border-surface-200 p-5 card-hover flex items-center gap-4">
              <TrustBadge score={lab.trustScore} size="sm" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-surface-900 truncate">{lab.name}</h4>
                <p className="text-xs text-surface-400">{lab.location?.city} · {lab.totalReviews} reviews</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
