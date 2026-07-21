import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlist, removeFromWishlist, addToCart } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    try {
      const res = await getWishlist();
      setItems(res.data.items || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
    toast.success('Removed from wishlist');
    loadWishlist();
  };

  const handleAddToCart = async (productId) => {
    await addToCart({ product_id: productId, quantity: 1 });
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-40"></div>
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

  if (!items.length) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart size={32} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your wishlist is empty</h2>
        <p className="text-gray-500 mt-1 text-sm">Save products you love for later</p>
        <Link to="/shop" className="inline-flex items-center gap-2 mt-6 bg-primary-600 text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Wishlist</h1>
      <p className="text-sm text-gray-500 mb-8">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow group">
            <Link to={`/product/${item.product_id}`} className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-gray-300 font-bold text-xl shrink-0 hover:shadow-sm transition-shadow">
              {item.product_name?.[0] || '?'}
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.product_id}`} className="font-semibold text-gray-900 text-sm hover:text-primary-600 transition-colors truncate block">
                {item.product_name || `Product #${item.product_id}`}
              </Link>
              <p className="text-sm text-gray-500 mt-0.5">Rs. {(item.product_price || 0).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleAddToCart(item.product_id)}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                title="Add to cart"
              >
                <ShoppingCart size={16} />
              </button>
              <button
                onClick={() => handleRemove(item.product_id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
