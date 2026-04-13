import { Link } from 'react-router-dom';
import { FaHeartbeat, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-surface-900 text-surface-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-start gap-2 mb-4">
              <div className="bg-white p-2 rounded-xl border border-surface-700 shadow-lg">
                <img src="/logo.png" alt="TrustLab Logo" className="h-40 w-auto object-contain" />
              </div>
            </div>
            <p className="text-surface-400 text-sm leading-relaxed">
              Patients don't need more labs. They need the <span className="text-primary-400 font-semibold">RIGHT</span> lab. 
              Make informed decisions with our Trust Score system.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/search" className="text-sm hover:text-primary-400 transition-colors">Find Labs</Link></li>
              <li><Link to="/compare" className="text-sm hover:text-primary-400 transition-colors">Compare Tests</Link></li>
              <li><Link to="/search" className="text-sm hover:text-primary-400 transition-colors">Trust Scores</Link></li>
              <li><Link to="/register" className="text-sm hover:text-primary-400 transition-colors">Register</Link></li>
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">For Partners</h4>
            <ul className="space-y-2.5">
              <li><Link to="/register" className="text-sm hover:text-primary-400 transition-colors">Register as Lab</Link></li>
              <li><Link to="/register" className="text-sm hover:text-primary-400 transition-colors">Hospital Integration</Link></li>
              <li><Link to="/register" className="text-sm hover:text-primary-400 transition-colors">Doctor Portal</Link></li>
              <li><span className="text-sm text-surface-500">API Documentation</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Connect</h4>
            <div className="flex gap-3 mb-4">
              <a href="#" className="w-9 h-9 bg-surface-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaTwitter className="text-sm" />
              </a>
              <a href="#" className="w-9 h-9 bg-surface-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaLinkedin className="text-sm" />
              </a>
              <a href="#" className="w-9 h-9 bg-surface-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaGithub className="text-sm" />
              </a>
            </div>
            <p className="text-sm text-surface-400">support@trustlab.in</p>
            <p className="text-sm text-surface-400">+91 98765 43210</p>
          </div>
        </div>

        <div className="border-t border-surface-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">© 2026 TrustLab. All rights reserved. Built for better healthcare decisions.</p>
          <div className="flex gap-6">
            <span className="text-xs text-surface-500 hover:text-surface-300 cursor-pointer">Privacy</span>
            <span className="text-xs text-surface-500 hover:text-surface-300 cursor-pointer">Terms</span>
            <span className="text-xs text-surface-500 hover:text-surface-300 cursor-pointer">Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
