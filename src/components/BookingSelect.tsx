// src/components/BookingSelect.tsx
// Reusable searchable Booking dropdown for any form
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
import { useBookings } from '@/hooks/useBookings';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface BookingSelectProps {
    value: string;                            // Booking ID as string
    onChange: (bookingId: string) => void;    // Callback with booking ID string ('' means cleared)
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function BookingSelect({
    value,
    onChange,
    placeholder = 'Search and select a booking...',
    disabled = false,
    className,
}: BookingSelectProps) {
    const [open, setOpen] = useState(false);
    const { useBookingsList } = useBookings();

    // Fetch data unconditionally when component mounts (when drawer opens)
    const { data: bookingsData, isLoading } = useBookingsList({ page: 1, page_size: 100 });
    const bookings = bookingsData?.results || [];

    // Build display text for the selected booking
    const selectedBooking = bookings.find((b: any) => b.id?.toString() === value);
    const displayText = selectedBooking
        ? `#${selectedBooking.id} - ${selectedBooking.lead_name || 'Booking'}${selectedBooking.unit_number ? ` (${selectedBooking.unit_number})` : ''}`.trim()
        : value
            ? `Booking #${value}`
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
                            Loading bookings...
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
                    <CommandInput placeholder="Search by lead name or unit..." />
                    <CommandList>
                        <CommandEmpty>No bookings found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                            {/* Clear option */}
                            <CommandItem
                                value="__clear_booking__"
                                onSelect={() => {
                                    onChange('');
                                    setOpen(false);
                                }}
                            >
                                <span className="text-muted-foreground">— None —</span>
                            </CommandItem>
                            {bookings.map((booking: any) => {
                                const searchLabel = `#${booking.id} ${booking.lead_name || ''} ${booking.unit_number || ''}`.trim();
                                return (
                                    <CommandItem
                                        key={booking.id}
                                        value={searchLabel}
                                        onSelect={() => {
                                            onChange(booking.id.toString());
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === booking.id.toString() ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm">
                                                #{booking.id} - {booking.lead_name || 'Booking'}
                                            </span>
                                            {booking.unit_number && (
                                                <span className="text-xs text-muted-foreground">
                                                    Unit: {booking.unit_number}
                                                    {booking.project_name ? ` · ${booking.project_name}` : ''}
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
