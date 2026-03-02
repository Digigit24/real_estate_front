import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SideDrawer } from '@/components/SideDrawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tower, CreateTowerPayload } from '@/types/inventoryTypes';

const towerSchema = z.object({
  name: z.string().min(1, 'Tower name is required'),
  total_floors: z.coerce.number().min(1, 'At least 1 floor required'),
  units_per_floor: z.coerce.number().min(1, 'At least 1 unit per floor required'),
  description: z.string().optional(),
});

type TowerFormData = z.infer<typeof towerSchema>;

interface TowerFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  tower?: Tower | null;
  onSubmit: (data: CreateTowerPayload) => Promise<void>;
  isSubmitting?: boolean;
}

export function TowerFormDrawer({
  open,
  onOpenChange,
  projectId,
  tower,
  onSubmit,
  isSubmitting = false,
}: TowerFormDrawerProps) {
  const isEditing = !!tower;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TowerFormData>({
    resolver: zodResolver(towerSchema),
    defaultValues: {
      name: '',
      total_floors: 10,
      units_per_floor: 4,
      description: '',
    },
  });

  useEffect(() => {
    if (tower) {
      reset({
        name: tower.name || '',
        total_floors: tower.total_floors || 10,
        units_per_floor: tower.units_per_floor || 4,
        description: tower.description || '',
      });
    } else {
      reset({ name: '', total_floors: 10, units_per_floor: 4, description: '' });
    }
  }, [tower, reset]);

  const onFormSubmit = async (data: TowerFormData) => {
    const payload: CreateTowerPayload = {
      project: projectId,
      ...data,
    };
    await onSubmit(payload);
  };

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Tower' : 'New Tower'}
      mode={isEditing ? 'edit' : 'create'}
      size="md"
      footerButtons={[
        {
          label: 'Cancel',
          variant: 'outline',
          onClick: () => onOpenChange(false),
        },
        {
          label: isEditing ? 'Save Changes' : 'Create Tower',
          onClick: handleSubmit(onFormSubmit),
          loading: isSubmitting,
          disabled: isSubmitting,
        },
      ]}
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="name">Tower Name *</Label>
          <Input id="name" {...register('name')} placeholder="e.g. Tower A" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="total_floors">Total Floors *</Label>
            <Input id="total_floors" type="number" {...register('total_floors')} />
            {errors.total_floors && <p className="text-xs text-destructive">{errors.total_floors.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="units_per_floor">Units Per Floor *</Label>
            <Input id="units_per_floor" type="number" {...register('units_per_floor')} />
            {errors.units_per_floor && <p className="text-xs text-destructive">{errors.units_per_floor.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} placeholder="e.g. East-facing tower" rows={3} />
        </div>
      </form>
    </SideDrawer>
  );
}
