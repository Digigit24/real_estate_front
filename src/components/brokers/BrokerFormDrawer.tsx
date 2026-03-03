import { SideDrawer, type DrawerActionButton } from '@/components/SideDrawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import type {
  Broker,
  CreateBrokerPayload,
} from '@/types/brokerTypes';
import { BROKER_STATUS_LABELS, BrokerStatusEnum } from '@/types/brokerTypes';
import { useCallback, useEffect, useState } from 'react';

interface BrokerFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  broker: Broker | null;
  onSubmit: (data: CreateBrokerPayload) => Promise<void>;
  isSubmitting?: boolean;
}

const defaultFormData: CreateBrokerPayload = {
  name: '',
  phone: '',
  email: '',
  company_name: '',
  rera_number: '',
  commission_rate: '',
  city: '',
  status: BrokerStatusEnum.PENDING,
};

export function BrokerFormDrawer({
  open,
  onOpenChange,
  broker,
  onSubmit,
  isSubmitting = false,
}: BrokerFormDrawerProps) {
  const { user } = useAuth();
  const isEditing = !!broker;

  const [formData, setFormData] = useState<CreateBrokerPayload>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when broker changes
  useEffect(() => {
    if (broker) {
      setFormData({
        name: broker.name || '',
        phone: broker.phone || '',
        email: broker.email || '',
        company_name: broker.company_name || '',
        rera_number: broker.rera_number || '',
        commission_rate: broker.commission_rate || '',
        city: broker.city || '',
        status: broker.status || BrokerStatusEnum.PENDING,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [broker, open]);

  const handleChange = useCallback(
    (field: keyof CreateBrokerPayload) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      },
    []
  );

  const handleStatusChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, status: value as BrokerStatusEnum }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.commission_rate.trim()) {
      newErrors.commission_rate = 'Commission rate is required';
    } else if (isNaN(Number(formData.commission_rate)) || Number(formData.commission_rate) < 0) {
      newErrors.commission_rate = 'Commission rate must be a valid positive number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    const payload: CreateBrokerPayload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      commission_rate: formData.commission_rate.trim(),
      ...(formData.email && { email: formData.email.trim() }),
      ...(formData.company_name && { company_name: formData.company_name.trim() }),
      ...(formData.rera_number && { rera_number: formData.rera_number.trim() }),
      ...(formData.city && { city: formData.city.trim() }),
      ...(formData.status && { status: formData.status }),
      ...(user?.id && !isEditing ? { owner_user_id: user.id } : {}),
    };

    await onSubmit(payload);
  }, [formData, validate, onSubmit, user?.id, isEditing]);

  const drawerTitle = isEditing ? 'Edit Broker' : 'Add Broker';
  const drawerDescription = isEditing
    ? 'Update broker details and commission configuration.'
    : 'Add a new channel partner or broker to your network.';

  const footerButtons: DrawerActionButton[] = [
    {
      label: 'Cancel',
      onClick: () => onOpenChange(false),
      variant: 'outline',
      disabled: isSubmitting,
    },
    {
      label: isEditing ? 'Save Changes' : 'Add Broker',
      onClick: handleSubmit,
      variant: 'default',
      loading: isSubmitting,
    },
  ];

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={drawerTitle}
      description={drawerDescription}
      mode={isEditing ? 'edit' : 'create'}
      size="md"
      footerButtons={footerButtons}
      footerAlignment="right"
      resizable={true}
      storageKey="broker-drawer-width"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>

          <div className="space-y-2">
            <Label htmlFor="broker-name">Name *</Label>
            <Input
              id="broker-name"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="e.g. John Doe"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="broker-phone">Phone *</Label>
            <Input
              id="broker-phone"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="e.g. +91 9876543210"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="broker-email">Email</Label>
            <Input
              id="broker-email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange('email')}
              placeholder="e.g. john@example.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="broker-company">Company Name</Label>
            <Input
              id="broker-company"
              value={formData.company_name || ''}
              onChange={handleChange('company_name')}
              placeholder="e.g. ABC Realtors"
            />
          </div>
        </div>

        {/* Commission & Registration */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Commission & Registration</h4>

          <div className="space-y-2">
            <Label htmlFor="broker-rera">RERA Number</Label>
            <Input
              id="broker-rera"
              value={formData.rera_number || ''}
              onChange={handleChange('rera_number')}
              placeholder="e.g. MH/01/2025/12345"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="broker-commission">Commission Rate (%) *</Label>
            <Input
              id="broker-commission"
              value={formData.commission_rate}
              onChange={handleChange('commission_rate')}
              placeholder="e.g. 2.5"
              className={errors.commission_rate ? 'border-destructive' : ''}
            />
            {errors.commission_rate && (
              <p className="text-xs text-destructive">{errors.commission_rate}</p>
            )}
          </div>
        </div>

        {/* Location & Status */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Location & Status</h4>

          <div className="space-y-2">
            <Label htmlFor="broker-city">City</Label>
            <Input
              id="broker-city"
              value={formData.city || ''}
              onChange={handleChange('city')}
              placeholder="e.g. Mumbai"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="broker-status">Status</Label>
            <Select
              value={formData.status || BrokerStatusEnum.PENDING}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="broker-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BrokerStatusEnum).map((status) => (
                  <SelectItem key={status} value={status}>
                    {BROKER_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
}
