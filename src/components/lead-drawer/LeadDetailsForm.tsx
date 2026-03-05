// src/components/lead-drawer/LeadDetailsForm.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Check, ChevronDown, ChevronsUpDown, MapPin, Sparkles } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { DynamicFieldRenderer } from '@/components/crm/DynamicFieldRenderer';
import { useAuth } from '@/hooks/useAuth';
import { useBrokers } from '@/hooks/useBrokers';
import { useCRM } from '@/hooks/useCRM';
import { useCurrency } from '@/hooks/useCurrency';
import { useUsers } from '@/hooks/useUsers';
import type { CreateLeadPayload, Lead } from '@/types/crmTypes';
import { PRIORITY_OPTIONS } from '@/types/crmTypes';
import type { LeadFormHandle } from '../LeadsFormDrawer';

interface LeadDetailsFormProps {
  lead?: Lead | null;
  mode: 'view' | 'edit' | 'create';
}

const LeadDetailsForm = forwardRef<LeadFormHandle, LeadDetailsFormProps>(
  ({ lead, mode }, ref) => {
    const { user } = useAuth();
    const { useLeadStatuses, useFieldConfigurations } = useCRM();
    const { getCurrencyCode } = useCurrency();
    const { useUsersList } = useUsers();
    const { useBrokersList } = useBrokers();
    const [brokerSearch, setBrokerSearch] = useState('');
    const [brokerPopoverOpen, setBrokerPopoverOpen] = useState(false);

    // Fetch data
    const { data: statusesData, isLoading: statusesLoading } = useLeadStatuses({
      is_active: true,
      ordering: 'order_index',
    });

    const { data: usersData, isLoading: usersLoading } = useUsersList({
      page: 1,
      page_size: 1000,
      is_active: true,
    });

    const { data: brokersData, isLoading: brokersLoading } = useBrokersList({
      page: 1,
      page_size: 200,
      search: brokerSearch || undefined,
    });

    // Fetch all field configurations (standard + custom)
    const { data: configurationsData } = useFieldConfigurations({
      is_active: true,
      ordering: 'display_order',
      page_size: 200,
    });

    // Separate standard and custom fields, respect visibility
    const allFields = configurationsData?.results || [];
    const standardFieldsMap = useMemo(() => {
      const map = new Map<string, { visible: boolean; order: number }>();
      allFields
        .filter((field) => field.is_standard)
        .forEach((field) => {
          map.set(field.field_name, {
            visible: field.is_visible,
            order: field.display_order,
          });
        });
      return map;
    }, [allFields]);

    const customFields = useMemo(() => {
      return allFields
        .filter((field) => !field.is_standard && field.is_visible)
        .sort((a, b) => a.display_order - b.display_order);
    }, [allFields]);

    const isReadOnly = mode === 'view';

    // Helper to check if a standard field should be visible
    const isFieldVisible = (fieldName: string): boolean => {
      const fieldConfig = standardFieldsMap.get(fieldName);
      // If no configuration exists, default to visible (for backwards compatibility)
      return fieldConfig ? fieldConfig.visible : true;
    };

    // Build dynamic schema
    const formSchema = useMemo(() => {
      const baseSchema: Record<string, z.ZodTypeAny> = {
        // Basic Info - only include if visible
        ...(isFieldVisible('name') && {
          name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
        }),
        ...(isFieldVisible('phone') && {
          phone: z.string()
            .min(10, 'Phone must be at least 10 digits')
            .max(10, 'Phone must be at most 10 digits'),
        }),
        ...(isFieldVisible('email') && {
          email: z.string().email('Invalid email').optional().or(z.literal('')),
        }),
        ...(isFieldVisible('company') && {
          company: z.string().max(255).optional(),
        }),
        ...(isFieldVisible('title') && {
          title: z.string().max(255).optional(),
        }),
        ...(isFieldVisible('status') && {
          status: z.number().optional(),
        }),
        ...(isFieldVisible('priority') && {
          priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
        }),
        ...(isFieldVisible('lead_score') && {
          lead_score: z.number().min(0).max(100).default(0),
        }),
        ...(isFieldVisible('value_amount') && {
          value_amount: z.string().optional(),
        }),
        ...(isFieldVisible('value_currency') && {
          value_currency: z.string().max(3).optional(),
        }),
        ...(isFieldVisible('source') && {
          source: z.string().max(100).optional(),
        }),
        owner_user_id: z.coerce.string().optional(),
        ...(isFieldVisible('assigned_to') && {
          assigned_to: z.coerce.string().optional(),
        }),
        last_contacted_at: z.string().optional(),
        ...(isFieldVisible('next_follow_up_at') && {
          next_follow_up_at: z.string().optional(),
        }),
        ...(isFieldVisible('notes') && {
          notes: z.string().optional(),
        }),

        // Address
        ...(isFieldVisible('address_line1') && {
          address_line1: z.string().optional(),
        }),
        ...(isFieldVisible('address_line2') && {
          address_line2: z.string().optional(),
        }),
        ...(isFieldVisible('city') && {
          city: z.string().optional(),
        }),
        ...(isFieldVisible('state') && {
          state: z.string().optional(),
        }),
        ...(isFieldVisible('country') && {
          country: z.string().optional(),
        }),
        ...(isFieldVisible('postal_code') && {
          postal_code: z.string().optional(),
        }),

        // Broker
        broker_id: z.number().optional().nullable(),
      };

      // Add custom fields to schema
      const customFieldSchemas: Record<string, z.ZodTypeAny> = {};
      customFields.forEach((field) => {
        let fieldSchema: z.ZodTypeAny = z.any().optional();

        if (field.is_required) {
          if (field.field_type === 'CHECKBOX') {
            fieldSchema = z.boolean().refine((val) => val === true, {
              message: `${field.field_label} must be checked`,
            });
          } else if (field.field_type === 'MULTISELECT') {
            fieldSchema = z.array(z.string()).min(1, `${field.field_label} is required`);
          } else if (field.field_type === 'EMAIL') {
            fieldSchema = z.string().min(1, `${field.field_label} is required`).email();
          } else if (field.field_type === 'URL') {
            fieldSchema = z.string().min(1, `${field.field_label} is required`).url();
          } else {
            fieldSchema = z.string().min(1, `${field.field_label} is required`);
          }
        } else {
          if (field.field_type === 'CHECKBOX') {
            fieldSchema = z.boolean().optional();
          } else if (field.field_type === 'MULTISELECT') {
            fieldSchema = z.array(z.string()).optional();
          } else {
            fieldSchema = z.string().optional();
          }
        }

        customFieldSchemas[`custom_${field.field_name}`] = fieldSchema;
      });

      return z.object({ ...baseSchema, ...customFieldSchemas });
    }, [customFields, standardFieldsMap, isFieldVisible]);

    type FormData = z.infer<typeof formSchema>;

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {},
    });

    // Initialize form
    useEffect(() => {
      const defaultValues: any = {
        name: lead?.name || '',
        phone: lead?.phone || '',
        email: lead?.email || '',
        company: lead?.company || '',
        title: lead?.title || '',
        status: typeof lead?.status === 'object' ? lead.status?.id : lead?.status,
        priority: lead?.priority || 'MEDIUM',
        lead_score: lead?.lead_score || 0,
        value_amount: lead?.value_amount || '',
        value_currency: lead?.value_currency || getCurrencyCode(),
        source: lead?.source || '',
        assigned_to: lead?.assigned_to || '',
        last_contacted_at: lead?.last_contacted_at || '',
        next_follow_up_at: lead?.next_follow_up_at || '',
        notes: lead?.notes || '',
        address_line1: lead?.address_line1 || '',
        address_line2: lead?.address_line2 || '',
        city: lead?.city || '',
        state: lead?.state || '',
        country: lead?.country || '',
        postal_code: lead?.postal_code || '',
        broker_id: (lead as any)?.broker_id || null,
      };

      // Add custom fields
      customFields.forEach((field) => {
        let value = field.default_value || '';
        if (lead?.metadata?.[field.field_name] !== undefined) {
          value = lead.metadata[field.field_name];
        }

        if (field.field_type === 'CHECKBOX') {
          defaultValues[`custom_${field.field_name}`] = value === true || value === 'true';
        } else if (field.field_type === 'MULTISELECT') {
          defaultValues[`custom_${field.field_name}`] = Array.isArray(value) ? value : [];
        } else {
          defaultValues[`custom_${field.field_name}`] = value || '';
        }
      });

      reset(defaultValues);
    }, [lead, customFields, user?.id, reset]);

    // Expose form values
    useImperativeHandle(ref, () => ({
      getFormValues: async (): Promise<CreateLeadPayload | null> => {
        return new Promise((resolve) => {
          handleSubmit(
            (data) => {
              // Extract custom fields
              const metadata: Record<string, any> = {};
              const cleanData: any = {};

              Object.entries(data).forEach(([key, value]) => {
                if (key.startsWith('custom_')) {
                  const fieldName = key.replace('custom_', '');
                  if (value !== '' && value !== null && value !== undefined) {
                    metadata[fieldName] = value;
                  }
                } else {
                  cleanData[key] = value || undefined;
                }
              });

              resolve({
                ...cleanData,
                metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
              });
            },
            (validationErrors) => {
              console.error('❌ Lead form validation errors:', validationErrors);
              Object.entries(validationErrors).forEach(([field, err]: [string, any]) => {
                console.error(`  Field "${field}": ${err?.message || JSON.stringify(err)}`);
              });
              resolve(null);
            }
          )();
        });
      },
    }));

    return (
      <div className="space-y-4">
        {/* Basic Info Section */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-0.5 mb-2.5">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
            {/* Name */}
            {isFieldVisible('name') && (
              <div className="space-y-1">
                <Label htmlFor="name" className={`text-xs text-muted-foreground font-normal ${errors.name ? 'text-destructive' : ''}`}>
                  Name <span className="text-destructive">*</span>
                </Label>
                <Controller name="name" control={control} render={({ field }) => (
                  <Input {...field} id="name" placeholder="John Doe" disabled={isReadOnly} className={`h-8 text-sm ${errors.name ? 'border-destructive' : ''}`} />
                )} />
                {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
              </div>
            )}

            {/* Phone */}
            {isFieldVisible('phone') && (
              <div className="space-y-1">
                <Label htmlFor="phone" className={`text-xs text-muted-foreground font-normal ${errors.phone ? 'text-destructive' : ''}`}>
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Controller name="phone" control={control} render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <Input id="phone" name={name} ref={ref} value={value || ''} onChange={onChange} onBlur={onBlur} type="text" inputMode="numeric" placeholder="9876543210" minLength={10} maxLength={10} disabled={isReadOnly} className={`h-8 text-sm ${errors.phone ? 'border-destructive' : ''}`} />
                )} />
                {errors.phone && <p className="text-[11px] text-destructive">{errors.phone.message}</p>}
              </div>
            )}

            {/* Email */}
            {isFieldVisible('email') && (
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-muted-foreground font-normal">Email</Label>
                <Controller name="email" control={control} render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <Input id="email" name={name} ref={ref} value={value || ''} onChange={onChange} onBlur={onBlur} type="email" placeholder="john@example.com" disabled={isReadOnly} className="h-8 text-sm" />
                )} />
              </div>
            )}

            {/* Company */}
            {isFieldVisible('company') && (
              <div className="space-y-1">
                <Label htmlFor="company" className="text-xs text-muted-foreground font-normal">Company</Label>
                <Controller name="company" control={control} render={({ field }) => (
                  <Input {...field} id="company" placeholder="Acme Inc." disabled={isReadOnly} className="h-8 text-sm" />
                )} />
              </div>
            )}

            {/* Title */}
            {isFieldVisible('title') && (
              <div className="space-y-1">
                <Label htmlFor="title" className="text-xs text-muted-foreground font-normal">Title</Label>
                <Controller name="title" control={control} render={({ field }) => (
                  <Input {...field} id="title" placeholder="CEO" disabled={isReadOnly} className="h-8 text-sm" />
                )} />
              </div>
            )}

            {/* Status */}
            {isFieldVisible('status') && (
              <div className="space-y-1">
                <Label htmlFor="status" className="text-xs text-muted-foreground font-normal">Status</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value, 10))} disabled={isReadOnly || statusesLoading}>
                    <SelectTrigger id="status" className="h-8 text-sm"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {statusesData?.results.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>{status.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            )}

            {/* Priority */}
            {isFieldVisible('priority') && (
              <div className="space-y-1">
                <Label htmlFor="priority" className="text-xs text-muted-foreground font-normal">Priority</Label>
                <Controller name="priority" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger id="priority" className="h-8 text-sm"><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            )}

            {/* Lead Score */}
            {isFieldVisible('lead_score') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lead_score" className="text-xs text-muted-foreground font-normal">Score</Label>
                  <Controller name="lead_score" control={control} render={({ field }) => {
                    const s = field.value || 0;
                    const color = s <= 20 ? 'bg-slate-100 text-slate-600' : s <= 40 ? 'bg-blue-50 text-blue-600' : s <= 60 ? 'bg-yellow-50 text-yellow-700' : s <= 80 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600';
                    const label = s <= 20 ? 'Cold' : s <= 40 ? 'Low' : s <= 60 ? 'Warm' : s <= 80 ? 'Hot' : 'Very Hot';
                    const emoji = s <= 20 ? '😴' : s <= 40 ? '😐' : s <= 60 ? '🙂' : s <= 80 ? '😊' : '🔥';
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
                        {emoji} {s} · {label}
                      </span>
                    );
                  }} />
                </div>
                <Controller name="lead_score" control={control} render={({ field }) => {
                  const s = field.value || 0;
                  const trackColor = s <= 20 ? '#94a3b8' : s <= 40 ? '#60a5fa' : s <= 60 ? '#facc15' : s <= 80 ? '#fb923c' : '#ef4444';
                  const trackColorLight = s <= 20 ? '#e2e8f0' : s <= 40 ? '#dbeafe' : s <= 60 ? '#fef9c3' : s <= 80 ? '#ffedd5' : '#fee2e2';
                  const emoji = s <= 20 ? '😴' : s <= 40 ? '😐' : s <= 60 ? '🙂' : s <= 80 ? '😊' : '🔥';
                  return (
                    <div className="relative pt-1 pb-1">
                      {/* Custom track */}
                      <div className="relative h-3 rounded-full" style={{ background: trackColorLight }}>
                        {/* Colored fill */}
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-100"
                          style={{ width: `${s}%`, background: `linear-gradient(to right, ${trackColor}88, ${trackColor})` }}
                        />
                        {/* Thumb circle */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center border-2 pointer-events-none transition-all duration-100 text-[13px] select-none"
                          style={{
                            left: `${s}%`,
                            borderColor: trackColor,
                            boxShadow: `0 0 0 3px ${trackColor}30, 0 2px 6px rgba(0,0,0,0.15)`,
                          }}
                        >
                          {emoji}
                        </div>
                      </div>
                      {/* Invisible native range on top for interaction */}
                      <input
                        id="lead_score"
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={s}
                        disabled={isReadOnly}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        style={{ top: 0, left: 0 }}
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-0.5">
                        <span>0</span>
                        <span>25</span>
                        <span>50</span>
                        <span>75</span>
                        <span>100</span>
                      </div>
                    </div>
                  );
                }} />
              </div>
            )}

            {/* Broker */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-normal">Broker (optional)</Label>
              <Controller name="broker_id" control={control} render={({ field }) => {
                const brokers = brokersData?.results || [];
                const selectedBroker = brokers.find(b => b.id === field.value);
                return (
                  <Popover open={brokerPopoverOpen} onOpenChange={setBrokerPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setBrokerPopoverOpen(true)}
                        className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 text-left"
                      >
                        <span className={selectedBroker ? 'text-foreground' : 'text-muted-foreground'}>
                          {selectedBroker ? selectedBroker.name : 'Select broker...'}
                        </span>
                        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search brokers..."
                          value={brokerSearch}
                          onChange={(e) => setBrokerSearch(e.target.value)}
                          className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {/* None option */}
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-muted-foreground"
                          onClick={() => { field.onChange(null); setBrokerPopoverOpen(false); setBrokerSearch(''); }}
                        >
                          <Check className={`h-3.5 w-3.5 ${field.value == null ? 'opacity-100' : 'opacity-0'}`} />
                          <span>None</span>
                        </button>
                        {brokersLoading ? (
                          <div className="px-3 py-4 text-xs text-muted-foreground text-center">Loading...</div>
                        ) : brokers.length === 0 ? (
                          <div className="px-3 py-4 text-xs text-muted-foreground text-center">No brokers found</div>
                        ) : (
                          brokers.map((broker) => (
                            <button
                              key={broker.id}
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                              onClick={() => { field.onChange(broker.id); setBrokerPopoverOpen(false); setBrokerSearch(''); }}
                            >
                              <Check className={`h-3.5 w-3.5 shrink-0 ${field.value === broker.id ? 'opacity-100 text-primary' : 'opacity-0'}`} />
                              <div className="text-left">
                                <p className="font-medium leading-none">{broker.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{broker.phone}{broker.company_name ? ` · ${broker.company_name}` : ''}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }} />
            </div>

            {/* Assigned To */}
            {isFieldVisible('assigned_to') && (
              <div className="space-y-1">
                <Label htmlFor="assigned_to" className="text-xs text-muted-foreground font-normal">Assigned To</Label>
                <Controller name="assigned_to" control={control} render={({ field }) => (
                  <Select value={field.value || 'unassigned'} onValueChange={(value) => field.onChange(value === 'unassigned' ? '' : value)} disabled={isReadOnly || usersLoading}>
                    <SelectTrigger id="assigned_to" className="h-8 text-sm"><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No assignment</SelectItem>
                      {usersData?.results?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>{user.first_name} {user.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            )}

            {/* Value Amount */}
            {isFieldVisible('value_amount') && (
              <div className="space-y-1">
                <Label htmlFor="value_amount" className="text-xs text-muted-foreground font-normal">Deal Value</Label>
                <Controller name="value_amount" control={control} render={({ field }) => (
                  <Input {...field} id="value_amount" type="number" step="0.01" placeholder="10000.00" disabled={isReadOnly} className="h-8 text-sm" />
                )} />
              </div>
            )}

            {/* Currency */}
            {isFieldVisible('value_currency') && (
              <div className="space-y-1">
                <Label htmlFor="value_currency" className="text-xs text-muted-foreground font-normal">Currency</Label>
                <Controller name="value_currency" control={control} render={({ field }) => (
                  <Input {...field} id="value_currency" placeholder="USD" maxLength={3} disabled={isReadOnly} className="h-8 text-sm" />
                )} />
              </div>
            )}

            {/* Source */}
            {isFieldVisible('source') && (
              <div className="space-y-1">
                <Label htmlFor="source" className="text-xs text-muted-foreground font-normal">Source</Label>
                <Controller name="source" control={control} render={({ field }) => (
                  <Input {...field} id="source" placeholder="Website, Referral, etc." disabled={isReadOnly} className="h-8 text-sm" />
                )} />
              </div>
            )}

            {/* Next Follow-up - spans full row on lg */}
            {isFieldVisible('next_follow_up_at') && (
              <div className="space-y-1 lg:col-span-2">
                <Label htmlFor="next_follow_up_at" className="text-xs text-muted-foreground font-normal">Follow-up</Label>
                <Controller name="next_follow_up_at" control={control} render={({ field }) => {
                  const selectedDate = field.value ? new Date(field.value) : undefined;
                  const selectedTime = selectedDate ? `${selectedDate.getHours().toString().padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}` : '';

                  const handleDateSelect = (date: Date | undefined) => {
                    if (!date) { field.onChange(''); return; }
                    const hours = selectedDate?.getHours() || 10;
                    const minutes = selectedDate?.getMinutes() || 0;
                    const newDate = new Date(date);
                    newDate.setHours(hours, minutes, 0, 0);
                    field.onChange(newDate.toISOString());
                  };

                  const handleTimeSelect = (time: string) => {
                    if (!selectedDate) {
                      const today = new Date();
                      const [hours, minutes] = time.split(':').map(Number);
                      today.setHours(hours, minutes, 0, 0);
                      field.onChange(today.toISOString());
                      return;
                    }
                    const [hours, minutes] = time.split(':').map(Number);
                    const newDate = new Date(selectedDate);
                    newDate.setHours(hours, minutes, 0, 0);
                    field.onChange(newDate.toISOString());
                  };

                  return (
                    <div className="flex gap-2 flex-wrap">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('flex-1 justify-start text-left font-normal h-8 text-sm', !field.value && 'text-muted-foreground')} disabled={isReadOnly}>
                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                            {field.value ? format(new Date(field.value), 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
                        </PopoverContent>
                      </Popover>
                      {field.value && (
                        <Select value={selectedTime} onValueChange={handleTimeSelect} disabled={isReadOnly}>
                          <SelectTrigger className="w-[110px] h-8 text-sm"><SelectValue placeholder="Time" /></SelectTrigger>
                          <SelectContent>
                            {[
                              { value: '09:00', label: '9:00 AM' }, { value: '09:30', label: '9:30 AM' },
                              { value: '10:00', label: '10:00 AM' }, { value: '10:30', label: '10:30 AM' },
                              { value: '11:00', label: '11:00 AM' }, { value: '11:30', label: '11:30 AM' },
                              { value: '12:00', label: '12:00 PM' }, { value: '12:30', label: '12:30 PM' },
                              { value: '13:00', label: '1:00 PM' }, { value: '13:30', label: '1:30 PM' },
                              { value: '14:00', label: '2:00 PM' }, { value: '14:30', label: '2:30 PM' },
                              { value: '15:00', label: '3:00 PM' }, { value: '15:30', label: '3:30 PM' },
                              { value: '16:00', label: '4:00 PM' }, { value: '16:30', label: '4:30 PM' },
                              { value: '17:00', label: '5:00 PM' }, { value: '17:30', label: '5:30 PM' },
                              { value: '18:00', label: '6:00 PM' }, { value: '18:30', label: '6:30 PM' },
                              { value: '19:00', label: '7:00 PM' },
                            ].map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {field.value && !isReadOnly && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => field.onChange('')} type="button">
                          <span className="sr-only">Clear</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </Button>
                      )}
                    </div>
                  );
                }} />
              </div>
            )}
          </div>

          {/* Notes - full width */}
          {isFieldVisible('notes') && (
            <div className="mt-3 space-y-1">
              <Label htmlFor="notes" className="text-xs text-muted-foreground font-normal">Notes</Label>
              <Controller name="notes" control={control} render={({ field }) => (
                <Textarea {...field} id="notes" placeholder="Add notes..." rows={2} disabled={isReadOnly} className="text-sm" />
              )} />
            </div>
          )}
        </div>

        <div className="border-t border-border/50" />

        {/* Address Section - Collapsible */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Address Information</h3>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
              {isFieldVisible('address_line1') && (
                <div className="space-y-1 lg:col-span-2">
                  <Label htmlFor="address_line1" className="text-xs text-muted-foreground font-normal">Address 1</Label>
                  <Controller name="address_line1" control={control} render={({ field }) => (
                    <Input {...field} id="address_line1" placeholder="123 Main St" disabled={isReadOnly} className="h-8 text-sm" />
                  )} />
                </div>
              )}
              {isFieldVisible('address_line2') && (
                <div className="space-y-1">
                  <Label htmlFor="address_line2" className="text-xs text-muted-foreground font-normal">Address 2</Label>
                  <Controller name="address_line2" control={control} render={({ field }) => (
                    <Input {...field} id="address_line2" placeholder="Apt 4B" disabled={isReadOnly} className="h-8 text-sm" />
                  )} />
                </div>
              )}
              {isFieldVisible('city') && (
                <div className="space-y-1">
                  <Label htmlFor="city" className="text-xs text-muted-foreground font-normal">City</Label>
                  <Controller name="city" control={control} render={({ field }) => (
                    <Input {...field} id="city" placeholder="New York" disabled={isReadOnly} className="h-8 text-sm" />
                  )} />
                </div>
              )}
              {isFieldVisible('state') && (
                <div className="space-y-1">
                  <Label htmlFor="state" className="text-xs text-muted-foreground font-normal">State</Label>
                  <Controller name="state" control={control} render={({ field }) => (
                    <Input {...field} id="state" placeholder="NY" disabled={isReadOnly} className="h-8 text-sm" />
                  )} />
                </div>
              )}
              {isFieldVisible('country') && (
                <div className="space-y-1">
                  <Label htmlFor="country" className="text-xs text-muted-foreground font-normal">Country</Label>
                  <Controller name="country" control={control} render={({ field }) => (
                    <Input {...field} id="country" placeholder="USA" disabled={isReadOnly} className="h-8 text-sm" />
                  )} />
                </div>
              )}
              {isFieldVisible('postal_code') && (
                <div className="space-y-1">
                  <Label htmlFor="postal_code" className="text-xs text-muted-foreground font-normal">Postal Code</Label>
                  <Controller name="postal_code" control={control} render={({ field }) => (
                    <Input {...field} id="postal_code" placeholder="10001" disabled={isReadOnly} className="h-8 text-sm" />
                  )} />
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Custom Fields Section - Collapsible */}
        {customFields.length > 0 && (
          <>
            <div className="border-t border-border/50" />
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Custom Fields</h3>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                  {customFields.map((field) => (
                    <div key={field.id}>
                      <DynamicFieldRenderer field={field} control={control} fieldName={`custom_${field.field_name}` as any} disabled={isReadOnly} error={errors[`custom_${field.field_name}` as keyof typeof errors]?.message as string} />
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </div>
    );
  }
);

LeadDetailsForm.displayName = 'LeadDetailsForm';

export default LeadDetailsForm;
