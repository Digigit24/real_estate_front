// src/pages/TenantSettingsPage.tsx
import { PaymentPlanTemplates } from '@/components/settings/PaymentPlanTemplates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenantSettings } from '@/hooks/useTenantSettings';
import type { UpdateTenantSettingsPayload } from '@/types/tenantSettingsTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, FileText, Globe, Loader2, Palette, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const settingsSchema = z.object({
  company_name: z.string().optional(),
  tagline: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  favicon_url: z.string().url().optional().or(z.literal('')),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  accent_color: z.string().optional(),
  subdomain: z.string().optional(),
  custom_domain: z.string().optional(),
  support_email: z.string().email().optional().or(z.literal('')),
  support_phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  gstin: z.string().optional(),
  pdf_header_text: z.string().optional(),
  pdf_footer_text: z.string().optional(),
  signature_url: z.string().url().optional().or(z.literal('')),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function TenantSettingsPage() {
  const { useSettings, updateSettings, isLoading: isSaving } = useTenantSettings();
  const { data: settings, isLoading, mutate: refreshSettings } = useSettings();

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  const primaryColor = watch('primary_color');
  const secondaryColor = watch('secondary_color');
  const accentColor = watch('accent_color');

  useEffect(() => {
    if (settings) {
      reset({
        company_name: settings.company_name || '',
        tagline: settings.tagline || '',
        logo_url: settings.logo_url || '',
        favicon_url: settings.favicon_url || '',
        primary_color: settings.primary_color || '#2563EB',
        secondary_color: settings.secondary_color || '#1E40AF',
        accent_color: settings.accent_color || '#10B981',
        subdomain: settings.subdomain || '',
        custom_domain: settings.custom_domain || '',
        support_email: settings.support_email || '',
        support_phone: settings.support_phone || '',
        address: settings.address || '',
        city: settings.city || '',
        state: settings.state || '',
        pincode: settings.pincode || '',
        gstin: settings.gstin || '',
        pdf_header_text: settings.pdf_header_text || '',
        pdf_footer_text: settings.pdf_footer_text || '',
        signature_url: settings.signature_url || '',
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const payload: UpdateTenantSettingsPayload = {};
      // Only send non-empty fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          (payload as any)[key] = value;
        }
      });
      await updateSettings(payload);
      toast.success('Settings saved');
      refreshSettings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Tenant Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your company branding, contact details, and payment plan templates.
          </p>
        </div>
      </div>

      <Tabs defaultValue="brand" className="space-y-6">
        <TabsList className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 p-1">
          <TabsTrigger value="brand" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm">Brand & Company</TabsTrigger>
          <TabsTrigger value="pdf" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm">PDF Output</TabsTrigger>
          <TabsTrigger value="payment-plans" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm">Payment Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="space-y-6">
          <div className="flex justify-end p-2 pb-0">
            <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={isSaving || !isDirty} className="shadow-sm">
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              Save Settings
            </Button>
          </div>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Company Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input id="company_name" {...register('company_name')} placeholder="Sunrise Developers" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" {...register('tagline')} placeholder="Building Your Dreams" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="support_email">Support Email</Label>
                    <Input id="support_email" type="email" {...register('support_email')} placeholder="support@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support_phone">Support Phone</Label>
                    <Input id="support_phone" {...register('support_phone')} placeholder="020-12345678" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register('address')} placeholder="123 Business Park" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register('city')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...register('state')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" {...register('pincode')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" {...register('gstin')} placeholder="27AAAAA0000A1Z5" />
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Branding & Theme
                </CardTitle>
                <CardDescription className="text-xs">
                  These colors and logos will be used across the CRM and generated PDFs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input id="logo_url" {...register('logo_url')} placeholder="https://cdn.example.com/logo.png" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favicon_url">Favicon URL</Label>
                    <Input id="favicon_url" {...register('favicon_url')} placeholder="https://cdn.example.com/favicon.ico" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor || '#2563EB'}
                        onChange={(e) => {
                          const input = document.getElementById('primary_color') as HTMLInputElement;
                          if (input) {
                            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                              window.HTMLInputElement.prototype, 'value'
                            )?.set;
                            nativeInputValueSetter?.call(input, e.target.value);
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                          }
                        }}
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <Input id="primary_color" {...register('primary_color')} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor || '#1E40AF'}
                        onChange={(e) => {
                          const input = document.getElementById('secondary_color') as HTMLInputElement;
                          if (input) {
                            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                              window.HTMLInputElement.prototype, 'value'
                            )?.set;
                            nativeInputValueSetter?.call(input, e.target.value);
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                          }
                        }}
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <Input id="secondary_color" {...register('secondary_color')} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor || '#10B981'}
                        onChange={(e) => {
                          const input = document.getElementById('accent_color') as HTMLInputElement;
                          if (input) {
                            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                              window.HTMLInputElement.prototype, 'value'
                            )?.set;
                            nativeInputValueSetter?.call(input, e.target.value);
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                          }
                        }}
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <Input id="accent_color" {...register('accent_color')} className="flex-1" />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="flex gap-2 pt-2">
                  <div className="h-8 flex-1 rounded-md" style={{ backgroundColor: primaryColor || '#2563EB' }} />
                  <div className="h-8 flex-1 rounded-md" style={{ backgroundColor: secondaryColor || '#1E40AF' }} />
                  <div className="h-8 flex-1 rounded-md" style={{ backgroundColor: accentColor || '#10B981' }} />
                </div>
              </CardContent>
            </Card>

            {/* Domain */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Domain Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Subdomain</Label>
                    <Input id="subdomain" {...register('subdomain')} placeholder="sunrise" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom_domain">Custom Domain</Label>
                    <Input id="custom_domain" {...register('custom_domain')} placeholder="crm.sunrisedevelopers.com" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="pdf" className="space-y-6">
          <div className="flex justify-end p-2 pb-0">
            <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={isSaving || !isDirty} className="shadow-sm">
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              Save Settings
            </Button>
          </div>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

            {/* PDF Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF Document Settings
                </CardTitle>
                <CardDescription className="text-xs">
                  These settings are used for generating demand letters, receipts, and other documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pdf_header_text">PDF Header Text</Label>
                  <Input id="pdf_header_text" {...register('pdf_header_text')} placeholder="Sunrise Developers Pvt. Ltd." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pdf_footer_text">PDF Footer Text</Label>
                  <Input id="pdf_footer_text" {...register('pdf_footer_text')} placeholder="RERA No: MH/01/2025/12345 | This is a computer generated document" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signature_url">Signature Image URL</Label>
                  <Input id="signature_url" {...register('signature_url')} placeholder="https://cdn.example.com/signature.png" />
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="payment-plans">
          <PaymentPlanTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
}
