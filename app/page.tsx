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
  Package
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF4EC] overflow-x-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navigation - Reduced Size */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl py-2 shadow-lg border-b border-[#D2AC6A]/10' 
          : 'py-3 bg-transparent'
      }`}>
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D2AC6A] to-[#B8944F] flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Pommy Foods</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm text-neutral-700 hover:text-[#D2AC6A] transition-colors font-medium">Features</a>
            <a href="#quick-access" className="text-sm text-neutral-700 hover:text-[#D2AC6A] transition-colors font-medium">Modules</a>
            <a href="#benefits" className="text-sm text-neutral-700 hover:text-[#D2AC6A] transition-colors font-medium">Benefits</a>
            <a href="#contact" className="text-sm text-neutral-700 hover:text-[#D2AC6A] transition-colors font-medium">Contact</a>
            <Link 
              href="/admin/dashboard" 
              className="px-5 py-2 rounded-xl bg-white/60 backdrop-blur-xl border border-[#D2AC6A]/20 text-[#D2AC6A] text-sm font-semibold hover:bg-white/80 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Admin Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/60 backdrop-blur-xl border border-[#D2AC6A]/20"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-neutral-800" /> : <Menu className="w-5 h-5 text-neutral-800" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/90 backdrop-blur-xl mx-6 mt-3 rounded-2xl p-5 space-y-3 shadow-2xl border border-[#D2AC6A]/20">
            <a href="#features" className="block text-sm text-neutral-700 hover:text-[#D2AC6A] transition-colors font-medium py-1.5">Features</a>
            <a href="#quick-access" className="block text-sm text-neutral-700 hover:text-[#D2AC6A] transition-colors font-medium py-1.5">Modules</a>
            <a href="#benefits" className="block text-sm text-neutral-700 hover:text-[#D2AC6A] transition-colors font-medium py-1.5">Benefits</a>
            <a href="#contact" className="block text-sm text-neutral-700 hover:text-[#D2AC6A] transition-colors font-medium py-1.5">Contact</a>
            <Link 
              href="/admin/dashboard" 
              className="block text-center px-6 py-2 rounded-xl bg-[#D2AC6A] text-white text-sm font-semibold"
            >
              Admin Login
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section - Split Layout */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden min-h-[85vh] flex items-center">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-0 items-stretch min-h-[550px]">
            {/* Left Panel - Text Content */}
            <div className="bg-[#FAF4EC] p-8 lg:p-12 flex flex-col justify-center space-y-6">
              {/* Small Tagline */}
              <div className="inline-flex items-center space-x-2">
                <span className="text-xs font-semibold text-[#D2AC6A] uppercase tracking-wider">Food Management Platform</span>
              </div>
              
              {/* Large Bold Text with Icons */}
              <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 leading-[1.1]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="flex items-center gap-2">
                    GOOD
                    <Smile className="w-10 h-10 md:w-12 md:h-12 text-[#D2AC6A]" />
                    TASTE
                  </span>
                </h1>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 leading-[1.1]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="flex items-center gap-2">
                    GOOD
                    <Brain className="w-10 h-10 md:w-12 md:h-12 text-[#D2AC6A]" />
                    SENSE
                  </span>
                </h1>
              </div>
              
              {/* Descriptive Text */}
              <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-xl">
                Streamline orders, manage inventory, and delight customers with our comprehensive food management platform. Browse over thousands of products and manage your restaurant operations seamlessly.
              </p>
              
              {/* Search Bar / CTA */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search products, orders, and more..."
                    className="w-full px-5 py-3 rounded-xl bg-white/80 backdrop-blur-xl border-2 border-[#D2AC6A]/20 text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-[#D2AC6A] transition-all shadow-md text-sm"
                  />
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D2AC6A]" />
                </div>
                <Link 
                  href="/admin/dashboard"
                  className="px-6 py-3 rounded-xl bg-[#D2AC6A] text-white text-sm font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-md whitespace-nowrap"
                >
                  SEARCH
                </Link>
              </div>
            </div>

            {/* Right Panel - Food Image with Decorative Elements */}
            <div className="relative bg-gradient-to-br from-[#D2AC6A]/20 to-[#B8944F]/30 overflow-hidden">
              {/* Main Food Image */}
              <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12">
                <div className="relative w-full h-full max-w-md">
                  {/* Large Food Bowl Image */}
                  <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl">
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
                  
                  {/* Spice Grinder - Top Left */}
                  <div className="absolute -top-4 -left-4 w-20 h-20 rounded-2xl bg-white/90 backdrop-blur-xl border-2 border-[#D2AC6A]/30 shadow-xl flex items-center justify-center">
                    <Utensils className="w-10 h-10 text-[#D2AC6A]" />
                  </div>
                  
                  {/* Olive Oil Bottle - Bottom Left */}
                  <div className="absolute bottom-8 -left-8 w-16 h-24 rounded-xl bg-white/90 backdrop-blur-xl border-2 border-[#D2AC6A]/30 shadow-xl flex items-center justify-center">
                    <div className="w-8 h-16 rounded-full bg-[#D2AC6A]/20"></div>
                  </div>
                  
                  {/* Fork and Spoon - Bottom Right */}
                  <div className="absolute bottom-12 -right-4 flex items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-xl border-2 border-[#D2AC6A]/30 shadow-xl flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-[#D2AC6A]" />
                    </div>
                  </div>
                  
                  {/* Scattered Leaves - Top Right */}
                  <div className="absolute top-8 -right-8 w-16 h-16 rounded-full bg-white/80 backdrop-blur-xl border-2 border-[#D2AC6A]/20 shadow-lg flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#D2AC6A]" />
                  </div>
                  
                  {/* Small Decorative Elements */}
                  <div className="absolute top-1/4 -right-12 w-12 h-12 rounded-full bg-[#D2AC6A]/30 blur-sm"></div>
                  <div className="absolute bottom-1/4 -left-12 w-16 h-16 rounded-full bg-[#D2AC6A]/20 blur-sm"></div>
                </div>
              </div>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-[#D2AC6A]"></div>
                <div className="absolute bottom-32 left-32 w-24 h-24 rounded-full bg-[#D2AC6A]"></div>
                <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-[#D2AC6A]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section - Links to Modules */}
      <section id="quick-access" className="py-20 px-6 relative bg-gradient-to-b from-white/30 to-transparent">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Access Our
              <span className="block text-[#D2AC6A] mt-2">Platform Modules</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Explore our comprehensive suite of modules designed for every aspect of your food business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickAccessModules.map((module, index) => (
              <Link
                key={index}
                href={module.href}
                className="group rounded-3xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%)',
                  backdropFilter: 'blur(30px)',
                  boxShadow: '0 15px 50px rgba(210, 172, 106, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(210, 172, 106, 0.2)',
                }}
              >
                <div className="flex items-start space-x-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #D2AC6A 0%, #B8944F 100%)',
                      boxShadow: '0 8px 24px rgba(210, 172, 106, 0.3)',
                    }}
                  >
                    <module.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-800 mb-2 group-hover:text-[#D2AC6A] transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {module.title}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed mb-3">{module.description}</p>
                    <div className="flex items-center text-[#D2AC6A] text-sm font-semibold">
                      <span>Access Module</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Everything You Need
              <span className="block text-[#D2AC6A] mt-2">In One Platform</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Powerful features designed to streamline your restaurant operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-3xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.4) 100%)',
                  backdropFilter: 'blur(30px)',
                  boxShadow: '0 15px 50px rgba(210, 172, 106, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(210, 172, 106, 0.2)',
                }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #D2AC6A 0%, #B8944F 100%)',
                    boxShadow: '0 8px 24px rgba(210, 172, 106, 0.3)',
                  }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{feature.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 relative bg-gradient-to-b from-white/50 to-transparent">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-[#D2AC6A]/20 mb-4">
                <Zap className="w-4 h-4 text-[#D2AC6A]" />
                <span className="text-sm font-semibold text-neutral-700">Why Choose Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-neutral-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Built for
                <span className="block text-[#D2AC6A] mt-2">Growing Restaurants</span>
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                From cozy cafes to bustling restaurant chains, our platform scales with your business and adapts to your needs.
              </p>
              <div className="space-y-4 pt-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, #D2AC6A 0%, #B8944F 100%)',
                      }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-800 mb-1">{benefit.title}</h4>
                      <p className="text-sm text-neutral-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="rounded-2xl p-6 text-center hover:scale-105 transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%)',
                    backdropFilter: 'blur(25px)',
                    boxShadow: '0 12px 40px rgba(210, 172, 106, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(210, 172, 106, 0.15)',
                  }}
                >
                  <stat.icon className="w-8 h-8 text-[#D2AC6A] mx-auto mb-3" />
                  <div className="text-3xl font-bold text-neutral-800 mb-1">{stat.value}</div>
                  <div className="text-xs text-neutral-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-6 border-t border-[#D2AC6A]/20 bg-white/30 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #D2AC6A 0%, #B8944F 100%)',
                  }}
                >
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-neutral-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Pommy Foods</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Premium food management platform for modern restaurants
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-neutral-800 mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-neutral-600">
                <li><a href="#features" className="hover:text-[#D2AC6A] transition-colors">Features</a></li>
                <li><a href="#benefits" className="hover:text-[#D2AC6A] transition-colors">Benefits</a></li>
                <li><Link href="/admin/dashboard" className="hover:text-[#D2AC6A] transition-colors">Get Started</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-neutral-800 mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-neutral-600">
                <li><a href="#" className="hover:text-[#D2AC6A] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#D2AC6A] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#D2AC6A] transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-neutral-800 mb-6 text-lg">Contact</h4>
              <ul className="space-y-4 text-neutral-600">
                <li className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#D2AC6A]" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#D2AC6A]" />
                  <span>hello@pommyfoods.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-[#D2AC6A]" />
                  <span>123 Food Street, City</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#D2AC6A]/20 text-center text-neutral-600">
            <p>&copy; 2024 Pommy Foods. All rights reserved.</p>
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
    href: '/admin/dashboard'
  },
  {
    icon: Utensils,
    title: 'Kitchen Module',
    description: 'Manage kitchen sheets, track orders, and coordinate food preparation',
    href: '/kitchen/dashboard'
  },
  {
    icon: Truck,
    title: 'Driver App',
    description: 'Track deliveries, manage routes, and handle customer interactions',
    href: '/driver/dashboard'
  },
  {
    icon: ShoppingBag,
    title: 'Customer Portal',
    description: 'Browse products, place orders, and track your purchases',
    href: '/customer/dashboard'
  },
  {
    icon: Package,
    title: 'Products',
    description: 'Manage inventory, stock levels, and product information',
    href: '/admin/products'
  },
  {
    icon: FileText,
    title: 'Orders & Invoices',
    description: 'Process orders, generate invoices, and manage payments',
    href: '/admin/orders'
  }
];

const features = [
  {
    icon: ShoppingBag,
    title: 'Orders',
    description: 'Track and manage all orders in real-time with an intuitive dashboard designed for efficiency.'
  },
  {
    icon: Utensils,
    title: 'Menu Management',
    description: 'Easily update menus, prices, and availability across all your locations from one central platform.'
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Make data-driven decisions with comprehensive analytics, sales reports, and customer insights.'
  },
  {
    icon: Users,
    title: 'Staff Control',
    description: 'Manage your team with role-based access, schedules, and performance tracking tools.'
  }
];

const benefits = [
  {
    title: 'Cloud-Based Platform',
    description: 'Access your data from anywhere, anytime with our secure cloud infrastructure and real-time synchronization.'
  },
  {
    title: 'Mobile-First Design',
    description: 'Optimized for mobile devices so you can manage your business on the go, from any device or location.'
  },
  {
    title: '24/7 Support',
    description: 'Get help whenever you need it with our dedicated support team and comprehensive documentation.'
  },
  {
    title: 'Scalable Solution',
    description: 'Grows with your business from a single location to multiple restaurants with centralized management.'
  }
];

const stats = [
  { icon: Users, value: '500+', label: 'Restaurants' },
  { icon: ShoppingBag, value: '50K+', label: 'Orders' },
  { icon: TrendingUp, value: '99.9%', label: 'Uptime' },
  { icon: Star, value: '4.9/5', label: 'Rating' }
];
