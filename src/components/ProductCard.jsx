import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addToWishlist, addToCart, getImageUrl } from '../api';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const price = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Login first'); return; }
    try {
      await addToWishlist({ product_id: product.id });
      toast.success('Added to wishlist');
    } catch {
      toast.error('Already in wishlist');
    }
  };

  const handleCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Login first'); return; }
    try {
      await addToCart({ product_id: product.id, quantity: 1 });
      toast.success('Added to cart');
    } catch {
      toast.error('Could not add to cart');
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-extrabold text-gray-200 group-hover:text-primary-200 transition-colors duration-300">
              {product.name[0]}
            </span>
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
            -{discountPercent}%
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleWishlist}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white shadow-sm transition-all duration-200"
          >
            <Heart size={16} />
          </button>
          {product.stock > 0 && (
            <button
              onClick={handleCart}
              className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-white shadow-sm transition-all duration-200"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <p className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider">{product.category}</p>
        )}
        <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-primary-600 transition-colors line-clamp-2 flex-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold text-gray-900">
            Rs. {price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              Rs. {product.price.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-2">
          {product.stock === 0 ? (
            <span className="text-xs font-medium text-red-500">Out of stock</span>
          ) : product.stock <= 5 ? (
            <span className="text-xs font-medium text-amber-500">Only {product.stock} left</span>
          ) : (
            <span className="text-xs font-medium text-emerald-600">In stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
