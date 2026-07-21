import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Heart, Package, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCart } from '../api';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      getCart().then((res) => {
        setCartCount(res.data.items?.length || 0);
      }).catch(() => setCartCount(0));
    }
  }, [user, location]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Affan Cloth & Shoes" className="h-10" />
              <span className="text-xl font-extrabold tracking-tight hidden sm:block">
                <span className="text-primary-600">Affan</span><span className="text-gray-900"> Cloth & Shoes</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" label="Home" active={location.pathname === '/'} />
              <NavLink to="/shop" label="Shop" active={location.pathname === '/shop'} />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/wishlist" className="p-2.5 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200">
                  <Heart size={20} />
                </Link>
                <Link to="/cart" className="p-2.5 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 relative">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className="p-2.5 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200">
                  <Package size={20} />
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="ml-1 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-lg hover:bg-primary-100 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.username}</span>
                  <button onClick={logout} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200">
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-sm shadow-primary-200">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 border-t border-gray-100' : 'max-h-0'}`}>
        <div className="px-4 py-4 space-y-1 bg-white">
          <MobileLink to="/" label="Home" onClick={() => setOpen(false)} active={location.pathname === '/'} />
          <MobileLink to="/shop" label="Shop" onClick={() => setOpen(false)} active={location.pathname === '/shop'} />
          {user ? (
            <>
              <div className="border-t border-gray-100 my-2"></div>
              <MobileLink to="/cart" label={`Cart ${cartCount > 0 ? `(${cartCount})` : ''}`} onClick={() => setOpen(false)} />
              <MobileLink to="/wishlist" label="Wishlist" onClick={() => setOpen(false)} />
              <MobileLink to="/orders" label="My Orders" onClick={() => setOpen(false)} />
              {isAdmin && <MobileLink to="/admin" label="Admin Panel" onClick={() => setOpen(false)} isPrimary />}
              <div className="border-t border-gray-100 my-2"></div>
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                </div>
                <button onClick={() => { logout(); setOpen(false); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="border-t border-gray-100 my-2"></div>
              <div className="flex gap-2 pt-1">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Login
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        active
          ? 'text-primary-600 bg-primary-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  );
}

function MobileLink({ to, label, onClick, active, isPrimary }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        isPrimary
          ? 'text-primary-600 bg-primary-50'
          : active
            ? 'text-primary-600 bg-primary-50'
            : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
      <ChevronRight size={16} className="text-gray-400" />
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Affan Cloth & Shoes" className="h-10" />
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-primary-400">Affan</span><span className="text-white"> Cloth & Shoes</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed max-w-sm">
              Your premium destination for quality products. Shop with confidence and enjoy fast delivery across Pakistan.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-2.5 text-sm">
              <Link to="/" className="block hover:text-white transition-colors">Home</Link>
              <Link to="/shop" className="block hover:text-white transition-colors">Shop</Link>
              <Link to="/cart" className="block hover:text-white transition-colors">Cart</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-2.5 text-sm">
              <p>tariqsayyaf429@gmail.com</p>
              <p>+92 341 0255575</p>
              <p>Affan Cloth & Shoes Near Petrol Pump Ghwari, Gilgit Baltistan, Pakistan</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Affan Cloth & Shoes. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
