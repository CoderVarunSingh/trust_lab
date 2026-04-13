import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getHospitals, getLabs } from '../services/api';
import TrustBadge from '../components/labs/TrustBadge';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    getHospitals().then(res => setHospitals(res.data)).catch(() => {});
    getLabs({ sortBy: 'trust' }).then(res => setLabs(res.data)).catch(() => {});
  }, []);

  const myHospital = hospitals.find(h => h.userId === user?._id) || hospitals[0];

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-900">Hospital Dashboard</h1>
          <p className="text-surface-500 mt-1">{myHospital?.name || user?.name} 🏥</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="font-display font-bold text-2xl text-surface-900">{myHospital?.doctors?.length || 0}</div>
            <div className="text-sm text-surface-400">Doctors</div>
          </div>
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <div className="text-3xl mb-2">🧪</div>
            <div className="font-display font-bold text-2xl text-surface-900">{myHospital?.recommendedLabs?.length || 0}</div>
            <div className="text-sm text-surface-400">Recommended Labs</div>
          </div>
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <div className="text-3xl mb-2">📍</div>
            <div className="font-display font-bold text-lg text-surface-900">{myHospital?.city}</div>
            <div className="text-sm text-surface-400">City</div>
          </div>
        </div>

        {/* Recommended Labs */}
        <h3 className="font-display font-bold text-lg text-surface-900 mb-4">Recommended Labs</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {myHospital?.recommendedLabs?.map(lab => (
            <div key={lab._id} className="bg-white rounded-xl border-2 border-primary-200 p-5 flex items-center gap-4">
              <TrustBadge score={lab.trustScore || 0} size="sm" />
              <div>
                <h4 className="font-semibold text-surface-900">{lab.name}</h4>
                <p className="text-xs text-surface-400">{lab.location?.city}</p>
              </div>
            </div>
          ))}
        </div>

        {/* All Labs */}
        <h3 className="font-display font-bold text-lg text-surface-900 mb-4">All Labs</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map(lab => (
            <div key={lab._id} className="bg-white rounded-xl border border-surface-200 p-5 card-hover flex items-center gap-4">
              <TrustBadge score={lab.trustScore} size="sm" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-surface-900 truncate">{lab.name}</h4>
                <p className="text-xs text-surface-400">{lab.location?.city} · ⭐ {lab.ratings}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
