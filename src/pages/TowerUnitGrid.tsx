// src/pages/TowerUnitGrid.tsx
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventory } from '@/hooks/useInventory';
import { UnitGrid } from '@/components/inventory/UnitGrid';
import { UnitDetailDrawer } from '@/components/inventory/UnitDetailDrawer';
import { UnitFormDrawer } from '@/components/inventory/UnitFormDrawer';
import { PriceCalculator } from '@/components/inventory/PriceCalculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, RefreshCw, Building, Home } from 'lucide-react';
import { toast } from 'sonner';
import type {
  Unit,
  UnitGridUnit,
  CreateUnitPayload,
  UnitStatusEnum,
  PriceCalculatorPayload,
} from '@/types/inventoryTypes';

export function TowerUnitGrid() {
  const { id: projectId, towerId } = useParams<{ id: string; towerId: string }>();
  const navigate = useNavigate();
  const towerIdNum = towerId ? parseInt(towerId) : null;

  const {
    useTower,
    useTowerUnitGrid,
    useUnit,
    createUnit,
    updateUnit,
    reserveUnit,
    releaseUnit,
    updateUnitStatus,
    calculatePrice,
    isLoading: isMutating,
  } = useInventory();

  const { data: tower, isLoading: towerLoading } = useTower(towerIdNum);
  const { data: gridData, isLoading: gridLoading, mutate: refreshGrid } = useTowerUnitGrid(towerIdNum);

  // Unit detail drawer
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const { data: selectedUnit } = useUnit(selectedUnitId);

  // Unit form drawer
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const handleUnitClick = useCallback((unit: UnitGridUnit) => {
    setSelectedUnitId(unit.id);
    setDetailDrawerOpen(true);
  }, []);

  const handleCreateUnit = useCallback(() => {
    setEditingUnit(null);
    setFormDrawerOpen(true);
  }, []);

  const handleEditUnit = useCallback((unit: Unit) => {
    setEditingUnit(unit);
    setDetailDrawerOpen(false);
    setFormDrawerOpen(true);
  }, []);

  const handleUnitSubmit = useCallback(async (data: CreateUnitPayload) => {
    try {
      if (editingUnit) {
        await updateUnit(editingUnit.id, data);
        toast.success('Unit updated');
      } else {
        await createUnit(data);
        toast.success('Unit created');
      }
      setFormDrawerOpen(false);
      refreshGrid();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save unit');
    }
  }, [editingUnit, createUnit, updateUnit, refreshGrid]);

  const handleReserve = useCallback(async (unitId: number, leadId: number) => {
    try {
      await reserveUnit(unitId, { lead_id: leadId });
      toast.success('Unit reserved');
      refreshGrid();
      setDetailDrawerOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reserve unit');
    }
  }, [reserveUnit, refreshGrid]);

  const handleRelease = useCallback(async (unitId: number) => {
    try {
      await releaseUnit(unitId);
      toast.success('Unit released');
      refreshGrid();
      setDetailDrawerOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to release unit');
    }
  }, [releaseUnit, refreshGrid]);

  const handleUpdateStatus = useCallback(async (unitId: number, status: UnitStatusEnum) => {
    try {
      await updateUnitStatus(unitId, { status });
      toast.success('Status updated');
      refreshGrid();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  }, [updateUnitStatus, refreshGrid]);

  const handleCalculatePrice = useCallback(async (payload: PriceCalculatorPayload) => {
    try {
      const result = await calculatePrice(payload);
      toast.success(`Server total: ${parseFloat(result.total_price).toLocaleString('en-IN')}`);
    } catch (err: any) {
      toast.error(err.message || 'Calculation failed');
    }
  }, [calculatePrice]);

  if (towerLoading || gridLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(`/inventory/projects/${projectId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <h1 className="text-lg font-semibold">{tower?.name || 'Tower'}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {tower?.total_floors} floors | {tower?.units_per_floor} units per floor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refreshGrid()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleCreateUnit}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Unit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Unit Grid */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Home className="h-4 w-4" />
                Floor Plan
                {gridData && (
                  <Badge variant="secondary" className="text-[10px] ml-2">
                    {gridData.grid.reduce((sum, f) => sum + f.units.length, 0)} units
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gridData ? (
                <UnitGrid grid={gridData.grid} onUnitClick={handleUnitClick} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Home className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No units found. Add units to see the floor plan.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Price Calculator */}
        <div className="space-y-4">
          <PriceCalculator onCalculate={handleCalculatePrice} isLoading={isMutating} />
        </div>
      </div>

      {/* Unit Detail Drawer */}
      <UnitDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        unit={selectedUnit || null}
        onEdit={handleEditUnit}
        onReserve={handleReserve}
        onRelease={handleRelease}
        onUpdateStatus={handleUpdateStatus}
        isSubmitting={isMutating}
      />

      {/* Unit Form Drawer */}
      {towerIdNum && (
        <UnitFormDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          towerId={towerIdNum}
          unit={editingUnit}
          onSubmit={handleUnitSubmit}
          isSubmitting={isMutating}
        />
      )}
    </div>
  );
}
