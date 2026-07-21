import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Shield, Truck, RefreshCw, Star, Zap, ChevronRight, X, User, Users, Baby, Percent, Flame } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genderModal, setGenderModal] = useState(null);

  useEffect(() => {
    Promise.all([
      getProducts({ featured: true }).catch(() => ({ data: [] })),
      getProducts({ new_arrival: true }).catch(() => ({ data: [] })),
      getProducts().catch(() => ({ data: [] })),
    ]).then(([featuredRes, newArrivalsRes, allRes]) => {
      setFeaturedProducts(featuredRes.data);
      setNewArrivals(newArrivalsRes.data);
      setAllProducts(allRes.data);
      const cats = [...new Set(allRes.data.filter((p) => p.category).map((p) => p.category))];
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over Rs. 2000', color: 'from-blue-500 to-blue-600' },
    { icon: Shield, title: 'Secure Payment', desc: '100% protected checkout', color: 'from-emerald-500 to-emerald-600' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy', color: 'from-amber-500 to-amber-600' },
    { icon: Zap, title: 'Fast Delivery', desc: '2-5 business days', color: 'from-purple-500 to-purple-600' },
  ];

  const saleProducts = allProducts.filter((p) => p.discount_price && p.discount_price < p.price).slice(0, 4);
  const maleProducts = allProducts.filter((p) => p.gender === 'Male').slice(0, 4);
  const femaleProducts = allProducts.filter((p) => p.gender === 'Female').slice(0, 4);
  const kidsProducts = allProducts.filter((p) => p.gender === 'Kids').slice(0, 4);

  const categoryIcons = {
    'school uniform': '🎓',
    'kids suit': '👶',
    'summer cloth': '☀️',
    'winter cloth': '❄️',
    'shoes': '👟',
    'marriage suit': '💍',
    'jacket': '🧥',
    'suit': '👔',
    'slipper': '🩴',
    default: '🛍️',
  };

  const genderOptions = [
    { value: 'Male', label: 'Male', icon: User, emoji: '👨' },
    { value: 'Female', label: 'Female', icon: Users, emoji: '👩' },
    { value: 'Kids', label: 'Kids', icon: Baby, emoji: '🧒' },
  ];

  const handleCategoryClick = (cat) => {
    setGenderModal(cat);
  };

  const handleGenderSelect = (gender) => {
    navigate(`/shop?category=${encodeURIComponent(genderModal)}&gender=${encodeURIComponent(gender)}`);
    setGenderModal(null);
  };

  return (
    <div>
      {/* Gender Selection Modal */}
      {genderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setGenderModal(null)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Select Gender</h3>
                <p className="text-sm text-gray-500 mt-1">Choose for "{genderModal}"</p>
              </div>
              <button onClick={() => setGenderModal(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {genderOptions.map((g) => (
                <button
                  key={g.value}
                  onClick={() => handleGenderSelect(g.value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
                >
                  <span className="text-3xl">{g.emoji}</span>
                  <span className="font-semibold text-gray-700 group-hover:text-primary-600 text-sm">{g.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate(`/shop?category=${encodeURIComponent(genderModal)}`)}
              className="w-full mt-4 py-2.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors"
            >
              View All (No Filter)
            </button>
          </div>
        </div>
      )}

      {/* Hero Section with Logo */}
      <section className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=800&fit=crop"
            alt="Hero"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <img src="/logo.png" alt="Affan Cloth & Shoes" className="h-20 md:h-28 mb-6 drop-shadow-2xl" />
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Star size={14} className="text-amber-300 fill-amber-300" />
              <span className="text-white/90 text-sm font-medium">Premium Collection 2026</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
              Elevate Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-amber-300">
                Style
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-lg">
              Discover curated collections that define modern fashion. Quality products delivered to your doorstep across Pakistan.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to="/shop"
                className="group bg-white text-gray-900 px-7 py-3.5 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                Shop Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="border-2 border-white/30 text-white px-7 py-3.5 rounded-2xl font-bold hover:bg-white/10 transition-all duration-200"
              >
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 -mt-8 relative z-10">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                <f.icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Gender */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Gender</h2>
          <p className="text-sm text-gray-500 mt-1">Find styles for everyone</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Men', gender: 'Male', emoji: '👨', color: 'from-blue-500 to-blue-700' },
            { label: 'Women', gender: 'Female', emoji: '👩', color: 'from-pink-500 to-pink-700' },
            { label: 'Kids', gender: 'Kids', emoji: '🧒', color: 'from-amber-500 to-amber-700' },
          ].map((g) => (
            <button
              key={g.gender}
              onClick={() => navigate(`/shop?gender=${g.gender}`)}
              className={`group relative overflow-hidden rounded-2xl p-6 md:p-8 text-left bg-gradient-to-br ${g.color} text-white hover:scale-[1.02] transition-all duration-300 shadow-lg`}
            >
              <span className="text-4xl md:text-5xl mb-3 block">{g.emoji}</span>
              <span className="text-lg md:text-xl font-bold">{g.label}</span>
              <span className="text-sm opacity-80 mt-1 block">Shop Now</span>
              <ArrowRight size={20} className="absolute bottom-6 right-6 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products - Admin Selected */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-sm text-gray-500 mt-1">Handpicked by our team</p>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
            >
              View All
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* On Sale / Discount Products */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Percent size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">On Sale</h2>
                <p className="text-sm text-gray-500 mt-0.5">Grab before it's gone</p>
              </div>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
            >
              View All
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {saleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
              <p className="text-sm text-gray-500 mt-1">Find what you're looking for</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className="group bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-primary-200 hover:shadow-md hover:shadow-primary-100/50 transition-all duration-300 cursor-pointer"
              >
                <div className="text-3xl mb-2">{categoryIcons[cat.toLowerCase()] || categoryIcons.default}</div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">{cat}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Men's Collection */}
      {maleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👨</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Men's Collection</h2>
                <p className="text-sm text-gray-500 mt-0.5">Styles for men</p>
              </div>
            </div>
            <Link
              to="/shop?gender=Male"
              className="group flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
            >
              View All
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {maleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Women's Collection */}
      {femaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👩</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Women's Collection</h2>
                <p className="text-sm text-gray-500 mt-0.5">Styles for women</p>
              </div>
            </div>
            <Link
              to="/shop?gender=Female"
              className="group flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
            >
              View All
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {femaleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Kids Collection */}
      {kidsProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧒</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Kids Collection</h2>
                <p className="text-sm text-gray-500 mt-0.5">Styles for kids</p>
              </div>
            </div>
            <Link
              to="/shop?gender=Kids"
              className="group flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
            >
              View All
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {kidsProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals - Admin Selected */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Flame size={20} className="text-cyan-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
                <p className="text-sm text-gray-500 mt-0.5">Check out the latest</p>
              </div>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
            >
              View All
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold">Ready to Start Shopping?</h2>
            <p className="mt-3 text-primary-100/80">Create an account today and get access to exclusive deals and offers.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-2xl font-bold mt-6 hover:bg-primary-50 transition-colors shadow-lg"
            >
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
