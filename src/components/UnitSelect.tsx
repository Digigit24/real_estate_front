// src/components/UnitSelect.tsx
// Reusable searchable Unit dropdown for any form
// Units come from Inventory: Projects → Towers → Units
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useInventory } from '@/hooks/useInventory';
import { cn } from '@/lib/utils';
import {
    UNIT_STATUS_COLORS,
    UNIT_STATUS_LABELS,
    UnitStatusEnum,
} from '@/types/inventoryTypes';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface UnitSelectProps {
    value: string;                          // Unit ID as string
    onChange: (unitId: string) => void;     // Callback with unit ID string ('' means cleared)
    /** Only show units with these statuses (default: AVAILABLE only) */
    statusFilter?: UnitStatusEnum[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function UnitSelect({
    value,
    onChange,
    statusFilter,
    placeholder = 'Search and select a unit...',
    disabled = false,
    className,
}: UnitSelectProps) {
    const [open, setOpen] = useState(false);
    const { useUnits } = useInventory();

    // Fetch data unconditionally when component mounts (when drawer opens)
    const { data: unitsData, isLoading } = useUnits({ page: 1, page_size: 200 });
    let units = unitsData?.results || [];

    // Filter by status if specified
    if (statusFilter && statusFilter.length > 0) {
        units = units.filter((u) => statusFilter.includes(u.status));
    }

    // Build display text for the selected unit
    const selectedUnit = (unitsData?.results || []).find((u) => u.id?.toString() === value);
    const displayText = selectedUnit
        ? `${selectedUnit.unit_number} · ${selectedUnit.tower_name || 'Tower'} · ${selectedUnit.project_name || 'Project'} (${selectedUnit.bhk_type})`
        : value
            ? `Unit #${value}`
            : '';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn('w-full justify-between font-normal h-9', className)}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Loading units...
                        </span>
                    ) : displayText ? (
                        <span className="truncate">{displayText}</span>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search by unit number, tower, or project..." />
                    <CommandList>
                        <CommandEmpty>No units found.</CommandEmpty>
                        <CommandGroup className="max-h-[250px] overflow-auto">
                            {/* Clear option */}
                            <CommandItem
                                value="__clear_unit__"
                                onSelect={() => {
                                    onChange('');
                                    setOpen(false);
                                }}
                            >
                                <span className="text-muted-foreground">— None —</span>
                            </CommandItem>
                            {units.map((unit) => {
                                const searchLabel = `${unit.unit_number} ${unit.tower_name || ''} ${unit.project_name || ''} ${unit.bhk_type}`;
                                return (
                                    <CommandItem
                                        key={unit.id}
                                        value={searchLabel}
                                        onSelect={() => {
                                            onChange(unit.id.toString());
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4 shrink-0',
                                                value === unit.id.toString() ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{unit.unit_number}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] px-1.5 py-0 h-4"
                                                    style={{
                                                        backgroundColor: `${UNIT_STATUS_COLORS[unit.status]}15`,
                                                        color: UNIT_STATUS_COLORS[unit.status],
                                                    }}
                                                >
                                                    {UNIT_STATUS_LABELS[unit.status]}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate">
                                                {unit.tower_name || 'Tower'} · {unit.project_name || 'Project'} · {unit.bhk_type}
                                                {unit.total_price ? ` · ₹${Number(unit.total_price).toLocaleString('en-IN')}` : ''}
                                            </span>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
