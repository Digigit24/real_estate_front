// src/components/LeadSelect.tsx
// Reusable searchable Lead dropdown for any form
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
import { useCRM } from '@/hooks/useCRM';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface LeadSelectProps {
    value: string;                          // Lead ID as string
    onChange: (leadId: string) => void;     // Callback with lead ID string ('' means cleared)
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function LeadSelect({
    value,
    onChange,
    placeholder = 'Search and select a lead...',
    disabled = false,
    className,
}: LeadSelectProps) {
    const [open, setOpen] = useState(false);
    const { useLeads } = useCRM();

    // Fetch data unconditionally when component mounts (when drawer opens)
    const { data: leadsData, isLoading } = useLeads({ page: 1, page_size: 100 }); const leads = leadsData?.results || [];

    // Built display text for the selected lead
    const selectedLead = leads.find((l: any) => l.id?.toString() === value);
    const displayText = selectedLead
        ? `${selectedLead.name || selectedLead.first_name || ''} ${selectedLead.last_name || ''}`.trim() +
        (selectedLead.phone ? ` (${selectedLead.phone})` : '')
        : value
            ? `Lead #${value}`
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
                            Loading leads...
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
                    <CommandInput placeholder="Search by name or phone..." />
                    <CommandList>
                        <CommandEmpty>No leads found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                            {/* Clear option */}
                            <CommandItem
                                value="__clear_lead__"
                                onSelect={() => {
                                    onChange('');
                                    setOpen(false);
                                }}
                            >
                                <span className="text-muted-foreground">— None —</span>
                            </CommandItem>
                            {leads.map((lead: any) => {
                                const name = `${lead.name || lead.first_name || ''} ${lead.last_name || ''}`.trim();
                                const searchLabel = `${name}${lead.phone ? ` · ${lead.phone}` : ''}`;
                                return (
                                    <CommandItem
                                        key={lead.id}
                                        value={searchLabel}
                                        onSelect={() => {
                                            onChange(lead.id.toString());
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === lead.id.toString() ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm">{name || `Lead #${lead.id}`}</span>
                                            {lead.phone && (
                                                <span className="text-xs text-muted-foreground">{lead.phone}</span>
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
