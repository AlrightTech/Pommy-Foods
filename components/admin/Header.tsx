"use client";

import { Bell, Search, User, Menu, ChevronDown, Package } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-primary-200/60 px-4 md:px-8 py-4 fixed top-0 left-0 right-0 md:left-72 z-30 shadow-food">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:bg-primary-100/60 rounded-food transition-all duration-200 hover:scale-110"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-food bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-food">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold font-body text-primary-700">Pommy Foods</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-primary-50/80 to-accent-50/40 backdrop-blur-sm rounded-food px-4 py-2.5 border border-primary-200/40 shadow-soft focus-within:shadow-food focus-within:border-primary-300/60 transition-all min-w-[300px]">
              <Search className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search orders, products, stores..."
                className="bg-transparent border-none outline-none text-sm font-body text-neutral-800 placeholder-neutral-500 flex-1"
              />
            </div>
            
            <button className="p-2.5 text-neutral-600 hover:bg-primary-100/60 rounded-food relative transition-all duration-200 hover:scale-110 group">
              <Bell className="w-5 h-5 group-hover:text-primary-600 transition-colors" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-error-500 to-accent-500 rounded-full ring-2 ring-white shadow-sm animate-pulse"></span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-primary-100/60 rounded-food transition-all duration-200 hover:scale-105 group"
              >
                <div className="w-8 h-8 rounded-food bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-soft group-hover:shadow-food transition-all">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold font-body text-neutral-900 group-hover:text-primary-700 transition-colors">Admin User</p>
                  <p className="text-xs font-body text-neutral-500">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400 hidden md:block group-hover:text-primary-600 transition-colors" />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-food shadow-food-lg border border-primary-200/40 py-2 z-50 animate-scale-in">
                  <button className="w-full text-left px-4 py-2 text-sm font-body text-neutral-700 hover:bg-primary-50/60 transition-colors">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm font-body text-neutral-700 hover:bg-primary-50/60 transition-colors">
                    Preferences
                  </button>
                  <div className="border-t border-primary-200/40 my-1"></div>
                  <button className="w-full text-left px-4 py-2 text-sm font-body text-error-600 hover:bg-error-50/60 transition-colors">
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
            className="fixed inset-0 bg-neutral-900 bg-opacity-50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-br from-white via-primary-50/80 to-accent-50/40 backdrop-blur-md shadow-food-lg">
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
};

