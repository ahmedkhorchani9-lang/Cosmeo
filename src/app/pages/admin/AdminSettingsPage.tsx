import { Save, HelpCircle } from 'lucide-react';

export const AdminSettingsPage = () => {
  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-1" style={{ fontFamily: 'Tan Nimbus, serif' }}>
            Settings
          </h2>
          <p className="text-muted-foreground text-sm">Manage your store's configuration and payment integrations.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/90 transition-colors">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      {/* Store Information */}
      <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-medium text-lg">Store Information</div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <input type="text" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" defaultValue="Cosmeo Beauty" />
            </div>
            <div className="space-y-2">
              <input type="email" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" defaultValue="hello@cosmeobeauty.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Physical Address</label>
              <input type="text" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" defaultValue="123 Beauty Blvd, Suite 4A, Los Angeles, CA 90001" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Store Logo URL</label>
              <input type="text" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" defaultValue="/logo.png" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Configuration */}
      <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-medium text-lg">Payments</div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div>
              <p className="font-medium text-foreground">Stripe Integration</p>
              <p className="text-sm text-muted-foreground">Accept credit cards securely.</p>
            </div>
            <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
              <div className="block overflow-hidden h-5 rounded-full bg-primary cursor-pointer w-10"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div>
              <p className="font-medium text-foreground">PayPal</p>
              <p className="text-sm text-muted-foreground">Receive payments via PayPal accounts.</p>
            </div>
            <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" className="absolute block w-5 h-5 rounded-full bg-border border-4 appearance-none cursor-pointer" />
              <div className="block overflow-hidden h-5 rounded-full bg-muted cursor-pointer w-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Options */}
      <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden mb-12">
        <div className="px-6 py-4 border-b border-border font-medium text-lg flex items-center justify-between">
          Shipping Rules
          <button className="text-primary hover:underline text-sm font-medium">Add Rule</button>
        </div>
        <div className="p-6">
          <div className="border border-border rounded-xl overflow-hidden text-sm">
            <div className="grid grid-cols-3 bg-muted/30 p-3 font-medium border-b border-border text-muted-foreground">
              <div>Zone</div>
              <div>Rate</div>
              <div>Conditions</div>
            </div>
            <div className="grid grid-cols-3 bg-background p-3 items-center">
              <div>Domestic (US)</div>
              <div>$5.00</div>
              <div>Always Active</div>
            </div>
            <div className="grid grid-cols-3 bg-background border-t border-border p-3 items-center">
              <div>Domestic (US)</div>
              <div className="text-green-600 font-medium">Free</div>
              <div>Orders over $50.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
