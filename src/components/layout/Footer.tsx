import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-muted/40 py-12 text-sm text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <Leaf className="h-4 w-4" />
              </div>
              <span>Carbon <span className="text-emerald-700 dark:text-emerald-400">Footprint Fuse</span></span>
            </div>
            <p className="text-xs leading-relaxed">
              Merging carbon footprint estimation with blockchain technology to create a sustainable future.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/calculator" className="hover:text-emerald-600">Calculator</Link></li>
              <li><Link to="/marketplace" className="hover:text-emerald-600">Marketplace</Link></li>
              <li><Link to="/blockchain" className="hover:text-emerald-600">Blockchain Integration</Link></li>
              <li><Link to="/about" className="hover:text-emerald-600">About</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Resources & FAQs</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-emerald-600">Meet The Team</Link></li>
              <li><Link to="/about#faq" className="hover:text-emerald-600">Frequently Asked Questions</Link></li>
              <li><Link to="/connect-wallet" className="hover:text-emerald-600">MetaMask Integration</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-600">Impact Dashboard</Link></li>
            </ul>
          </div>

          {/* Team Recognition */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Project Team & Mentorship</h4>
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              Developed by:
            </p>
            <div className="flex flex-col gap-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
              <span>• Rithvik Kaki (Lead Developer)</span>
              <span>• Pragna Sai (Product Designer)</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              Project Mentor:
            </p>
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <span>• Dr. U. Karthikeyan</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© {new Date().getFullYear()} Carbon Footprint Fuse. All rights reserved.</p>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>for a net-zero future.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
