import { InventorySummary, UnitStatusEnum, UNIT_STATUS_COLORS, UNIT_STATUS_LABELS } from '@/types/inventoryTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface InventorySummaryCardProps {
  summary: InventorySummary | undefined;
  isLoading?: boolean;
}

export function InventorySummaryCard({ summary, isLoading }: InventorySummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const segments = [
    { key: UnitStatusEnum.AVAILABLE, count: summary.available },
    { key: UnitStatusEnum.RESERVED, count: summary.reserved },
    { key: UnitStatusEnum.BOOKED, count: summary.booked },
    { key: UnitStatusEnum.REGISTERED, count: summary.registered },
    { key: UnitStatusEnum.SOLD, count: summary.sold },
    { key: UnitStatusEnum.BLOCKED, count: summary.blocked },
  ].filter((s) => s.count > 0);

  const total = summary.total || 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Inventory Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Donut-like horizontal bar */}
        <div className="flex h-4 rounded-full overflow-hidden bg-muted">
          {segments.map((seg) => (
            <div
              key={seg.key}
              className="h-full transition-all duration-300"
              style={{
                width: `${(seg.count / total) * 100}%`,
                backgroundColor: UNIT_STATUS_COLORS[seg.key],
              }}
            />
          ))}
        </div>

        {/* Total */}
        <div className="text-center">
          <span className="text-2xl font-bold">{summary.total}</span>
          <span className="text-sm text-muted-foreground ml-1">total units</span>
        </div>

        {/* Status breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {Object.values(UnitStatusEnum).map((status) => {
            const count = summary[status.toLowerCase() as keyof InventorySummary] as number || 0;
            return (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: UNIT_STATUS_COLORS[status] }}
                />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{UNIT_STATUS_LABELS[status]}</p>
                  <p className="text-sm font-semibold">{count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
