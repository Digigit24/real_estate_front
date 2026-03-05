// src/components/BrokerSelect.tsx
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
import { useBrokers } from '@/hooks/useBrokers';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface BrokerSelectProps {
    value: string;                            // Broker ID as string
    onChange: (brokerId: string) => void;     // Callback with broker ID string ('' means cleared)
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function BrokerSelect({
    value,
    onChange,
    placeholder = 'Search and select a broker...',
    disabled = false,
    className,
}: BrokerSelectProps) {
    const [open, setOpen] = useState(false);
    const { useBrokersList } = useBrokers();

    const { data: brokersData, isLoading } = useBrokersList({ page: 1, page_size: 100 });
    const brokers = brokersData?.results || [];

    const selectedBroker = brokers.find((b: any) => b.id?.toString() === value);
    const displayText = selectedBroker
        ? `${selectedBroker.name}${selectedBroker.company_name ? ` (${selectedBroker.company_name})` : ''}`.trim()
        : value
            ? `Broker #${value}`
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
                            Loading brokers...
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
                    <CommandInput placeholder="Search by name or company..." />
                    <CommandList>
                        <CommandEmpty>No brokers found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                            <CommandItem
                                value="__clear_broker__"
                                onSelect={() => {
                                    onChange('');
                                    setOpen(false);
                                }}
                            >
                                <span className="text-muted-foreground">— None —</span>
                            </CommandItem>
                            {brokers.map((broker: any) => {
                                const searchLabel = `${broker.name || ''} ${broker.company_name || ''} ${broker.phone || ''}`.trim();
                                return (
                                    <CommandItem
                                        key={broker.id}
                                        value={searchLabel}
                                        onSelect={() => {
                                            onChange(broker.id.toString());
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === broker.id.toString() ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm">
                                                {broker.name || 'Unknown Broker'}
                                            </span>
                                            {(broker.company_name || broker.phone) && (
                                                <span className="text-xs text-muted-foreground">
                                                    {broker.company_name ? broker.company_name : ''}
                                                    {broker.company_name && broker.phone ? ' · ' : ''}
                                                    {broker.phone ? broker.phone : ''}
                                                </span>
                                            )}
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
