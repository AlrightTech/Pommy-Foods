"use client";

import { Bell, Search, User, Menu, ChevronDown, Package } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header className="glass-strong fixed top-0 left-0 right-0 md:left-80 z-30 border-b border-white/30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-neutral-700 hover:bg-white/20 rounded-premium transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="md:hidden flex items-center gap-3">
              <div className="w-10 h-10 rounded-premium bg-gradient-gold flex items-center justify-center shadow-premium">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold font-body text-lg text-neutral-800">Pommy Foods</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Field */}
            <div className="hidden md:flex items-center gap-3 glass rounded-premium px-4 py-2.5 min-w-[320px] focus-within:shadow-glass-lg focus-within:bg-white/35 transition-all">
              <Search className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search orders, products, stores..."
                className="bg-transparent border-none outline-none text-sm font-body text-neutral-800 placeholder-neutral-500 flex-1"
              />
            </div>
            
            {/* Notification Bell */}
            <button className="relative p-2.5 glass rounded-premium hover:bg-white/35 transition-all group">
              <Bell className="w-5 h-5 text-neutral-700 group-hover:text-primary-600 transition-colors" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary-500 rounded-full ring-2 ring-white shadow-sm"></span>
            </button>
            
            {/* Profile Avatar */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 glass rounded-premium hover:bg-white/35 transition-all group"
              >
                <div className="w-10 h-10 rounded-premium bg-gradient-gold flex items-center justify-center shadow-premium">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold font-body text-neutral-800">Admin User</p>
                  <p className="text-xs font-body text-neutral-600">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-500 hidden md:block group-hover:text-primary-600 transition-colors" />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-strong rounded-premium shadow-glass-lg border border-white/40 py-2 z-50 animate-scale-in">
                  <button className="w-full text-left px-4 py-2.5 text-sm font-body text-neutral-700 hover:bg-white/30 transition-colors rounded-lg mx-2">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm font-body text-neutral-700 hover:bg-white/30 transition-colors rounded-lg mx-2">
                    Preferences
                  </button>
                  <div className="border-t border-white/30 my-2"></div>
                  <button className="w-full text-left px-4 py-2.5 text-sm font-body text-error-600 hover:bg-error-50/30 transition-colors rounded-lg mx-2">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 glass-strong shadow-glass-lg">
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
};
