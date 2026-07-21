import { useState, useEffect, useRef } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, Search, Upload, Star, StarOff, Image, Sparkles } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', discount_price: '', stock: '', category: '', gender: '', image_url: '', is_featured: false, is_new_arrival: false });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const fileRef = useRef(null);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', discount_price: '', stock: '', category: '', gender: '', image_url: '', is_featured: false, is_new_arrival: false });
    setPreview('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || '', price: p.price, discount_price: p.discount_price || '',
      stock: p.stock, category: p.category || '', gender: p.gender || '', image_url: p.image_url || '', is_featured: p.is_featured || false, is_new_arrival: p.is_new_arrival || false,
    });
    setPreview(p.image_url || '');
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadImage(formData);
      setForm((prev) => ({ ...prev, image_url: res.data.url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 };
      if (form.discount_price) data.discount_price = parseFloat(form.discount_price);
      if (editing) {
        await updateProduct(editing.id, data);
        toast.success('Product updated');
      } else {
        await createProduct(data);
        toast.success('Product created');
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save product');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      loadProducts();
    } catch { toast.error('Failed to delete'); }
  };

  const toggleFeatured = async (product) => {
    try {
      await updateProduct(product.id, { is_featured: !product.is_featured });
      toast.success(product.is_featured ? 'Removed from featured' : 'Added to featured');
      loadProducts();
    } catch { toast.error('Failed to update'); }
  };

  const toggleNewArrival = async (product) => {
    try {
      await updateProduct(product.id, { is_new_arrival: !product.is_new_arrival });
      toast.success(product.is_new_arrival ? 'Removed from new arrivals' : 'Added to new arrivals');
      loadProducts();
    } catch { toast.error('Failed to update'); }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-40"></div>
        <div className="h-12 bg-gray-200 rounded-2xl"></div>
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Search products..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Price</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">Stock</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Featured</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500 hidden md:table-cell">New</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-500">No products found</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold text-sm shrink-0 overflow-hidden">
                        {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" alt="" /> : p.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{p.name}</p>
                        {p.discount_price && <p className="text-xs text-emerald-600">Rs. {p.discount_price.toLocaleString()}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{p.category || '-'}</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">Rs. {p.price.toLocaleString()}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${p.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => toggleFeatured(p)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        p.is_featured
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                      }`}
                      title={p.is_featured ? 'Remove from featured' : 'Add to featured'}
                    >
                      {p.is_featured ? <Star size={12} className="fill-amber-400" /> : <StarOff size={12} />}
                      {p.is_featured ? 'Featured' : 'Feature'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center hidden md:table-cell">
                    <button
                      onClick={() => toggleNewArrival(p)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        p.is_new_arrival
                          ? 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                      }`}
                      title={p.is_new_arrival ? 'Remove from new arrivals' : 'Add to new arrivals'}
                    >
                      <Sparkles size={12} />
                      {p.is_new_arrival ? 'New' : 'New?'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="font-semibold text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image</label>
                <input type="file" accept="image/*" ref={fileRef} onChange={handleFileUpload} className="hidden" />
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-colors ${
                    uploading ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  {preview ? (
                    <div className="relative group">
                      <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium flex items-center gap-2">
                          <Upload size={16} /> Change Image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      {uploading ? (
                        <Loader2 size={32} className="animate-spin text-primary-500 mb-2" />
                      ) : (
                        <Image size={32} className="text-gray-300 mb-2" />
                      )}
                      <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload image'}</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
                    </div>
                  )}
                </div>
                {form.image_url && (
                  <p className="text-xs text-gray-500 mt-1.5 truncate">Uploaded: {form.image_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (Rs.) *</label>
                  <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Price (Rs.)</label>
                  <input type="number" step="0.01" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
                  <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer">
                    <option value="">Select category...</option>
                    <option value="Summer Cloth">Summer Cloth</option>
                    <option value="Winter Cloth">Winter Cloth</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Slipper">Slipper</option>
                    <option value="School Uniform">School Uniform</option>
                    <option value="Kids Suit">Kids Suit</option>
                    <option value="Marriage Suit">Marriage Suit</option>
                    <option value="Suit">Suit</option>
                    <option value="Jacket">Jacket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer">
                    <option value="">Select gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <Star size={18} className={form.is_featured ? 'text-amber-500 fill-amber-400' : 'text-gray-400'} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Featured Product</p>
                    <p className="text-xs text-gray-500">Show on homepage Featured section</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_featured ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {/* New Arrival Toggle */}
              <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className={form.is_new_arrival ? 'text-cyan-500' : 'text-gray-400'} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New Arrival</p>
                    <p className="text-xs text-gray-500">Show on homepage New Arrivals section</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_new_arrival: !form.is_new_arrival })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_new_arrival ? 'bg-cyan-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_new_arrival ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <button type="submit" disabled={saving || uploading}
                className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors mt-2">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editing ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
