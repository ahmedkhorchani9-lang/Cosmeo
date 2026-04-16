import { useState, useEffect } from 'react';
import { Image, Type, LayoutTemplate, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminContentPage = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState({
    hero_heading: 'Discover Your Natural Glow',
    hero_subheading: 'Premium beauty and cosmetics crafted naturally.',
    hero_banner: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
    announcement_text: 'Free shipping on orders over $50! ✨',
    announcement_active: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
      if (data && !error) {
        setSettings({
          hero_heading: data.hero_heading || settings.hero_heading,
          hero_subheading: data.hero_subheading || settings.hero_subheading,
          hero_banner: data.hero_banner || settings.hero_banner,
          announcement_text: data.announcement_text || settings.announcement_text,
          announcement_active: data.announcement_active ?? settings.announcement_active
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    // Using upsert or update to id=1
    const { error } = await supabase.from('store_settings').update({
      hero_heading: settings.hero_heading,
      hero_subheading: settings.hero_subheading,
      hero_banner: settings.hero_banner,
      announcement_text: settings.announcement_text,
      announcement_active: settings.announcement_active,
      updated_at: new Date().toISOString()
    }).eq('id', 1);

    setIsSaving(false);
    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      console.error(error);
      alert('Failed to save settings. Make sure you created the SQL table!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    });
  };

  if (loading) return <div className="text-muted-foreground p-8">Loading configuration...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-1" style={{ fontFamily: 'Tan Nimbus, serif' }}>
            Content Management
          </h2>
          <p className="text-muted-foreground text-sm">Update your homepage sections and banners directly without coding.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Publishing...' : 'Publish Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/10 font-medium flex items-center">
              <LayoutTemplate className="w-4 h-4 mr-2 text-primary" />
              Hero Section (Homepage)
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center">
                    <Type className="w-4 h-4 mr-2 text-muted-foreground" /> Main Heading
                  </label>
                  <input type="text" name="hero_heading" value={settings.hero_heading} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center">
                    <Type className="w-4 h-4 mr-2 text-muted-foreground" /> Subheading Text
                  </label>
                  <textarea rows={2} name="hero_subheading" value={settings.hero_subheading} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center">
                    <Image className="w-4 h-4 mr-2 text-muted-foreground" /> Background Banner URL
                  </label>
                  <input type="text" name="hero_banner" value={settings.hero_banner} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Promotional Banner */}
          <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/10 font-medium flex items-center">
              <LayoutTemplate className="w-4 h-4 mr-2 text-accent" />
              Top Announcement Bar
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-foreground">Announcement Text</label>
                  <input type="text" name="announcement_text" value={settings.announcement_text} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="w-32 space-y-2 mt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" name="announcement_active" onChange={handleChange} checked={settings.announcement_active} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                      <label className="toggle-label block overflow-hidden h-5 rounded-full bg-primary cursor-pointer"></label>
                    </div>
                    <span className="text-sm text-foreground">Active</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-muted/30 p-6 rounded-2xl border border-border">
            <h3 className="font-semibold text-lg mb-2">Publish Status</h3>
            <p className="text-sm text-muted-foreground mb-4">Any changes you make here are automatically pushed directly to live client devices.</p>
            
            {saveSuccess ? (
              <div className="text-sm font-medium flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Synced to Database!
              </div>
            ) : (
              <div className="text-sm font-medium flex items-center text-foreground/80 bg-background px-3 py-2 rounded-lg border border-border">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div> Standby Mode
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
