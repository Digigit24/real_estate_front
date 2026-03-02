import { Project } from '@/types/inventoryTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, MapPin, Calendar, Home, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-all duration-200 border-border/60 overflow-hidden"
      onClick={() => onView(project)}
    >
      {/* Banner */}
      <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
        {project.banner_url ? (
          <img
            src={project.banner_url}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-12 w-12 text-primary/20" />
          </div>
        )}
        {/* Actions overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" size="icon" className="h-7 w-7 shadow-sm">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(project); }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(project); }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(project); }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {project.rera_number && (
          <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px] shadow-sm">
            RERA: {project.rera_number}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Name */}
        <div>
          <h3 className="font-semibold text-sm truncate">{project.name}</h3>
          {project.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{project.location}{project.city ? `, ${project.city}` : ''}</span>
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Home className="h-3.5 w-3.5" />
            <span>{project.total_units || 0} units</span>
          </div>
          {project.possession_date && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(project.possession_date), 'MMM yyyy')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
