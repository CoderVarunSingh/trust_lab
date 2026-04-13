import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineMenu, HiOutlineX, HiOutlineSearch, HiOutlineUser, HiOutlineLogout, HiOutlineGlobeAlt } from 'react-icons/hi';
import { FaHeartbeat } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, language, changeLanguage } = useLanguage();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?test=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    const map = { patient: '/dashboard', lab: '/lab-dashboard', doctor: '/doctor-dashboard', hospital: '/hospital-dashboard' };
    return map[user.role] || '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-surface-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="TrustLab Logo" className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm" />
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-50 border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all text-sm"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/search" className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
              {t('findLabs')}
            </Link>
            <Link to="/compare" className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
              {t('compare')}
            </Link>

            {/* Language Switcher */}
            <div className="relative ml-2">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-3 py-2 text-surface-600 hover:text-primary-600 transition-colors"
                title={t('language')}
              >
                <HiOutlineGlobeAlt className="text-xl" />
                <span className="text-xs font-bold uppercase">{language}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-surface-200 py-2 animate-slide-down">
                  {['en', 'hi', 'te', 'ta', 'mr'].map((l) => (
                    <button
                      key={l}
                      onClick={() => { changeLanguage(l); setLangOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm uppercase ${language === l ? 'bg-primary-50 text-primary-600 font-bold' : 'text-surface-600 hover:bg-surface-50'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 border border-primary-200 hover:border-primary-400 transition-all"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-medical-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.name?.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-surface-700">{user.name?.split(' ')[0]}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-surface-200 py-2 animate-slide-down">
                    <div className="px-4 py-2 border-b border-surface-100">
                      <p className="text-sm font-semibold text-surface-800">{user.name}</p>
                      <p className="text-xs text-surface-400 capitalize">{user.role}</p>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors"
                    >
                      <HiOutlineUser className="text-lg" /> {t('dashboard')}
                    </Link>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); navigate('/'); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <HiOutlineLogout className="text-lg" /> {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">
                  {t('signIn')}
                </Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-5">
                  {t('getStarted')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors">
            {menuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-surface-100 animate-slide-down">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tests..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-50 border border-surface-200 focus:border-primary-400 focus:outline-none text-sm"
                />
              </div>
            </form>
            <Link to="/search" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-surface-600 hover:bg-surface-50 rounded-lg">{t('findLabs')}</Link>
            <Link to="/compare" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-surface-600 hover:bg-surface-50 rounded-lg">{t('compare')}</Link>
            {user ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-surface-600 hover:bg-surface-50 rounded-lg">{t('dashboard')}</Link>
                <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg">{t('logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-surface-600 hover:bg-surface-50 rounded-lg">{t('signIn')}</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-3 mt-2 text-center btn-primary text-sm">{t('getStarted')}</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
