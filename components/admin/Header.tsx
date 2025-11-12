"use client";

import { Bell, Search, User, Menu } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 md:px-6 py-4 fixed top-0 left-0 right-0 md:left-64 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="md:hidden">
              <h1 className="font-display text-lg text-primary-600">Pommy Foods</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2">
              <Search className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
              />
            </div>
            
            <button className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
            </button>
            
            <button className="flex items-center space-x-2 p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
              <User className="w-5 h-5" />
              <span className="hidden md:block text-sm font-medium">Admin</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-neutral-900">
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
};

