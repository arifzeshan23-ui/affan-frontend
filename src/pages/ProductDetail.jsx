import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, addToCart, addToWishlist, getImageUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ShoppingCart, Heart, ArrowLeft, Package, Minus, Plus, Check, Loader2, MessageCircle } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getProduct(id).then((res) => {
      setProduct(res.data);
    }).catch(() => {
      toast.error('Product not found');
      navigate('/shop');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Login first'); navigate('/login'); return; }
    setAddingToCart(true);
    try {
      await addToCart({ product_id: product.id, quantity: qty });
      toast.success('Added to cart!');
    } catch {
      toast.error('Could not add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) { toast.error('Login first'); navigate('/login'); return; }
    navigate('/checkout', { state: { direct: true, product, quantity: qty } });
  };

  const handleAddToWishlist = async () => {
    if (!user) { toast.error('Login first'); navigate('/login'); return; }
    try {
      await addToWishlist({ product_id: product.id });
      toast.success('Added to wishlist!');
    } catch {
      toast.error('Already in wishlist');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24 mb-8"></div>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="aspect-square bg-gray-200 rounded-3xl"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3 mt-6"></div>
              <div className="h-20 bg-gray-200 rounded mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) return null;

  const price = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 mb-8 text-sm font-medium transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-8 md:gap-14">
        {/* Image */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden">
          {product.image_url ? (
            <img src={getImageUrl(product.image_url)} alt={product.name} className="w-full aspect-square object-cover" />
          ) : (
            <div className="w-full aspect-square flex items-center justify-center">
              <span className="text-8xl font-extrabold text-gray-200">{product.name[0]}</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
              -{discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.category && (
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">{product.category}</span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>

          <div className="flex items-center gap-3 mt-5">
            <span className="text-3xl font-bold text-gray-900">Rs. {price.toLocaleString()}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">Rs. {product.price.toLocaleString()}</span>
                <span className="bg-emerald-50 text-emerald-700 text-sm px-2.5 py-1 rounded-lg font-semibold">
                  Save Rs. {(product.price - product.discount_price).toLocaleString()}
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2 mt-6 p-3 bg-gray-50 rounded-xl">
            <Package size={18} className={product.stock > 0 ? 'text-emerald-500' : 'text-red-500'} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <>
              {/* Quantity */}
              <div className="flex items-center gap-4 mt-8">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-900 border-x border-gray-200 h-10 flex items-center justify-center">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-primary-600 text-primary-600 px-6 py-3.5 rounded-2xl hover:bg-primary-50 font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {addingToCart ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-primary-600 text-white px-6 py-3.5 rounded-2xl hover:bg-primary-700 font-semibold transition-all duration-200 shadow-sm shadow-primary-200"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-2xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-gray-400 transition-all duration-200 shrink-0"
                >
                  <Heart size={20} />
                </button>
              </div>

              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/923410255575?text=${encodeURIComponent(
                  `Hi Affan Cloth & Shoes!\n\nI'm interested in this product:\n\n*${product.name}*\n` +
                  `Price: Rs. ${price.toLocaleString()}${hasDiscount ? ` (was Rs. ${product.price.toLocaleString()})` : ''}\n` +
                  `${product.category ? `Category: ${product.category}\n` : ''}` +
                  `${product.description ? `\nDescription: ${product.description}\n` : ''}` +
                  `\nImage: ${getImageUrl(product.image_url)}\n` +
                  `\nProduct Link: ${window.location.href}\n\nPlease share details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3.5 rounded-2xl hover:bg-[#1da851] font-semibold transition-all duration-200 shadow-sm shadow-green-200"
              >
                <MessageCircle size={20} />
                Shopping with WhatsApp
              </a>
            </>
          )}

          {/* Features */}
          <div className="mt-auto pt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Check, label: 'Quality Guaranteed' },
              { icon: Check, label: 'Secure Payment' },
              { icon: Check, label: 'Easy Returns' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                <f.icon size={14} className="text-emerald-500 shrink-0" />
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
