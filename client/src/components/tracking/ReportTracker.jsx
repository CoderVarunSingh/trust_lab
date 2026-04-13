import { HiCheck, HiOutlineClock } from 'react-icons/hi';
import { formatDateTime } from '../../utils/helpers';

const statusSteps = [
  { key: 'booked', label: 'Booked', icon: '📋' },
  { key: 'sample_collected', label: 'Sample Collected', icon: '🧪' },
  { key: 'testing', label: 'Testing', icon: '🔬' },
  { key: 'report_ready', label: 'Report Ready', icon: '📊' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
];

const ReportTracker = ({ booking }) => {
  const currentIndex = statusSteps.findIndex(s => s.key === booking.status);

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6">
      <h3 className="font-display font-bold text-lg text-surface-900 mb-6">Report Tracking</h3>
      
      <div className="relative">
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const update = booking.trackingUpdates?.find(u => u.status === step.key);

          return (
            <div key={step.key} className="flex items-start gap-4 relative">
              {/* Vertical line */}
              {index < statusSteps.length - 1 && (
                <div className={`absolute left-5 top-10 w-0.5 h-full ${
                  index < currentIndex ? 'bg-primary-400' : 'bg-surface-200'
                }`} />
              )}

              {/* Circle */}
              <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500 ${
                isCompleted
                  ? 'bg-primary-500 border-primary-500 text-white shadow-glow-teal'
                  : 'bg-white border-surface-300 text-surface-400'
              } ${isCurrent ? 'animate-pulse-glow scale-110' : ''}`}>
                {isCompleted ? <HiCheck className="text-lg" /> : <span className="text-sm">{step.icon}</span>}
              </div>

              {/* Content */}
              <div className={`pb-8 flex-1 ${index === statusSteps.length - 1 ? 'pb-0' : ''}`}>
                <p className={`font-semibold text-sm ${isCompleted ? 'text-surface-900' : 'text-surface-400'}`}>
                  {step.label}
                  {isCurrent && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                      Current
                    </span>
                  )}
                </p>
                {update && (
                  <div className="mt-1">
                    <p className="text-xs text-surface-500 flex items-center gap-1">
                      <HiOutlineClock className="text-xs" />
                      {formatDateTime(update.timestamp)}
                    </p>
                    {update.note && <p className="text-xs text-surface-400 mt-0.5">{update.note}</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
      
      {/* File Download Action */}
      {booking.reportUrl && booking.status === 'delivered' && (
        <div className="mt-6 pt-6 border-t border-surface-200">
          <a
            href={booking.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="w-full btn-primary flex items-center justify-center gap-2 border-2 border-primary-600 bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
          >
            <span className="text-xl">📄</span> Download Formal Diagnostic Report
          </a>
        </div>
      )}

    </div>
  );
};

export default ReportTracker;
