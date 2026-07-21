import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, X, Loader2, User, Users, Baby } from 'lucide-react';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (gender) params.gender = gender;
    if (sort) params.sort = sort;
    getProducts(params).then((res) => {
      setProducts(res.data);
      if (!categories.length) {
        const cats = [...new Set(res.data.filter((p) => p.category).map((p) => p.category))];
        setCategories(cats);
      }
    }).finally(() => setLoading(false));
  }, [search, category, gender, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (gender) params.gender = gender;
    if (sort) params.sort = sort;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setGender('');
    setSort('');
    setSearchParams({});
  };

  const hasFilters = search || category || gender || sort;

  const genderOptions = [
    { value: 'Male', label: 'Male', icon: User, emoji: '👨' },
    { value: 'Female', label: 'Female', icon: Users, emoji: '👩' },
    { value: 'Kids', label: 'Kids', icon: Baby, emoji: '🧒' },
  ];

  const sortOptions = [
    { value: '', label: 'Latest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
  ];

  const categoryIcons = {
    'school uniform': '🎓',
    'kids suit': '👶',
    'summer cloth': '☀️',
    'winter cloth': '❄️',
    'shoes': '👟',
    'marriage suit': '💍',
    'jacket': '🧥',
    'suit': '👔',
    'slipper': '🩴',
    default: '🛍️',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
        <p className="text-gray-500 mt-1">Discover our collection</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm transition-all"
              />
            </div>
            <button type="submit" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 font-medium text-sm transition-colors shadow-sm shadow-primary-200">
              Search
            </button>
          </form>

          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setSearchParams({ sort: e.target.value, category, gender, search }); }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors sm:hidden ${
                showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className={`flex flex-wrap gap-2 ${showFilters ? '' : 'hidden sm:flex'}`}>
          <button
            onClick={() => { setCategory(''); setGender(''); setSearchParams({ search, sort }); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              !category
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-200 hover:text-primary-600'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setGender(''); setSearchParams({ category: c, search, sort }); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
                category === c
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-200 hover:text-primary-600'
              }`}
            >
              <span className="mr-1">{categoryIcons[c.toLowerCase()] || '🛍️'}</span>
              {c}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Gender filter pills */}
        {category && (
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-2 text-sm text-gray-500 font-medium">Gender:</span>
            {genderOptions.map((g) => (
              <button
                key={g.value}
                onClick={() => { setGender(g.value); setSearchParams({ category, gender: g.value, search, sort }); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  gender === g.value
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-200 hover:text-primary-600'
                }`}
              >
                <span>{g.emoji}</span>
                {g.label}
              </button>
            ))}
            {gender && (
              <button
                onClick={() => { setGender(''); setSearchParams({ category, search, sort }); }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={14} /> Remove
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
          <p className="text-gray-500 mt-1 text-sm">Try adjusting your filters</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
