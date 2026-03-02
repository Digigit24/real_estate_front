import { useState } from 'react';
import { SideDrawer } from '@/components/SideDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Unit, UnitStatusEnum, UNIT_STATUS_COLORS, UNIT_STATUS_LABELS } from '@/types/inventoryTypes';
import { Home, Ruler, Compass, IndianRupee, User, Pencil, Lock, Unlock } from 'lucide-react';

interface UnitDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: Unit | null;
  onEdit: (unit: Unit) => void;
  onReserve: (unitId: number, leadId: number) => Promise<void>;
  onRelease: (unitId: number) => Promise<void>;
  onUpdateStatus: (unitId: number, status: UnitStatusEnum) => Promise<void>;
  isSubmitting?: boolean;
}

export function UnitDetailDrawer({
  open,
  onOpenChange,
  unit,
  onEdit,
  onReserve,
  onRelease,
  onUpdateStatus,
  isSubmitting = false,
}: UnitDetailDrawerProps) {
  const [showReserveDialog, setShowReserveDialog] = useState(false);
  const [leadIdInput, setLeadIdInput] = useState('');
  const [statusToUpdate, setStatusToUpdate] = useState<UnitStatusEnum | ''>('');

  if (!unit) return null;

  const handleReserve = async () => {
    const leadId = parseInt(leadIdInput);
    if (!isNaN(leadId)) {
      await onReserve(unit.id, leadId);
      setShowReserveDialog(false);
      setLeadIdInput('');
    }
  };

  const handleStatusUpdate = async () => {
    if (statusToUpdate) {
      await onUpdateStatus(unit.id, statusToUpdate);
      setStatusToUpdate('');
    }
  };

  return (
    <>
      <SideDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={unit.unit_number}
        description={`${unit.bhk_type} | Floor ${unit.floor_number}`}
        mode="view"
        size="md"
        headerActions={[
          {
            icon: Pencil,
            onClick: () => onEdit(unit),
            label: 'Edit unit',
          },
        ]}
      >
        <div className="space-y-5">
          {/* Status */}
          <div className="flex items-center gap-3">
            <Badge
              className="text-white text-xs"
              style={{ backgroundColor: UNIT_STATUS_COLORS[unit.status] }}
            >
              {UNIT_STATUS_LABELS[unit.status]}
            </Badge>
            {unit.reserved_for_lead_name && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                Reserved for: {unit.reserved_for_lead_name}
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow icon={Home} label="BHK Type" value={unit.bhk_type} />
            <InfoRow icon={Ruler} label="Carpet Area" value={unit.carpet_area ? `${unit.carpet_area} sq.ft` : '—'} />
            <InfoRow icon={Ruler} label="Built-up Area" value={unit.built_up_area ? `${unit.built_up_area} sq.ft` : '—'} />
            <InfoRow icon={Ruler} label="Super Built-up" value={unit.super_built_up_area ? `${unit.super_built_up_area} sq.ft` : '—'} />
            <InfoRow icon={Compass} label="Facing" value={unit.facing?.replace(/_/g, ' ') || '—'} />
            <InfoRow icon={Home} label="Floor" value={`${unit.floor_number}`} />
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Pricing Breakdown</h4>
            <div className="space-y-2 text-sm">
              <PriceRow label="Base Price" value={unit.base_price} />
              <PriceRow label="Floor Rise Premium" value={unit.floor_rise_premium} />
              <PriceRow label="Facing Premium" value={unit.facing_premium} />
              <PriceRow label="Parking Charges" value={unit.parking_charges} />
              <PriceRow label="Other Charges" value={unit.other_charges} />
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Price</span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {formatPrice(unit.total_price || '0')}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Actions</h4>

            {unit.status === UnitStatusEnum.AVAILABLE && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowReserveDialog(true)}
                disabled={isSubmitting}
              >
                <Lock className="h-4 w-4 mr-2" />
                Reserve for Lead
              </Button>
            )}

            {unit.status === UnitStatusEnum.RESERVED && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onRelease(unit.id)}
                disabled={isSubmitting}
              >
                <Unlock className="h-4 w-4 mr-2" />
                Release Reservation
              </Button>
            )}

            {/* Admin Status Override */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Force Update Status</Label>
              <div className="flex gap-2">
                <Select value={statusToUpdate} onValueChange={(v) => setStatusToUpdate(v as UnitStatusEnum)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UnitStatusEnum).map((s) => (
                      <SelectItem key={s} value={s}>{UNIT_STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8"
                  disabled={!statusToUpdate || isSubmitting}
                  onClick={handleStatusUpdate}
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SideDrawer>

      {/* Reserve Dialog */}
      <AlertDialog open={showReserveDialog} onOpenChange={setShowReserveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reserve Unit {unit.unit_number}</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the Lead ID to reserve this unit for.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="lead_id">Lead ID</Label>
            <Input
              id="lead_id"
              type="number"
              value={leadIdInput}
              onChange={(e) => setLeadIdInput(e.target.value)}
              placeholder="Enter lead ID"
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReserve} disabled={!leadIdInput}>
              Reserve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value?: string }) {
  const amount = value ? formatPrice(value) : '0';
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{amount}</span>
    </div>
  );
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return num.toLocaleString('en-IN');
}
