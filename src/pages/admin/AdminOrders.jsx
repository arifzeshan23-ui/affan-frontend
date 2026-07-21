import { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus } from '../../api';
import toast from 'react-hot-toast';
import { Loader2, ChevronDown, Filter } from 'lucide-react';

const statusConfig = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const statusOptions = ['pending', 'confirmed', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => { loadOrders(); }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders(filter || undefined);
      setOrders(res.data);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId} updated to ${newStatus}`);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update');
    }
  };

  const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-primary-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No orders found</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = statusConfig[order.order_status] || statusConfig.pending;
            const isExpanded = expanded[order.id];

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">#{order.id}</span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                        {order.order_status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">Rs. {order.total_amount.toLocaleString()}</span>
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium mt-3"
                  >
                    {isExpanded ? 'Hide' : 'Details'}
                    <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

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
                    <div className="border-t border-gray-200 mt-3 pt-3 grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">Payment: </span><span className="font-medium">{order.payment_method === 'cash_on_delivery' ? 'COD' : 'Advance'}</span></div>
                      <div><span className="text-gray-500">Status: </span><span className={`font-medium ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.payment_status}</span></div>
                      {order.full_name && <div className="col-span-2"><span className="text-gray-500">Name: </span>{order.full_name}</div>}
                      <div className="col-span-2"><span className="text-gray-500">Phone: </span>{order.phone}</div>
                      {order.city && <div><span className="text-gray-500">City: </span>{order.city}</div>}
                      {order.province && <div><span className="text-gray-500">Province: </span>{order.province}</div>}
                      {order.postal_code && <div><span className="text-gray-500">Postal Code: </span>{order.postal_code}</div>}
                      <div className="col-span-2"><span className="text-gray-500">Address: </span>{order.shipping_address}</div>
                      {order.notes && <div className="col-span-2"><span className="text-gray-500">Notes: </span>{order.notes}</div>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
