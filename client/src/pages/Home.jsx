import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineCurrencyRupee, HiOutlineChartBar, HiOutlineTruck, HiOutlineStar, HiArrowRight } from 'react-icons/hi';
import { FaHeartbeat, FaFlask, FaMicroscope, FaVial, FaDna, FaStethoscope } from 'react-icons/fa';
import { getLabs, getPopularTests } from '../services/api';
import TrustBadge from '../components/labs/TrustBadge';
import { useLanguage } from '../context/LanguageContext';

const popularTestIcons = {
  'Complete Blood Count (CBC)': <FaFlask />,
  'Lipid Profile': <FaVial />,
  'Thyroid Profile (T3, T4, TSH)': <FaStethoscope />,
  'HbA1c': <FaMicroscope />,
  'Vitamin D': <FaDna />,
  'Full Body Health Checkup': <FaHeartbeat />,
};

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [topLabs, setTopLabs] = useState([]);
  const [popularTests, setPopularTests] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    getLabs({ sortBy: 'trust', minTrust: 75 }).then(res => setTopLabs(res.data.slice(0, 4))).catch(() => {});
    getPopularTests().then(res => setPopularTests(res.data.slice(0, 6))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?test=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-hero-pattern overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(13,148,136,0.15),transparent_50%)]" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-medical-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-primary-300 text-sm font-medium mb-6 animate-fade-in">
              <HiOutlineShieldCheck className="text-lg" />
              {t('heroTagline')}
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight animate-slide-up">
              {t('heroTitle1')}
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-teal-300 to-emerald-400">
                {t('heroTitle2')}
              </span>
            </h1>

            <p className="mt-6 text-lg text-surface-300 max-w-xl mx-auto animate-slide-up animate-delay-100">
              {t('heroDesc')}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-10 max-w-xl mx-auto animate-slide-up animate-delay-200">
              <div className="relative">
                <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-400 text-xl" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-14 pr-36 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-4 focus:ring-primary-400/30 text-base shadow-xl"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary !py-2.5 !px-6 !rounded-xl"
                >
                  {t('search')}
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto animate-slide-up animate-delay-300">
              {[
                { num: '500+', label: t('labsListed') },
                { num: '50K+', label: t('testsBooked') },
                { num: '4.8', label: t('avgRating') },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-display font-bold text-2xl text-white">{s.num}</div>
                  <div className="text-xs text-surface-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">{t('howItWorks')}</h2>
            <p className="section-subheading">{t('howItWorksDesc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: t('step01'), desc: t('step01Desc'), icon: <HiOutlineSearch className="text-3xl" />, color: 'from-primary-500 to-teal-500' },
              { step: '02', title: t('step02'), desc: t('step02Desc'), icon: <HiOutlineShieldCheck className="text-3xl" />, color: 'from-medical-500 to-blue-500' },
              { step: '03', title: t('step03'), desc: t('step03Desc'), icon: <HiOutlineChartBar className="text-3xl" />, color: 'from-accent-500 to-orange-500' },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="bg-white rounded-2xl p-8 text-center card-hover border border-surface-200 shadow-card h-full">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-primary-500 tracking-widest mb-2">STEP {item.step}</div>
                  <h3 className="font-display font-bold text-xl text-surface-900 mb-2">{item.title}</h3>
                  <p className="text-surface-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tests */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-heading">{t('popularTests')}</h2>
              <p className="section-subheading">{t('popularTestsDesc')}</p>
            </div>
            <Link to="/compare?viewAll=true" className="hidden md:flex items-center gap-1 text-primary-600 font-semibold text-sm hover:gap-2 transition-all">
              {t('viewAll')} <HiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularTests.map((test, i) => (
              <Link
                key={i}
                to={`/compare?test=${encodeURIComponent(test.testName)}`}
                className="bg-white rounded-xl p-5 text-center border border-surface-200 shadow-card card-hover group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary-100 to-medical-100 flex items-center justify-center text-primary-600 text-xl group-hover:scale-110 transition-transform">
                  {popularTestIcons[test.testName] || <FaFlask />}
                </div>
                <h4 className="font-semibold text-sm text-surface-800 leading-tight">{test.testName}</h4>
                <p className="text-xs text-surface-400 mt-1">{test.labs?.length || 0} labs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Labs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-heading">{t('topRatedLabs')}</h2>
              <p className="section-subheading">{t('topRatedLabsDesc')}</p>
            </div>
            <Link to="/search" className="hidden md:flex items-center gap-1 text-primary-600 font-semibold text-sm hover:gap-2 transition-all">
              {t('viewAll')} <HiArrowRight />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topLabs.map((lab, i) => (
              <Link key={lab._id} to={`/lab/${lab._id}`} className="group">
                <div className="bg-white rounded-2xl border border-surface-200 shadow-card card-hover h-full overflow-hidden flex flex-col">
                  {/* Lab Photo Header */}
                  <div className="h-32 bg-surface-100 overflow-hidden relative">
                    <img 
                      src={lab.image || lab.photos?.[0] || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400&h=200'} 
                      alt={lab.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 mb-2">
                      <HiOutlineStar className="text-accent-500 text-sm" />
                      <span className="text-xs font-semibold">{lab.ratings}</span>
                      <span className="text-[10px] text-surface-400">({lab.totalReviews})</span>
                    </div>
                    <h3 className="font-display font-bold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-1">{lab.name}</h3>
                    <p className="text-xs text-surface-500 mt-1 line-clamp-1">{lab.location?.area}, {lab.location?.city}</p>
                  {lab.homeCollection && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-primary-600">
                      <HiOutlineTruck /> {t('homeCollectionAvailable')}
                    </div>
                  )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Score Explainer */}
      <section className="py-20 bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-medium mb-4">
                <HiOutlineShieldCheck /> {t('coreUSP')}
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t('trustScoreEngine')}
              </h2>
              <p className="text-surface-300 leading-relaxed mb-8">
                {t('trustDesc')}
              </p>

              <div className="space-y-4">
                {[
                  { label: 'User Reviews', weight: '40%', w: 'w-[40%]', color: 'bg-primary-400' },
                  { label: 'Accuracy Feedback', weight: '30%', w: 'w-[30%]', color: 'bg-medical-400' },
                  { label: 'Doctor Recommendations', weight: '15%', w: 'w-[15%]', color: 'bg-accent-400' },
                  { label: 'Hospital Recommendations', weight: '10%', w: 'w-[10%]', color: 'bg-purple-400' },
                  { label: 'Report Consistency', weight: '5%', w: 'w-[5%]', color: 'bg-emerald-400' },
                ].map((f, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-surface-300">{f.label}</span>
                      <span className="font-semibold text-white">{f.weight}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${f.color} rounded-full transition-all duration-1000`} style={{ width: f.weight }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                {[
                  { score: 92, label: 'Reliable', desc: 'Score 80+ → Consistently accurate, highly recommended', emoji: '✅', bg: 'bg-emerald-500/10 border-emerald-500/30' },
                  { score: 65, label: 'Average', desc: 'Score 50-79 → Decent but room for improvement', emoji: '⚠️', bg: 'bg-amber-500/10 border-amber-500/30' },
                  { score: 32, label: 'Risky', desc: 'Score <50 → Low trust, proceed with caution', emoji: '❌', bg: 'bg-red-500/10 border-red-500/30' },
                ].map((t, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${t.bg} backdrop-blur-sm`}>
                    <TrustBadge score={t.score} size="sm" />
                    <div>
                      <p className="font-semibold text-white">{t.emoji} {t.label}</p>
                      <p className="text-xs text-surface-400">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="section-heading mb-4">{t('readyToFind')}</h2>
          <p className="text-surface-500 mb-8 max-w-lg mx-auto">
            {t('readyDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search" className="btn-primary text-base !py-3 !px-8">
              {t('searchLabsNow')}
            </Link>
            <Link to="/register" className="btn-secondary text-base !py-3 !px-8">
              {t('createAccount')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
