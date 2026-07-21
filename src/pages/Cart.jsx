import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      const res = await getCart();
      setCart(res.data);
    } catch { setCart(null); }
    finally { setLoading(false); }
  };

  const handleQty = async (itemId, qty) => {
    if (qty < 1) return;
    await updateCartItem(itemId, qty);
    loadCart();
  };

  const handleRemove = async (itemId) => {
    await removeFromCart(itemId);
    toast.success('Item removed');
    loadCart();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border p-4 flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart || !cart.items?.length) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingCart size={32} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-1 text-sm">Add some products to get started</p>
        <Link to="/shop" className="inline-flex items-center gap-2 mt-6 bg-primary-600 text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200">
          <ShoppingBag size={16} /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
        <Link to="/shop" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
          <ArrowLeft size={14} /> Continue Shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-gray-300 font-bold text-xl shrink-0">
                {item.product_name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.product_name || `Product #${item.product_id}`}</p>
                <p className="text-sm text-gray-500 mt-0.5">Rs. {(item.product_price || 0).toLocaleString()} each</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                <button onClick={() => handleQty(item.id, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-semibold border-x border-gray-200 h-9 flex items-center justify-center">{item.quantity}</span>
                <button onClick={() => handleQty(item.id, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <p className="font-bold text-gray-900 w-24 text-right text-sm shrink-0">
                Rs. {((item.product_price || 0) * item.quantity).toLocaleString()}
              </p>
              <button onClick={() => handleRemove(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>Rs. {(cart.total || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-lg">Rs. {(cart.total || 0).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary-600 text-white py-3.5 rounded-2xl hover:bg-primary-700 font-semibold text-sm mt-6 transition-colors shadow-sm shadow-primary-200"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
