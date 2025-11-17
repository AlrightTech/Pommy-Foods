"use client";

import { Bell, Search, User, Menu, ChevronDown, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Sidebar } from "./Sidebar";
import { NotificationsDropdown } from "./NotificationsDropdown";

export const Header = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user.id || null);
    };
    getUserId();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setUserMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="glass-strong border-b border-white/30 md:hidden w-full h-full" style={{ height: '64px', position: 'relative', zIndex: 50 }}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 h-full w-full max-w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-neutral-700 hover:bg-white/20 rounded-premium transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-premium bg-white flex items-center justify-center shadow-premium border-2" style={{ borderColor: '#D2AC6A' }}>
                <span className="font-bold font-body text-sm text-primary">PF</span>
              </div>
              <span className="font-bold font-body text-lg text-primary hover:text-[var(--color-primary-dark)] active:text-[var(--color-primary-darker)] transition-colors">Pommy Foods</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {userId && <NotificationsDropdown userId={userId} />}
            
            <div className="w-8 h-8 rounded-premium bg-gradient-gold flex items-center justify-center shadow-premium">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header 
        className="glass-strong border-b border-white/30 hidden md:block w-full h-full" 
        style={{ 
          height: '64px',
          position: 'relative',
          zIndex: 50,
          width: '100%'
        }}
      >
        <div className="flex items-center justify-between px-4 md:px-6 py-3 h-full w-full max-w-full gap-2">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            {/* Search Field */}
            <div className="flex items-center gap-2 glass rounded-premium px-2 md:px-3 py-2 h-10 min-w-[200px] md:min-w-[300px] max-w-full flex-1 focus-within:shadow-glass-lg focus-within:bg-white/35 transition-all">
              <Search className="w-4 h-4 text-primary flex-shrink-0" />
              <input
                type="text"
                placeholder="Search orders, products, stores..."
                className="bg-transparent border-none outline-none text-sm font-body text-neutral-800 placeholder-neutral-500 flex-1 h-full min-w-0"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Notification Bell */}
            {userId && <NotificationsDropdown userId={userId} />}
            
            {/* Profile Avatar */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 glass rounded-premium hover:bg-white/35 transition-all group h-10"
              >
                <div className="w-8 h-8 rounded-premium bg-gradient-gold flex items-center justify-center shadow-premium">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold font-body text-neutral-800 leading-tight">Admin User</p>
                  <p className="text-[10px] font-body text-neutral-600 leading-tight">Administrator</p>
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-500 hidden md:block group-hover:text-primary transition-colors" />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-strong rounded-premium shadow-glass-lg border border-white/40 py-2 z-50 animate-scale-in">
                  <button className="w-full text-left px-4 py-2.5 text-sm font-body text-neutral-700 hover:bg-white/30 transition-colors rounded-lg mx-2">
                    Profile Settings
                  </button>
                  <div className="border-t border-white/30 my-2"></div>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm font-body text-error-600 hover:bg-error-50/30 transition-colors rounded-lg mx-2"
                  >
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
