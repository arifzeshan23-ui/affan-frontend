import { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, FolderOpen, Tag } from 'lucide-react';

const defaultEmojis = {
  'school uniform': '🎓', 'kids suit': '👶', 'summer cloth': '☀️', 'winter cloth': '❄️',
  'shoes': '👟', 'marriage suit': '💍', 'jacket': '🧥', 'suit': '👔', 'slipper': '🩴',
};

const genderOptions = ['All', 'Male', 'Female', 'Kids'];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', gender: 'All' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data);
    } catch { setCategories([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', gender: 'All' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, gender: cat.gender });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, form);
        toast.success('Category updated');
      } else {
        await createCategory(form);
        toast.success('Category created');
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      loadCategories();
    } catch { toast.error('Failed to delete'); }
  };

  const toggleActive = async (cat) => {
    try {
      await updateCategory(cat.id, { is_active: !cat.is_active });
      toast.success(cat.is_active ? 'Category deactivated' : 'Category activated');
      loadCategories();
    } catch { toast.error('Failed to update'); }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-40"></div>
        <div className="h-12 bg-gray-200 rounded-2xl"></div>
        {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-2xl"></div>)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={28} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No categories yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Add your first category to organize products</p>
          <button onClick={openAdd} className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
            Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className={`bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow ${!cat.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">
                    {defaultEmojis[cat.name.toLowerCase()] || '📁'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{cat.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Tag size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{cat.gender}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cat.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(cat)} className={`p-2 rounded-lg transition-colors text-xs font-medium ${cat.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`}>
                    {cat.is_active ? 'On' : 'Off'}
                  </button>
                  <button onClick={() => openEdit(cat)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="font-semibold text-gray-900">{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Summer Cloth, Shoes, Kids Suit"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender Target</label>
                <div className="flex flex-wrap gap-2">
                  {genderOptions.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        form.gender === g
                          ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {g === 'Male' && '👨 '}{g === 'Female' && '👩 '}{g === 'Kids' && '🧒 '}
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors mt-2">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editing ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
