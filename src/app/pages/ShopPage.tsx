import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Filter } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { supabase } from '../lib/supabase';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [priceRange, setPriceRange] = useState<'all' | 'under50' | '50to100' | 'over100'>('all');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveProducts = async () => {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('status', 'Active');
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchActiveProducts();
  }, []);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'Skincare', label: 'Skincare' },
    { id: 'Makeup', label: 'Makeup' },
    { id: 'Body Care', label: 'Body Care' },
    { id: 'Fragrance', label: 'Fragrance' },
  ];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    let priceMatch = true;
    if (priceRange === 'under50') {
      priceMatch = product.price < 50;
    } else if (priceRange === '50to100') {
      priceMatch = product.price >= 50 && product.price <= 100;
    } else if (priceRange === 'over100') {
      priceMatch = product.price > 100;
    }

    return categoryMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
      <section className="bg-gradient-to-br from-[#F8F9FA] via-[#E8EFE9] to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl mb-4" style={{ fontFamily: 'Tan Nimbus, serif' }}>
            Shop Collection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated selection of premium beauty products
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg">Filters</h3>
              </div>

              <div className="mb-8">
                <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                  Category
                </h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-full transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary text-white'
                          : 'bg-secondary hover:bg-accent'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                  Price Range
                </h4>
                <div className="space-y-2">
                  <button onClick={() => setPriceRange('all')} className={`w-full text-left px-4 py-2.5 rounded-full transition-colors ${priceRange === 'all' ? 'bg-primary text-white' : 'bg-secondary hover:bg-accent'}`}>All Prices</button>
                  <button onClick={() => setPriceRange('under50')} className={`w-full text-left px-4 py-2.5 rounded-full transition-colors ${priceRange === 'under50' ? 'bg-primary text-white' : 'bg-secondary hover:bg-accent'}`}>Under 50 DT</button>
                  <button onClick={() => setPriceRange('50to100')} className={`w-full text-left px-4 py-2.5 rounded-full transition-colors ${priceRange === '50to100' ? 'bg-primary text-white' : 'bg-secondary hover:bg-accent'}`}>50 - 100 DT</button>
                  <button onClick={() => setPriceRange('over100')} className={`w-full text-left px-4 py-2.5 rounded-full transition-colors ${priceRange === 'over100' ? 'bg-primary text-white' : 'bg-secondary hover:bg-accent'}`}>Over 100 DT</button>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : `Showing ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`}
              </p>
            </div>

            {loading ? (
               <div className="text-center py-20"><p className="text-lg text-muted-foreground">Loading products...</p></div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">
                  No products found with the selected filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
