import { SideDrawer } from '@/components/SideDrawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { CreateProjectPayload, Project } from '@/types/inventoryTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  rera_number: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  google_maps_url: z.string().url().optional().or(z.literal('')),
  total_units: z.coerce.number().min(0).optional(),
  launch_date: z.string().optional(),
  possession_date: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  banner_url: z.string().url().optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSubmit: (data: CreateProjectPayload) => Promise<void>;
  isSubmitting?: boolean;
}

export function ProjectFormDrawer({
  open,
  onOpenChange,
  project,
  onSubmit,
  isSubmitting = false,
}: ProjectFormDrawerProps) {
  const isEditing = !!project;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      rera_number: '',
      description: '',
      location: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      google_maps_url: '',
      total_units: 0,
      launch_date: '',
      possession_date: '',
      logo_url: '',
      banner_url: '',
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name || '',
        rera_number: project.rera_number || '',
        description: project.description || '',
        location: project.location || '',
        address: project.address || '',
        city: project.city || '',
        state: project.state || '',
        pincode: project.pincode || '',
        google_maps_url: project.google_maps_url || '',
        total_units: project.total_units || 0,
        launch_date: project.launch_date || '',
        possession_date: project.possession_date || '',
        logo_url: project.logo_url || '',
        banner_url: project.banner_url || '',
      });
    } else {
      reset({
        name: '',
        rera_number: '',
        description: '',
        location: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        google_maps_url: '',
        total_units: 0,
        launch_date: '',
        possession_date: '',
        logo_url: '',
        banner_url: '',
      });
    }
  }, [project, reset]);

  const onFormSubmit = async (data: ProjectFormData) => {
    const payload: CreateProjectPayload = {
      ...data,
      name: data.name,
      google_maps_url: data.google_maps_url || undefined,
      logo_url: data.logo_url || undefined,
      banner_url: data.banner_url || undefined,
    };
    await onSubmit(payload);
  };

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Project' : 'New Project'}
      mode={isEditing ? 'edit' : 'create'}
      size="lg"
      footerButtons={[
        {
          label: 'Cancel',
          variant: 'outline',
          onClick: () => onOpenChange(false),
        },
        {
          label: isEditing ? 'Save Changes' : 'Create Project',
          onClick: handleSubmit(onFormSubmit),
          loading: isSubmitting,
          disabled: isSubmitting,
        },
      ]}
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>

          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input id="name" {...register('name')} placeholder="e.g. Sunrise Heights" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rera_number">RERA Number</Label>
            <Input id="rera_number" {...register('rera_number')} placeholder="e.g. MH/01/2025/12345" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} placeholder="Describe the project..." rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="total_units">Total Units</Label>
              <Input id="total_units" type="number" {...register('total_units')} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Location */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Location</h4>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register('location')} placeholder="e.g. Wakad, Pune" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Full Address</Label>
            <Input id="address" {...register('address')} placeholder="e.g. Survey No. 123, Wakad" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} placeholder="Pune" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} placeholder="Maharashtra" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" {...register('pincode')} placeholder="411057" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="google_maps_url">Google Maps URL</Label>
            <Input id="google_maps_url" {...register('google_maps_url')} placeholder="https://maps.google.com/..." />
          </div>
        </div>

        <Separator />

        {/* Dates */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="launch_date">Launch Date</Label>
              <Input id="launch_date" type="date" {...register('launch_date')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="possession_date">Possession Date</Label>
              <Input id="possession_date" type="date" {...register('possession_date')} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Media */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Media</h4>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input id="logo_url" {...register('logo_url')} placeholder="https://cdn.example.com/logo.png" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner_url">Banner URL</Label>
            <Input id="banner_url" {...register('banner_url')} placeholder="https://cdn.example.com/banner.jpg" />
          </div>
        </div>
      </form>
    </SideDrawer>
  );
}
