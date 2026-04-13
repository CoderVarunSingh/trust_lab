export const getTrustTier = (score) => {
  if (score >= 80) return { label: 'Reliable', emoji: '✅', color: 'green', bgClass: 'trust-badge-reliable' };
  if (score >= 50) return { label: 'Average', emoji: '⚠️', color: 'amber', bgClass: 'trust-badge-average' };
  return { label: 'Risky', emoji: '❌', color: 'red', bgClass: 'trust-badge-risky' };
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const getStatusLabel = (status) => {
  const map = {
    booked: 'Booked',
    sample_collected: 'Sample Collected',
    testing: 'Testing in Progress',
    report_ready: 'Report Ready',
    delivered: 'Delivered',
  };
  return map[status] || status;
};

export const getStatusColor = (status) => {
  const map = {
    booked: 'bg-blue-100 text-blue-700',
    sample_collected: 'bg-amber-100 text-amber-700',
    testing: 'bg-purple-100 text-purple-700',
    report_ready: 'bg-emerald-100 text-emerald-700',
    delivered: 'bg-gray-100 text-gray-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};
