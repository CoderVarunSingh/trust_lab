import { Link } from 'react-router-dom';
import { HiOutlineStar, HiOutlineClock, HiOutlineLocationMarker, HiLocationMarker } from 'react-icons/hi';
import { FaHome, FaUserMd, FaHospital, FaRoute } from 'react-icons/fa';
import TrustBadge from './TrustBadge';
import { formatPrice, getTrustTier } from '../../utils/helpers';

const LabCard = ({ lab }) => {
  const tier = getTrustTier(lab.trustScore);

  const borderColor = {
    green: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
  };

  return (
    <Link to={`/lab/${lab._id}`} className="block">
      <div className={`bg-white rounded-2xl border border-surface-200 border-l-4 ${borderColor[tier.color]} shadow-card card-hover overflow-hidden flex flex-col md:flex-row transition-all duration-300`}>
        {/* Photo Section */}
        <div className="md:w-1/4 h-48 md:h-autorelative bg-surface-100 flex-shrink-0 relative overflow-hidden hidden sm:block">
          <img 
            src={lab.image || lab.photos?.[0] || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400&h=200'} 
            alt={lab.name} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Content Section */}
        <div className="p-6 flex-1">
          <div className="flex items-start justify-between gap-4">
            {/* Lab Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-xl text-surface-900 truncate">{lab.name}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <div className="flex items-center gap-1.5 text-surface-500 text-sm">
                  <HiOutlineLocationMarker className="flex-shrink-0 text-primary-500" />
                  <span>{lab.location?.area}, {lab.location?.city}</span>
                </div>
                {lab.distance !== undefined && lab.distance !== null && (
                  <div className="flex items-center gap-1.5 text-accent-600 text-sm font-semibold bg-accent-50 px-2 rounded-md">
                    <FaRoute className="text-[10px]" />
                    <span>{lab.distance} km away</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {lab.doctorRecommendations > 10 && (
                  <span className="tag-doctor flex items-center gap-1">
                    <FaUserMd className="text-[10px]" /> Doctor Recommended
                  </span>
                )}
                {lab.hospitalRecommendations > 3 && (
                  <span className="tag-hospital flex items-center gap-1">
                    <FaHospital className="text-[10px]" /> Hospital Approved
                  </span>
                )}
                {lab.homeCollection && (
                  <span className="tag-home flex items-center gap-1">
                    <FaHome className="text-[10px]" /> Home Collection
                  </span>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <HiOutlineStar className="text-accent-500" />
                  <span className="font-semibold text-sm text-surface-800">{lab.ratings}</span>
                  <span className="text-xs text-surface-400">({lab.totalReviews})</span>
                </div>
                {lab.priceRange && (
                  <div className="text-sm text-surface-600">
                    {formatPrice(lab.priceRange.min)} – {formatPrice(lab.priceRange.max)}
                  </div>
                )}
                {lab.testCount > 0 && (
                  <div className="text-xs text-surface-400">{lab.testCount} tests</div>
                )}
              </div>

              {lab.accreditedBy?.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {lab.accreditedBy.map((acc, i) => (
                    <span key={i} className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                      {acc}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Trust Badge */}
            <div className="flex-shrink-0">
              <TrustBadge score={lab.trustScore} size="md" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LabCard;
