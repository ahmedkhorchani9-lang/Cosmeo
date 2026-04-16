import { useState, useEffect } from 'react';
import { Plus, Search, Eye, EyeOff, Trash2, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    category: 'Skincare', 
    price: '', 
    stock: '', 
    status: 'Active', 
    image: '', 
    images: [] as string[],
    description: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
  };

  const handleToggleVisibility = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Draft' : 'Active';
    const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', id);
    if (!error) fetchProducts();
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [...newProduct.images];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);
            uploadedUrls.push(publicUrl);
        } else {
            console.error('Error uploading image:', uploadError);
            alert(`Upload failed for ${file.name}: ${uploadError.message}. Make sure you created a PUBLIC bucket named 'product-images' in Supabase.`);
        }
    }

    setNewProduct(prev => ({ 
        ...prev, 
        images: uploadedUrls, 
        image: prev.image || uploadedUrls[0] || '' 
    }));
    setUploading(false);
  };

  const handleCreate = async () => {
    const stockVal = parseInt(newProduct.stock) || 0;
    const payload: any = { 
      name: newProduct.name, 
      category: newProduct.category,
      price: parseFloat(newProduct.price) || 0,
      stock: stockVal,
      description: newProduct.description,
      status: stockVal === 0 ? 'Out of Stock' : newProduct.status,
      image: newProduct.image || (newProduct.images.length > 0 ? newProduct.images[0] : ''),
      images: newProduct.images
    };
    
    const { error } = await supabase.from('products').insert([payload]);
    
    if (!error) {
      setIsModalOpen(false);
      setNewProduct({ name: '', category: 'Skincare', price: '', stock: '', status: 'Active', image: '', images: [], description: '' });
      fetchProducts();
    } else {
      alert(`Error saving product: ${error.message}`);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...newProduct.images];
    const removedUrl = updatedImages[index];
    updatedImages.splice(index, 1);
    
    setNewProduct(prev => ({ 
        ...prev, 
        images: updatedImages,
        image: prev.image === removedUrl ? (updatedImages[0] || '') : prev.image
    }));
  };

  const setPrimaryImage = (url: string) => {
    setNewProduct(prev => ({ ...prev, image: url }));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-1" style={{ fontFamily: 'Tan Nimbus, serif' }}>
            Products
          </h2>
          <p className="text-muted-foreground text-sm">Manage your inventory, multiple images, and stock levels.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-5 py-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">No products found. Add your first product to get started.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl border border-border overflow-hidden shrink-0 bg-secondary relative">
                          <img src={product.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop'} alt={product.name} className="w-full h-full object-cover" />
                          {product.images?.length > 1 && (
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">+{product.images.length - 1}</div>
                          )}
                        </div>
                        <span className="font-semibold text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                    <td className="px-6 py-4 font-bold text-primary">{product.price} DT</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : 'text-foreground'}`}>
                          {product.stock} units
                        </span>
                        <div className="w-16 h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                        product.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                        product.status === 'Draft' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {product.stock === 0 ? <XCircle size={12} /> : product.status === 'Active' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {product.stock === 0 ? 'Out of Stock' : product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleToggleVisibility(product.id, product.status)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all" title="Toggle Visibility">
                          {product.status === 'Draft' ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-md animate-in fade-in" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="w-full max-w-xl bg-background h-full shadow-2xl animate-in slide-in-from-right flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="font-bold text-xl" style={{ fontFamily: 'Tan Nimbus, serif' }}>Add New Product</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Fill in the details to list a new item on your store.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Product Gallery</label>
                    <p className="text-[10px] text-primary font-bold uppercase">{newProduct.images.length} Images Uploaded</p>
                </div>
                
                <div 
                    className={`grid grid-cols-4 gap-3 p-4 rounded-3xl border-2 border-dashed transition-all ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border bg-muted/10'}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                  {newProduct.images.map((url, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => setPrimaryImage(url)}
                        className={`aspect-square rounded-2xl border-2 overflow-hidden bg-muted group relative cursor-pointer transition-all hover:scale-105 ${newProduct.image === url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                    >
                      <img src={url} className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }} 
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X size={12} />
                      </button>
                      {newProduct.image === url && (
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-[8px] text-white text-center py-1 font-bold tracking-widest">PRIMARY</div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-[8px] text-white font-bold bg-black/40 px-2 py-1 rounded-full">{newProduct.image === url ? 'CURRENT PRIMARY' : 'SET AS PRIMARY'}</span>
                      </div>
                    </div>
                  ))}
                  
                  <label className={`aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                    {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                        <div className="flex flex-col items-center group-hover:scale-110 transition-transform">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <Upload className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Upload</span>
                        </div>
                    )}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files ? Array.from(e.target.files) : [])} />
                  </label>
                </div>
                <p className="text-[10px] text-muted-foreground italic text-center">Drag & Drop files or click to upload. Click any image to set it as the main product thumbnail.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Product Name</label>
                  <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all" placeholder="Enter product name..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Description</label>
                  <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all h-24 resize-none" placeholder="Describe the product benefits and ingredients..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Category</label>
                    <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all appearance-none bg-white">
                      <option>Skincare</option>
                      <option>Makeup</option>
                      <option>Fragrance</option>
                      <option>Grooming</option>
                      <option>Body Care</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Price (DT)</label>
                    <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all" placeholder="0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Inventory Level</label>
                    <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all" placeholder="0" />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="flex items-center space-x-3 cursor-pointer bg-muted/30 p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                      <input type="checkbox" checked={newProduct.status === 'Active'} onChange={e => setNewProduct({...newProduct, status: e.target.checked ? 'Active' : 'Draft'})} className="w-5 h-5 rounded-lg border-border text-primary focus:ring-primary" />
                      <span className="text-sm font-bold text-foreground">Active on Store</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border bg-muted/10 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3.5 border border-border rounded-2xl text-sm font-bold hover:bg-muted transition-all">Cancel</button>
              <button 
                onClick={handleCreate} 
                disabled={!newProduct.name || !newProduct.price || uploading} 
                className="flex-1 px-6 py-3.5 bg-primary text-white disabled:opacity-50 rounded-2xl text-sm font-bold hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {uploading ? 'Processing Images...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const XCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);
const CheckCircle2 = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);
const Clock = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
