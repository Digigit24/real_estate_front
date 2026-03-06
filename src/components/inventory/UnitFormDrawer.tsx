import { SideDrawer } from '@/components/SideDrawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BHK_TYPE_OPTIONS, CreateUnitPayload, FACING_OPTIONS, Unit } from '@/types/inventoryTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const unitSchema = z.object({
  unit_number: z.string().min(1, 'Unit number is required'),
  floor_number: z.coerce.number().min(0, 'Floor number is required'),
  bhk_type: z.string().min(1, 'BHK type is required'),
  carpet_area: z.string().optional(),
  built_up_area: z.string().optional(),
  super_built_up_area: z.string().optional(),
  facing: z.string().optional(),
  base_price: z.string().optional(),
  floor_rise_premium: z.string().optional(),
  facing_premium: z.string().optional(),
  parking_charges: z.string().optional(),
  other_charges: z.string().optional(),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface UnitFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  towerId: number;
  unit?: Unit | null;
  onSubmit: (data: CreateUnitPayload) => Promise<void>;
  isSubmitting?: boolean;
}

export function UnitFormDrawer({
  open,
  onOpenChange,
  towerId,
  unit,
  onSubmit,
  isSubmitting = false,
}: UnitFormDrawerProps) {
  const isEditing = !!unit;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
  });

  const bhkType = watch('bhk_type');
  const facing = watch('facing');

  useEffect(() => {
    if (unit) {
      reset({
        unit_number: unit.unit_number || '',
        floor_number: unit.floor_number || 0,
        bhk_type: unit.bhk_type || '',
        carpet_area: unit.carpet_area || '',
        built_up_area: unit.built_up_area || '',
        super_built_up_area: unit.super_built_up_area || '',
        facing: unit.facing || '',
        base_price: unit.base_price || '',
        floor_rise_premium: unit.floor_rise_premium || '',
        facing_premium: unit.facing_premium || '',
        parking_charges: unit.parking_charges || '',
        other_charges: unit.other_charges || '',
      });
    } else {
      reset({
        unit_number: '',
        floor_number: 0,
        bhk_type: '',
        carpet_area: '',
        built_up_area: '',
        super_built_up_area: '',
        facing: '',
        base_price: '',
        floor_rise_premium: '',
        facing_premium: '',
        parking_charges: '',
        other_charges: '',
      });
    }
  }, [unit, reset]);

  const onFormSubmit = async (data: UnitFormData) => {
    const payload: CreateUnitPayload = {
      tower: towerId,
      ...data,
    };
    await onSubmit(payload);
  };

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Unit' : 'New Unit'}
      mode={isEditing ? 'edit' : 'create'}
      size="lg"
      footerButtons={[
        {
          label: 'Cancel',
          variant: 'outline',
          onClick: () => onOpenChange(false),
        },
        {
          label: isEditing ? 'Save Changes' : 'Create Unit',
          onClick: handleSubmit(onFormSubmit),
          loading: isSubmitting,
          disabled: isSubmitting,
        },
      ]}
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        {/* Unit Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Unit Information</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="unit_number">Unit Number *</Label>
              <Input id="unit_number" {...register('unit_number')} placeholder="e.g. A-0501" />
              {errors.unit_number && <p className="text-xs text-destructive">{errors.unit_number.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor_number">Floor Number *</Label>
              <Input id="floor_number" type="number" {...register('floor_number')} />
              {errors.floor_number && <p className="text-xs text-destructive">{errors.floor_number.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>BHK Type *</Label>
              <Select value={bhkType} onValueChange={(v) => setValue('bhk_type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {BHK_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bhk_type && <p className="text-xs text-destructive">{errors.bhk_type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Facing</Label>
              <Select value={facing} onValueChange={(v) => setValue('facing', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select facing" />
                </SelectTrigger>
                <SelectContent>
                  {FACING_OPTIONS.map((f) => (
                    <SelectItem key={f} value={f}>{f.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Area */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Area (sq.ft)</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="carpet_area">Carpet</Label>
              <Input id="carpet_area" {...register('carpet_area')} placeholder="850" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="built_up_area">Built-up</Label>
              <Input id="built_up_area" {...register('built_up_area')} placeholder="1050" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="super_built_up_area">Super Built-up</Label>
              <Input id="super_built_up_area" {...register('super_built_up_area')} placeholder="1200" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Pricing</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price</Label>
              <Input id="base_price" {...register('base_price')} placeholder="8500000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor_rise_premium">Floor Rise Premium</Label>
              <Input id="floor_rise_premium" {...register('floor_rise_premium')} placeholder="50000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facing_premium">Facing Premium</Label>
              <Input id="facing_premium" {...register('facing_premium')} placeholder="100000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parking_charges">Parking Charges</Label>
              <Input id="parking_charges" {...register('parking_charges')} placeholder="200000" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="other_charges">Other Charges</Label>
              <Input id="other_charges" {...register('other_charges')} placeholder="50000" />
            </div>
          </div>
        </div>
      </form>
    </SideDrawer>
  );
}
