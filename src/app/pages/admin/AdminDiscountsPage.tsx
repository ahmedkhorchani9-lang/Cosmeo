import { useState, useEffect } from 'react';
import { Tag, Plus, Scissors, Trash2, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Promo {
  id: number;
  code: string;
  discount_type: 'Percentage' | 'Fixed';
  discount_value: number;
  usage_count: number;
  status: 'Active' | 'Expired';
  created_at: string;
}

const emptyForm = { code: '', discount_type: 'Percentage' as const, discount_value: 10, status: 'Active' as const };

export const AdminDiscountsPage = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchPromos = async () => {
    setLoading(true);
    const { data } = await supabase.from('promos').select('*').order('created_at', { ascending: false });
    if (data) setPromos(data);
    setLoading(false);
  };

  useEffect(() => { fetchPromos(); }, []);

  const openCreate = () => {
    setEditingPromo(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (promo: Promo) => {
    setEditingPromo(promo);
    setForm({ code: promo.code, discount_type: promo.discount_type, discount_value: promo.discount_value, status: promo.status });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { code: form.code.toUpperCase().trim(), discount_type: form.discount_type, discount_value: Number(form.discount_value), status: form.status };
    if (editingPromo) {
      await supabase.from('promos').update(payload).eq('id', editingPromo.id);
    } else {
      await supabase.from('promos').insert([{ ...payload, usage_count: 0 }]);
    }
    setSaving(false);
    setSaveMsg(editingPromo ? 'Promo updated!' : 'Promo created!');
    setTimeout(() => setSaveMsg(''), 2500);
    setShowForm(false);
    fetchPromos();
  };

  const handleToggleStatus = async (promo: Promo) => {
    const newStatus = promo.status === 'Active' ? 'Expired' : 'Active';
    await supabase.from('promos').update({ status: newStatus }).eq('id', promo.id);
    fetchPromos();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this promo code?')) return;
    await supabase.from('promos').delete().eq('id', id);
    fetchPromos();
  };

  const totalUses = promos.reduce((sum, p) => sum + (p.usage_count || 0), 0);
  const activeCount = promos.filter(p => p.status === 'Active').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-1" style={{ fontFamily: 'Tan Nimbus, serif' }}>
            Discounts & Promos
          </h2>
          <p className="text-muted-foreground text-sm">Create and manage promo codes. Customers enter these at checkout for automatic discounts.</p>
        </div>
        <button onClick={openCreate} className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4 mr-2" />Create Discount
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background border border-border p-5 rounded-2xl flex items-center">
          <div className="p-3 bg-primary/10 text-primary rounded-xl mr-4"><Tag className="w-6 h-6" /></div>
          <div><p className="text-sm text-muted-foreground">Active Promos</p><p className="text-2xl font-bold" style={{ fontFamily: 'Tan Nimbus, serif' }}>{activeCount}</p></div>
        </div>
        <div className="bg-background border border-border p-5 rounded-2xl flex items-center">
          <div className="p-3 bg-accent/10 text-accent rounded-xl mr-4"><Scissors className="w-6 h-6" /></div>
          <div><p className="text-sm text-muted-foreground">Total Uses</p><p className="text-2xl font-bold" style={{ fontFamily: 'Tan Nimbus, serif' }}>{totalUses}</p></div>
        </div>
        <div className="bg-background border border-border p-5 rounded-2xl flex items-center">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl mr-4"><CheckCircle2 className="w-6 h-6" /></div>
          <div><p className="text-sm text-muted-foreground">Total Codes</p><p className="text-2xl font-bold" style={{ fontFamily: 'Tan Nimbus, serif' }}>{promos.length}</p></div>
        </div>
      </div>

      {saveMsg && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />{saveMsg}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-md p-8 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Promo Code</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER20"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none font-mono tracking-wider uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={e => setForm({ ...form, discount_type: e.target.value as 'Percentage' | 'Fixed' })}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (DT)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value {form.discount_type === 'Percentage' ? '(%)' : '(DT)'}</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={form.discount_type === 'Percentage' ? 100 : undefined}
                    value={form.discount_value}
                    onChange={e => setForm({ ...form, discount_value: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as 'Active' | 'Expired' })}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-xl hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : editingPromo ? 'Update Promo' : 'Create Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Promo Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Uses</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading promos...</td></tr>
              ) : promos.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No promo codes yet. Create your first!</td></tr>
              ) : promos.map((promo) => (
                <tr key={promo.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold tracking-wider px-2.5 py-1.5 bg-muted rounded-lg border border-border">{promo.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(promo)}
                      title="Click to toggle"
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                        promo.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {promo.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{promo.discount_type === 'Percentage' ? `${promo.discount_value}% OFF` : `${promo.discount_value} DT OFF`}</div>
                    <div className="text-xs text-muted-foreground">{promo.discount_type}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{promo.usage_count} used</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(promo)} className="text-primary hover:underline font-medium text-sm">Edit</button>
                      <button onClick={() => handleDelete(promo.id)} className="text-destructive hover:underline font-medium text-sm flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" />Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
