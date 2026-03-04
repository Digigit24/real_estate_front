import { useEffect, useState } from "react";
import { brokerPortalService } from "@/services/brokerPortalService";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, MapPin, Edit } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export function BrokerMeetings() {
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const data = await brokerPortalService.getMeetings();
            setMeetings(data);
        } catch (error) {
            console.error("Failed to load meetings", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading meetings...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-600 tracking-tight">
                        Meeting Scheduling
                    </h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">View and schedule appointments with leads and clients.</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md rounded-xl px-5">+ Schedule Meeting</Button>
            </div>

            <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-slate-600 font-semibold py-4">Title</TableHead>
                                <TableHead className="text-slate-600 font-semibold py-4">Date & Time</TableHead>
                                <TableHead className="text-slate-600 font-semibold py-4">Location</TableHead>
                                <TableHead className="text-slate-600 font-semibold py-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {meetings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-slate-500 py-12">
                                        No upcoming meetings. Schedule one to get started!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                meetings.map((meeting: any) => (
                                    <TableRow key={meeting.id} className="hover:bg-purple-50/30 transition-colors">
                                        <TableCell className="font-medium text-gray-900 py-4">
                                            {meeting.title}
                                            <div className="text-sm font-normal text-slate-500 mt-1 line-clamp-1">{meeting.lead_name || 'No Lead Attached'}</div>
                                        </TableCell>
                                        <TableCell className="text-gray-700 py-4 font-medium">
                                            <div className="flex items-center text-slate-700">
                                                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                                {meeting.start_at ? format(new Date(meeting.start_at), 'MMM dd, yyyy h:mm a') : 'TBD'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-700 py-4">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-2 text-rose-400" />
                                                {meeting.location || 'Virtual'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                            <Button variant="ghost" size="sm" className="text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg">
                                                <Edit className="w-4 h-4 mr-1.5" /> Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
