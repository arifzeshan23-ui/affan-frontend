import { useState, useEffect } from 'react';
import { getAdminStats } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, ShoppingBag, Package, Users, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-72 bg-gray-200 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  if (!stats) return <div className="text-center py-16 text-gray-500">Failed to load dashboard data</div>;

  const { totals, order_status, monthly_revenue, monthly_orders, category_data, top_products } = stats;

  const statCards = [
    { label: 'Revenue', value: `Rs. ${totals.revenue.toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', change: '+12%', up: true },
    { label: 'Orders', value: totals.orders, icon: ShoppingBag, color: 'from-blue-500 to-blue-600', change: '+8%', up: true },
    { label: 'Products', value: totals.products, icon: Package, color: 'from-purple-500 to-purple-600' },
    { label: 'Users', value: totals.users, icon: Users, color: 'from-amber-500 to-amber-600', change: '+5%', up: true },
  ];

  const maxRevenue = Math.max(...monthly_revenue.data, 1);

  const chartColors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];
  const totalCat = Object.values(category_data).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.username}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon size={20} className="text-white" />
              </div>
              {card.change && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${card.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {card.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {card.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-primary-600" />
            <h2 className="font-semibold text-gray-900">Revenue Overview</h2>
          </div>
          <div className="relative h-56">
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-gray-400 py-1">
              <span>Rs.{(maxRevenue / 1000).toFixed(0)}k</span>
              <span>Rs.{(maxRevenue / 2000).toFixed(0)}k</span>
              <span>0</span>
            </div>
            <div className="ml-14 h-full flex items-end gap-2">
              {monthly_revenue.data.map((val, i) => {
                const barHeight = maxRevenue > 0 ? (val / maxRevenue) * 180 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex justify-center">
                      <div className="absolute -top-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Rs. {val.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-full max-w-[48px]">
                      <div
                        className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500 hover:from-primary-700 hover:to-primary-500"
                        style={{ height: `${Math.max(barHeight, 4)}px` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">{monthly_revenue.labels[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Status Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Order Status</h2>
          <div className="flex justify-center mb-6">
            <svg width="160" height="160" viewBox="0 0 160 160">
              {(() => {
                const total = order_status.pending + order_status.confirmed + order_status.delivered + order_status.cancelled || 1;
                const data = [
                  { value: order_status.pending, color: '#f59e0b', label: 'Pending' },
                  { value: order_status.confirmed, color: '#3b82f6', label: 'Confirmed' },
                  { value: order_status.delivered, color: '#10b981', label: 'Delivered' },
                  { value: order_status.cancelled, color: '#ef4444', label: 'Cancelled' },
                ];
                let cumAngle = -90;
                return data.map((d, i) => {
                  const angle = (d.value / total) * 360;
                  const startAngle = cumAngle;
                  cumAngle += angle;
                  const endAngle = cumAngle;
                  const largeArc = angle > 180 ? 1 : 0;
                  const r = 60;
                  const cx = 80, cy = 80;
                  const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
                  if (d.value === 0) return null;
                  return (
                    <path
                      key={i}
                      d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={d.color}
                      className="hover:opacity-80 transition-opacity"
                    />
                  );
                });
              })()}
              <circle cx="80" cy="80" r="35" fill="white" />
              <text x="80" y="76" textAnchor="middle" className="fill-gray-900 text-[18px] font-bold">{order_status.pending + order_status.confirmed + order_status.delivered + order_status.cancelled}</text>
              <text x="80" y="92" textAnchor="middle" className="fill-gray-400 text-[10px]">orders</text>
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Pending', value: order_status.pending, color: 'bg-amber-500' },
              { label: 'Confirmed', value: order_status.confirmed, color: 'bg-blue-500' },
              { label: 'Delivered', value: order_status.delivered, color: 'bg-emerald-500' },
              { label: 'Cancelled', value: order_status.cancelled, color: 'bg-red-500' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${s.color}`}></span>
                <span className="text-xs text-gray-600">{s.label}</span>
                <span className="text-xs font-bold text-gray-900 ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Orders Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Monthly Orders</h2>
          <div className="h-48 flex items-end gap-2">
            {monthly_orders.data.map((val, i) => {
              const maxOrd = Math.max(...monthly_orders.data, 1);
              const barHeight = (val / maxOrd) * 160;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex justify-center">
                    <div className="absolute -top-7 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {val} orders
                    </div>
                  </div>
                  <div className="w-full max-w-[36px]">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(barHeight, 4)}px` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{monthly_orders.labels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Categories</h2>
          <div className="space-y-4">
            {Object.entries(category_data).map(([cat, count], i) => {
              const pct = (count / totalCat) * 100;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{cat}</span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: chartColors[i % chartColors.length] }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Top Selling</h2>
          {top_products.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {top_products.map((p, i) => {
                const maxSold = top_products[0]?.sold || 1;
                const width = (p.sold / maxSold) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700 truncate max-w-[140px]">{p.name}</span>
                      <span className="text-sm font-bold text-gray-900">{p.sold} sold</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700"
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
