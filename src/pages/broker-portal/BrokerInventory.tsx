import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { brokerPortalService } from "@/services/brokerPortalService";
import { Building2, Plus, MapPin, Eye, Search, Layers, Box } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export function BrokerInventory() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await brokerPortalService.getProjects();

            // For each project, attempt to load its inventory summary
            const projectsWithSummaries = await Promise.all(
                data.map(async (project: any) => {
                    try {
                        const summary = await brokerPortalService.getProjectSummary(project.id);
                        return { ...project, summary };
                    } catch (err) {
                        return { ...project, summary: null };
                    }
                })
            );

            setProjects(projectsWithSummaries);
        } catch (error) {
            toast.error("Failed to load inventory projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-primary" />
                        Project Inventory
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Browse active projects and monitor unit availability
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-9 bg-card border-border/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredProjects.length === 0 ? (
                <Card className="flex flex-col items-center justify-center h-64 border-dashed border-2 bg-transparent">
                    <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">No projects found</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Check back later or adjust your search.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.map((project: any) => {
                        const s = project.summary || {};
                        const total = s.total_units || 0;
                        const available = s.available_units || 0;
                        const sold = s.sold_units || 0;
                        const booked = s.booked_units || 0;

                        const availablePercent = total > 0 ? (available / total) * 100 : 0;
                        const soldPercent = total > 0 ? (sold / total) * 100 : 0;
                        const bookedPercent = total > 0 ? (booked / total) * 100 : 0;

                        return (
                            <Card key={project.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 group hover:shadow-md bg-card/50 backdrop-blur-xl flex flex-col">
                                <div className="h-40 bg-muted relative overflow-hidden">
                                    {/* Placeholder image or actual cover image */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent z-0 group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-none font-semibold text-xs tracking-wider">
                                            {project.status || 'ACTIVE'}
                                        </Badge>
                                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-none font-semibold text-xs text-primary">
                                            {project.type || 'RESIDENTIAL'}
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h3 className="text-xl font-bold text-foreground drop-shadow-sm line-clamp-1">{project.name}</h3>
                                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                            {project.location || 'Location Not Specified'}
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-5 flex-1 flex flex-col">

                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-sm">
                                            <p className="text-muted-foreground">Total Towers</p>
                                            <p className="font-semibold text-foreground flex items-center">
                                                <Layers className="w-3.5 h-3.5 mr-1.5 text-primary" />
                                                {project.total_towers || '?'} Towers
                                            </p>
                                        </div>
                                        <div className="text-sm text-right">
                                            <p className="text-muted-foreground">Unit Range</p>
                                            <p className="font-semibold text-foreground flex items-center justify-end">
                                                <Box className="w-3.5 h-3.5 mr-1.5 text-primary" />
                                                {total} Units
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-auto">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Availability</span>
                                            <span className="font-bold text-emerald-500">{available} / {total} Available</span>
                                        </div>

                                        {/* Activity Bar */}
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                                            <div className="bg-emerald-500 h-full" style={{ width: `${availablePercent}%` }} />
                                            <div className="bg-amber-500 h-full" style={{ width: `${bookedPercent}%` }} />
                                            <div className="bg-rose-500 h-full" style={{ width: `${soldPercent}%` }} />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                                            <div className="flex flex-col">
                                                <span className="text-emerald-500 font-semibold">{available}</span>
                                                <span className="text-muted-foreground">Available</span>
                                            </div>
                                            <div className="flex flex-col text-center">
                                                <span className="text-amber-500 font-semibold">{booked}</span>
                                                <span className="text-muted-foreground">Booked</span>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <span className="text-rose-500 font-semibold">{sold}</span>
                                                <span className="text-muted-foreground">Sold</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-5 mt-4 border-t border-border/50">
                                        <Link to={`/broker-portal/inventory/units?project=${project.id}`} className="w-full">
                                            <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Inventory Array
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
