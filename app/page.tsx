'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ChefHat, 
  ShoppingBag, 
  Utensils,
  BarChart3,
  Users,
  Check,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Search,
  Smile,
  Brain,
  Truck,
  FileText,
  CreditCard,
  Store,
  Package,
  Clock,
  ShoppingCart,
  Heart,
  Award,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ 
      fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      background: '#FAF4E6',
      overflowX: 'hidden'
    }}>
      {/* Navigation - Curvy Design */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl py-3 shadow-lg' 
          : 'py-4 bg-transparent'
      }`}>
        <div className="container mx-auto px-6 max-w-[1440px] flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D2AC6A] to-[#B8944F] flex items-center justify-center shadow-lg" style={{
              boxShadow: '0 8px 24px rgba(210, 172, 106, 0.3)'
            }}>
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold" style={{ color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>Pommy Foods</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium transition-colors" style={{ color: '#666' }} onMouseEnter={(e) => e.currentTarget.style.color = '#D2AC6A'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>Features</a>
            <a href="#modules" className="text-sm font-medium transition-colors" style={{ color: '#666' }} onMouseEnter={(e) => e.currentTarget.style.color = '#D2AC6A'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>Modules</a>
            <a href="#benefits" className="text-sm font-medium transition-colors" style={{ color: '#666' }} onMouseEnter={(e) => e.currentTarget.style.color = '#D2AC6A'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>Benefits</a>
            <Link 
              href="/admin/dashboard" 
              className="px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300"
              style={{ 
                color: '#1A1A1A',
                backgroundColor: 'transparent',
                border: '2px solid #D2AC6A'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D2AC6A';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#1A1A1A';
              }}
            >
              Admin Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl bg-white/80 backdrop-blur-xl border-2 border-[#D2AC6A]/20"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" style={{ color: '#1A1A1A' }} /> : <Menu className="w-5 h-5" style={{ color: '#1A1A1A' }} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl mx-6 mt-3 rounded-3xl p-6 space-y-4 shadow-2xl border-2 border-[#D2AC6A]/20">
            <a href="#features" className="block text-sm font-medium py-2" style={{ color: '#666' }}>Features</a>
            <a href="#modules" className="block text-sm font-medium py-2" style={{ color: '#666' }}>Modules</a>
            <a href="#benefits" className="block text-sm font-medium py-2" style={{ color: '#666' }}>Benefits</a>
            <Link 
              href="/admin/dashboard" 
              className="block text-center px-6 py-3 rounded-2xl font-semibold"
              style={{ backgroundColor: '#D2AC6A', color: 'white' }}
            >
              Admin Login
            </Link>
          </div>
        )}
      </nav>

      {/* Curved Hero Section */}
      <section className="relative pt-32 pb-24 px-6" style={{ overflow: 'visible' }}>
        {/* Curved Background Container */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #FFF7E9 0%, #FAF4E6 50%, #F7EEDB 100%)',
          borderRadius: '0 0 80px 80px',
          clipPath: 'ellipse(120% 100% at 50% 0%)'
        }}></div>
        
        <div className="container mx-auto max-w-[1440px] relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              {/* Tagline */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border-2 border-[#D2AC6A]/20">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D2AC6A' }}>Food Management Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight" style={{ color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>
                Delivering Quality Food,
                <br />
                <span className="flex items-center gap-3">
                  Powered by
                  <Smile className="w-12 h-12 md:w-16 md:h-16" style={{ color: '#D2AC6A' }} />
                </span>
                <span className="flex items-center gap-3">
                  Technology
                  <Brain className="w-12 h-12 md:w-16 md:h-16" style={{ color: '#D2AC6A' }} />
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg leading-relaxed max-w-xl" style={{ color: '#666' }}>
                Streamline orders, manage inventory, and delight customers with our comprehensive food management platform. Browse over thousands of products and manage your restaurant operations seamlessly.
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Link
                  href="/admin/dashboard"
                  className="px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300"
                  style={{ 
                    color: '#D2AC6A',
                    backgroundColor: 'white',
                    border: '2px solid #D2AC6A',
                    boxShadow: '0 8px 24px rgba(210, 172, 106, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#D2AC6A';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(210, 172, 106, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#D2AC6A';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(210, 172, 106, 0.2)';
                  }}
                >
                  Get Started
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300"
                  style={{ 
                    color: '#D2AC6A',
                    backgroundColor: 'transparent',
                    border: '2px solid #D2AC6A'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5E7CC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Side - Floating Mockup Card with Glow */}
            <div className="relative">
              {/* Gold Gradient Blob Background */}
              <div className="absolute inset-0 -z-10" style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(210, 172, 106, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                transform: 'scale(1.2)'
              }}></div>
              
              {/* Floating Card */}
              <div className="relative rounded-3xl overflow-hidden" style={{
                backgroundColor: 'white',
                boxShadow: '0 20px 60px rgba(210, 172, 106, 0.25), 0 0 0 1px rgba(210, 172, 106, 0.1)',
                transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)'
              }}>
                <div className="relative w-full h-96">
                  <Image
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"
                    alt="Fresh healthy food bowl"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-20 h-20 rounded-2xl bg-white flex items-center justify-center" style={{
                  boxShadow: '0 8px 24px rgba(210, 172, 106, 0.2)',
                  border: '2px solid rgba(210, 172, 106, 0.2)'
                }}>
                  <Utensils className="w-10 h-10" style={{ color: '#D2AC6A' }} />
                </div>
                
                <div className="absolute bottom-8 -left-8 w-16 h-24 rounded-xl bg-white flex items-center justify-center" style={{
                  boxShadow: '0 8px 24px rgba(210, 172, 106, 0.2)',
                  border: '2px solid rgba(210, 172, 106, 0.2)'
                }}>
                  <div className="w-8 h-16 rounded-full" style={{ backgroundColor: 'rgba(210, 172, 106, 0.2)' }}></div>
                </div>
                
                <div className="absolute bottom-12 -right-4 flex items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center" style={{
                    boxShadow: '0 8px 24px rgba(210, 172, 106, 0.2)',
                    border: '2px solid rgba(210, 172, 106, 0.2)'
                  }}>
                    <Utensils className="w-6 h-6" style={{ color: '#D2AC6A' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curved Feature Sections */}
      <section id="features" className="py-24 px-6 relative">
        {/* Wavy Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-20" style={{
          background: 'linear-gradient(to bottom, #FAF4E6, white)',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 80%)'
        }}></div>
        
        <div className="container mx-auto max-w-[1440px] relative z-10 pt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>
              Everything You Need
              <span className="block mt-2" style={{ color: '#D2AC6A' }}>In One Platform</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#666' }}>
              Powerful features designed to streamline your food business operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-3xl p-8 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'white',
                  boxShadow: '0 12px 40px rgba(210, 172, 106, 0.1), 0 0 0 1px rgba(210, 172, 106, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(210, 172, 106, 0.2), 0 0 0 1px rgba(210, 172, 106, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(210, 172, 106, 0.1), 0 0 0 1px rgba(210, 172, 106, 0.05)';
                }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: 'linear-gradient(135deg, #D2AC6A 0%, #B8944F 100%)',
                    boxShadow: '0 8px 24px rgba(210, 172, 106, 0.3)'
                  }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wavy Bottom Edge */}
        <div className="absolute bottom-0 left-0 right-0 h-20" style={{
          background: 'linear-gradient(to top, #FAF4E6, white)',
          clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0 100%)'
        }}></div>
      </section>

      {/* Access Our Platform Modules - Curved Container */}
      <section id="modules" className="py-24 px-6 relative" style={{ backgroundColor: '#FFF7E9' }}>
        <div className="container mx-auto max-w-[1440px]">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>
              Access Our
              <span className="block mt-2" style={{ color: '#D2AC6A' }}>Platform Modules</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#666' }}>
              Explore our comprehensive suite of modules designed for every aspect of your food business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickAccessModules.map((module, index) => {
              // Driver App - Show Coming Soon popup
              if (module.isComingSoon) {
                return (
                  <div
                    key={index}
                    onClick={() => setShowComingSoon(true)}
                    className="group rounded-3xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer relative"
                    style={{
                      backgroundColor: 'white',
                      boxShadow: '0 12px 40px rgba(210, 172, 106, 0.1), 0 0 0 1px rgba(210, 172, 106, 0.05)',
                      opacity: 0.8
                    }}
                  >
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#D2AC6A', color: 'white' }}>
                        Coming Soon
                      </span>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #D2AC6A 0%, #B8944F 100%)',
                          boxShadow: '0 8px 24px rgba(210, 172, 106, 0.3)',
                          opacity: 0.6
                        }}
                      >
                        <module.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>
                          {module.title}
                        </h3>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: '#666' }}>{module.description}</p>
                        <div className="flex items-center text-sm font-semibold" style={{ color: '#D2AC6A' }}>
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Coming Soon</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Regular modules - Link to dashboard
              return (
                <Link
                  key={index}
                  href={module.href}
                  className="group rounded-3xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundColor: 'white',
                    boxShadow: '0 12px 40px rgba(210, 172, 106, 0.1), 0 0 0 1px rgba(210, 172, 106, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(210, 172, 106, 0.2), 0 0 0 1px rgba(210, 172, 106, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(210, 172, 106, 0.1), 0 0 0 1px rgba(210, 172, 106, 0.05)';
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #D2AC6A 0%, #B8944F 100%)',
                        boxShadow: '0 8px 24px rgba(210, 172, 106, 0.3)'
                      }}
                    >
                      <module.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 group-hover:transition-colors" style={{ color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>
                        {module.title}
                      </h3>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: '#666' }}>{module.description}</p>
                      <div className="flex items-center text-sm font-semibold" style={{ color: '#D2AC6A' }}>
                        <span>Access Module</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Coming Soon Modal */}
        {showComingSoon && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowComingSoon(false)}
          >
            <div 
              className="rounded-3xl p-8 max-w-md w-full relative"
              style={{
                backgroundColor: 'white',
                boxShadow: '0 20px 60px rgba(210, 172, 106, 0.3)',
                border: '2px solid rgba(210, 172, 106, 0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowComingSoon(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#F5E7CC' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D2AC6A'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F5E7CC'}
              >
                <X className="w-5 h-5" style={{ color: '#1A1A1A' }} />
              </button>
              
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{
                  background: 'linear-gradient(135deg, #D2AC6A 0%, #B8944F 100%)',
                  boxShadow: '0 8px 24px rgba(210, 172, 106, 0.3)'
                }}>
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-3" style={{ color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>
                  Coming Soon
                </h3>
                <p className="text-lg mb-6" style={{ color: '#666' }}>
                  The Driver App is currently under development. We&apos;re working hard to bring you an amazing delivery management experience!
                </p>
                <div className="flex items-center justify-center space-x-2 mb-6" style={{ color: '#D2AC6A' }}>
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Stay tuned for updates</span>
                </div>
                <button
                  onClick={() => setShowComingSoon(false)}
                  className="px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
                  style={{ 
                    backgroundColor: '#D2AC6A',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(210, 172, 106, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(210, 172, 106, 0.4)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(210, 172, 106, 0.3)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Benefits Section - Curved */}
      <section id="benefits" className="py-24 px-6 relative" style={{ backgroundColor: 'white' }}>
        {/* Wavy Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-20" style={{
          background: 'linear-gradient(to bottom, #FFF7E9, white)',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 80%)'
        }}></div>
        
        <div className="container mx-auto max-w-[1440px] relative z-10 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white border-2" style={{ borderColor: '#D2AC6A' }}>
                <Zap className="w-4 h-4" style={{ color: '#D2AC6A' }} />
                <span className="text-sm font-semibold" style={{ color: '#666' }}>Why Choose Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold" style={{ color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>
                Built for
                <span className="block mt-2" style={{ color: '#D2AC6A' }}>Growing Restaurants</span>
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: '#666' }}>
                From cozy cafes to bustling restaurant chains, our platform scales with your business and adapts to your needs.
              </p>
              <div className="space-y-4 pt-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div 
                      className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                      style={{
                        background: 'linear-gradient(135deg, #D2AC6A 0%, #B8944F 100%)',
                        boxShadow: '0 4px 12px rgba(210, 172, 106, 0.3)'
                      }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1" style={{ color: '#1A1A1A' }}>{benefit.title}</h4>
                      <p className="text-sm" style={{ color: '#666' }}>{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="rounded-3xl p-6 text-center hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: 'white',
                    boxShadow: '0 12px 40px rgba(210, 172, 106, 0.1), 0 0 0 1px rgba(210, 172, 106, 0.05)'
                  }}
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: '#D2AC6A' }} />
                  <div className="text-3xl font-bold mb-1" style={{ color: '#1A1A1A' }}>{stat.value}</div>
                  <div className="text-xs font-medium" style={{ color: '#666' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Curved Shape */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-[1440px]">
          <div 
            className="rounded-[60px] p-16 text-center relative"
            style={{
              background: 'linear-gradient(135deg, #FFF7E9 0%, #FAF4E6 50%, #F7EEDB 100%)',
              boxShadow: '0 20px 60px rgba(210, 172, 106, 0.15)'
            }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#666' }}>
              Join thousands of restaurants using Pommy Foods to streamline operations and delight customers.
            </p>
            <Link
              href="/admin/dashboard"
              className="inline-block px-10 py-4 rounded-2xl font-semibold text-base transition-all duration-300"
              style={{ 
                color: '#D2AC6A',
                backgroundColor: 'white',
                border: '2px solid #D2AC6A',
                boxShadow: '0 8px 24px rgba(210, 172, 106, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D2AC6A';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(210, 172, 106, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#D2AC6A';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(210, 172, 106, 0.2)';
              }}
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Rounded Top Border */}
      <footer className="py-16 px-6 relative" style={{ backgroundColor: '#1A1A1A' }}>
        {/* Rounded Top Border */}
        <div className="absolute top-0 left-0 right-0 h-20" style={{
          background: 'linear-gradient(to bottom, white, #1A1A1A)',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 80%)'
        }}></div>
        
        <div className="container mx-auto max-w-[1440px] relative z-10 pt-20">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #D2AC6A 0%, #B8944F 100%)',
                    boxShadow: '0 8px 24px rgba(210, 172, 106, 0.3)'
                  }}
                >
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Pommy Foods</span>
              </div>
              <p className="leading-relaxed" style={{ color: '#999' }}>
                Premium food management platform for modern restaurants
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Product</h4>
              <ul className="space-y-3" style={{ color: '#999' }}>
                <li><a href="#features" className="hover:text-[#D2AC6A] transition-colors">Features</a></li>
                <li><a href="#benefits" className="hover:text-[#D2AC6A] transition-colors">Benefits</a></li>
                <li><Link href="/admin/dashboard" className="hover:text-[#D2AC6A] transition-colors">Get Started</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Support</h4>
              <ul className="space-y-3" style={{ color: '#999' }}>
                <li><a href="#" className="hover:text-[#D2AC6A] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#D2AC6A] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#D2AC6A] transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Contact</h4>
              <ul className="space-y-4" style={{ color: '#999' }}>
                <li className="flex items-center space-x-3">
                  <Phone className="w-5 h-5" style={{ color: '#D2AC6A' }} />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" style={{ color: '#D2AC6A' }} />
                  <span>hello@pommyfoods.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5" style={{ color: '#D2AC6A' }} />
                  <span>123 Food Street, City</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t text-center" style={{ borderColor: '#333' }}>
            <p style={{ color: '#999' }}>&copy; 2024 Pommy Foods. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const quickAccessModules = [
  {
    icon: Shield,
    title: 'Admin Dashboard',
    description: 'Complete control over orders, products, stores, and analytics',
    href: '/admin/dashboard',
    isComingSoon: false
  },
  {
    icon: Utensils,
    title: 'Kitchen Module',
    description: 'Manage kitchen sheets, track orders, and coordinate food preparation',
    href: '/kitchen/dashboard',
    isComingSoon: false
  },
  {
    icon: Truck,
    title: 'Driver App',
    description: 'Track deliveries, manage routes, and handle customer interactions',
    href: '/driver/dashboard',
    isComingSoon: true
  },
  {
    icon: ShoppingBag,
    title: 'Customer Portal',
    description: 'Browse products, place orders, and track your purchases',
    href: '/customer/dashboard',
    isComingSoon: false
  },
  {
    icon: Store,
    title: 'Stores',
    description: 'Manage store locations, settings, and store-specific operations',
    href: '/admin/stores',
    isComingSoon: false
  },
  {
    icon: Package,
    title: 'Products',
    description: 'Manage inventory, stock levels, and product information',
    href: '/admin/products',
    isComingSoon: false
  }
];

const features = [
  {
    icon: ShoppingCart,
    title: 'Order Management',
    description: 'Streamline order processing from creation to fulfillment with real-time tracking'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Make data-driven decisions with comprehensive analytics and insights'
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Efficiently manage your team with role-based access and permissions'
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Stay connected with instant notifications and live order status updates'
  }
];

const benefits = [
  {
    title: 'Scalable Solution',
    description: 'Grows with your business from single location to multi-store chains'
  },
  {
    title: 'Easy Integration',
    description: 'Seamlessly integrates with your existing systems and workflows'
  },
  {
    title: '24/7 Support',
    description: 'Round-the-clock customer support to help you succeed'
  },
  {
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee'
  }
];

const stats = [
  { icon: Users, value: '10K+', label: 'Active Users' },
  { icon: Store, value: '500+', label: 'Restaurants' },
  { icon: ShoppingCart, value: '1M+', label: 'Orders Processed' },
  { icon: Award, value: '98%', label: 'Satisfaction Rate' }
];
