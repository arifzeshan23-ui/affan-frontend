import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCart, placeOrder, placeDirectOrder } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, MapPin, CreditCard, ShieldCheck, ChevronRight, User, Phone, Building, FileText } from 'lucide-react';

const provinces = [
  'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
  'Islamabad Capital Territory', 'Gilgit Baltistan', 'Azad Kashmir',
];

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const direct = location.state?.direct;
  const directProduct = location.state?.product;
  const directQty = location.state?.quantity || 1;

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    city: '',
    province: '',
    postal_code: '',
    shipping_address: user?.address || '',
    payment_method: 'cash_on_delivery',
    notes: '',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!direct) {
      getCart().then((res) => {
        if (!res.data.items?.length) { toast.error('Cart is empty'); navigate('/cart'); return; }
        setCart(res.data);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const total = direct
    ? (directProduct?.discount_price || directProduct?.price || 0) * directQty
    : (cart?.total || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (direct) {
        await placeDirectOrder({
          product_id: directProduct.id,
          quantity: directQty,
          payment_method: form.payment_method,
          full_name: form.full_name,
          phone: form.phone,
          city: form.city,
          province: form.province,
          postal_code: form.postal_code,
          shipping_address: form.shipping_address,
          notes: form.notes,
        });
      } else {
        await placeOrder(form);
      }
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Order failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-48 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <span className="text-primary-600 font-medium">Cart</span>
        <ChevronRight size={14} />
        <span className="text-primary-600 font-medium">Checkout</span>
        <ChevronRight size={14} />
        <span>Confirm</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        {/* Shipping */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Shipping Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input
                required value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
              <input
                required value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="03XX-XXXXXXX"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                <input
                  required value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Lahore, Karachi"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Province *</label>
                <select
                  required value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
                >
                  <option value="">Select province...</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
              <input
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                placeholder="e.g. 54000"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Address *</label>
              <textarea
                required value={form.shipping_address}
                onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                rows={3}
                placeholder="House #, Street, Area, Landmark"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Notes (Optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Any special instructions for delivery"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <CreditCard size={16} className="text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Payment Method</h2>
          </div>
          <div className="space-y-3">
            {[
              { value: 'cash_on_delivery', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
              { value: 'advance_payment', label: 'JazzCash / EasyPaisa', desc: 'Pay now via mobile wallet' },
            ].map((pm) => (
              <label
                key={pm.value}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  form.payment_method === pm.value
                    ? 'border-primary-500 bg-primary-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  form.payment_method === pm.value ? 'border-primary-600' : 'border-gray-300'
                }`}>
                  {form.payment_method === pm.value && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full"></div>}
                </div>
                <div>
                  <span className="font-medium text-gray-900 text-sm">{pm.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{pm.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {direct ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{directProduct.name} x {directQty}</span>
                <span className="font-medium text-gray-900">Rs. {total.toLocaleString()}</span>
              </div>
            ) : (
              cart?.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.product_name} x {item.quantity}</span>
                  <span className="font-medium text-gray-900">Rs. {((item.product_price || 0) * item.quantity).toLocaleString()}</span>
                </div>
              ))
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-emerald-600">Free</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-gray-900 text-xl">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full bg-primary-600 text-white py-3.5 rounded-2xl hover:bg-primary-700 font-semibold text-sm mt-6 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm shadow-primary-200"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? 'Placing Order...' : `Place Order - Rs. ${total.toLocaleString()}`}
          </button>
        </div>
      </form>
    </div>
  );
}
