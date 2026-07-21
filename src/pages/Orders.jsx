import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders } from '../api';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

const statusConfig = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Confirmed' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Delivered' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Cancelled' },
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border p-6 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package size={32} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
        <p className="text-gray-500 mt-1 text-sm">Start shopping to see your orders here</p>
        <Link to="/shop" className="inline-flex items-center gap-2 mt-6 bg-primary-600 text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200">
          <ShoppingBag size={16} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h1>
      <p className="text-sm text-gray-500 mb-8">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

      <div className="space-y-4">
        {orders.map((order) => {
          const st = statusConfig[order.order_status] || statusConfig.pending;
          const isExpanded = expanded[order.id];

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
              {/* Header */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">Order #{order.id}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                      {st.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="capitalize">{order.payment_method === 'cash_on_delivery' ? 'COD' : 'Advance'}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">Rs. {order.total_amount.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => toggleExpand(order.id)}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium mt-3"
                >
                  {isExpanded ? 'Hide details' : 'View details'}
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Expanded Details */}
              <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                <div className="border-t border-gray-50 px-5 py-4 bg-gray-50/50">
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{item.product_name || `Product #${item.product_id}`} x {item.quantity}</span>
                        <span className="font-medium text-gray-900">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment</span>
                      <span className={`font-medium ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    {order.full_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name</span>
                        <span className="text-gray-700">{order.full_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="text-gray-700">{order.phone}</span>
                    </div>
                    {order.city && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">City</span>
                        <span className="text-gray-700">{order.city}</span>
                      </div>
                    )}
                    {order.province && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Province</span>
                        <span className="text-gray-700">{order.province}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address</span>
                      <span className="text-gray-700 text-right max-w-[60%]">{order.shipping_address}</span>
                    </div>
                    {order.notes && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Notes</span>
                        <span className="text-gray-700 text-right max-w-[60%]">{order.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
