import { UnitGridFloor, UnitGridUnit, UnitStatusEnum, UNIT_STATUS_COLORS, UNIT_STATUS_LABELS } from '@/types/inventoryTypes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface UnitGridProps {
  grid: UnitGridFloor[];
  onUnitClick: (unit: UnitGridUnit) => void;
}

export function UnitGrid({ grid, onUnitClick }: UnitGridProps) {
  if (!grid || grid.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No unit data available for this tower.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.values(UnitStatusEnum).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: UNIT_STATUS_COLORS[status] }}
            />
            <span className="text-muted-foreground">{UNIT_STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {grid.map((floor) => (
            <div key={floor.floor_number} className="flex items-center gap-1.5 mb-1.5">
              {/* Floor label */}
              <div className="w-12 text-right text-xs font-medium text-muted-foreground shrink-0 pr-2">
                F{floor.floor_number}
              </div>

              {/* Units */}
              <div className="flex gap-1.5">
                {floor.units.map((unit) => (
                  <Tooltip key={unit.id}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          'w-20 h-12 rounded-md text-[10px] font-medium transition-all duration-150',
                          'hover:scale-105 hover:shadow-md active:scale-95',
                          'flex flex-col items-center justify-center gap-0.5',
                          'text-white border border-white/20'
                        )}
                        style={{ backgroundColor: UNIT_STATUS_COLORS[unit.status] }}
                        onClick={() => onUnitClick(unit)}
                      >
                        <span className="font-semibold leading-none">{unit.unit_number}</span>
                        <span className="opacity-80 leading-none">{unit.bhk_type}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <div className="space-y-1">
                        <div className="font-semibold">{unit.unit_number}</div>
                        <div>{unit.bhk_type} | {unit.carpet_area} sq.ft</div>
                        {unit.facing && <div>Facing: {unit.facing}</div>}
                        <div>Price: {formatPrice(unit.total_price)}</div>
                        <div className="font-medium" style={{ color: UNIT_STATUS_COLORS[unit.status] }}>
                          {UNIT_STATUS_LABELS[unit.status]}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
  return num.toLocaleString('en-IN');
}
