// src/pages/ProjectDetail.tsx
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventory } from '@/hooks/useInventory';
import { InventorySummaryCard } from '@/components/inventory/InventorySummaryCard';
import { TowerFormDrawer } from '@/components/inventory/TowerFormDrawer';
import { ProjectFormDrawer } from '@/components/inventory/ProjectFormDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Building,
  MapPin,
  Calendar,
  Home,
  Layers,
  MoreVertical,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Tower, CreateTowerPayload, CreateProjectPayload } from '@/types/inventoryTypes';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id ? parseInt(id) : null;

  const {
    useProject,
    useInventorySummary,
    useTowers,
    createTower,
    updateTower,
    deleteTower,
    updateProject,
    isLoading: isMutating,
  } = useInventory();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: summary, isLoading: summaryLoading } = useInventorySummary(projectId);
  const { data: towersData, isLoading: towersLoading, mutate: refreshTowers } = useTowers(
    projectId ? { project: projectId } : undefined
  );

  const towers = towersData?.results || [];

  // Drawers
  const [towerDrawerOpen, setTowerDrawerOpen] = useState(false);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [towerToDelete, setTowerToDelete] = useState<Tower | null>(null);

  const handleCreateTower = useCallback(() => {
    setSelectedTower(null);
    setTowerDrawerOpen(true);
  }, []);

  const handleEditTower = useCallback((tower: Tower) => {
    setSelectedTower(tower);
    setTowerDrawerOpen(true);
  }, []);

  const handleViewTower = useCallback((tower: Tower) => {
    navigate(`/inventory/projects/${projectId}/towers/${tower.id}`);
  }, [navigate, projectId]);

  const handleDeleteTowerConfirm = useCallback((tower: Tower) => {
    setTowerToDelete(tower);
    setDeleteDialogOpen(true);
  }, []);

  const handleTowerSubmit = useCallback(async (data: CreateTowerPayload) => {
    try {
      if (selectedTower) {
        await updateTower(selectedTower.id, data);
        toast.success('Tower updated');
      } else {
        await createTower(data);
        toast.success('Tower created');
      }
      setTowerDrawerOpen(false);
      refreshTowers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save tower');
    }
  }, [selectedTower, createTower, updateTower, refreshTowers]);

  const handleDeleteTower = useCallback(async () => {
    if (!towerToDelete) return;
    try {
      await deleteTower(towerToDelete.id);
      toast.success('Tower deleted');
      setDeleteDialogOpen(false);
      setTowerToDelete(null);
      refreshTowers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete tower');
    }
  }, [towerToDelete, deleteTower, refreshTowers]);

  const handleProjectSubmit = useCallback(async (data: CreateProjectPayload) => {
    if (!projectId) return;
    try {
      await updateProject(projectId, data);
      toast.success('Project updated');
      setProjectDrawerOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project');
    }
  }, [projectId, updateProject]);

  if (projectLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center py-16">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/inventory/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/inventory/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{project.name}</h1>
            {project.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {project.location}{project.city ? `, ${project.city}` : ''}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setProjectDrawerOpen(true)}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Edit Project
        </Button>
      </div>

      {/* Project Info + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project details card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {project.rera_number && (
                <div>
                  <p className="text-xs text-muted-foreground">RERA Number</p>
                  <Badge variant="outline" className="mt-1 font-mono text-xs">{project.rera_number}</Badge>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Total Units</p>
                <p className="font-semibold flex items-center gap-1 mt-1">
                  <Home className="h-3.5 w-3.5" />
                  {project.total_units}
                </p>
              </div>
              {project.launch_date && (
                <div>
                  <p className="text-xs text-muted-foreground">Launch Date</p>
                  <p className="mt-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(project.launch_date), 'dd MMM yyyy')}
                  </p>
                </div>
              )}
              {project.possession_date && (
                <div>
                  <p className="text-xs text-muted-foreground">Possession Date</p>
                  <p className="mt-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(project.possession_date), 'dd MMM yyyy')}
                  </p>
                </div>
              )}
              {project.city && (
                <div>
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="mt-1">{project.city}{project.state ? `, ${project.state}` : ''}</p>
                </div>
              )}
              {project.address && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="mt-1">{project.address}</p>
                </div>
              )}
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">{project.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Inventory Summary */}
        <InventorySummaryCard summary={summary} isLoading={summaryLoading} />
      </div>

      {/* Towers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Towers ({towers.length})
          </h2>
          <Button size="sm" onClick={handleCreateTower}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Tower
          </Button>
        </div>

        {towersLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : towers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No towers added yet.</p>
              <Button size="sm" className="mt-3" onClick={handleCreateTower}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Tower
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {towers.map((tower) => (
              <Card
                key={tower.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 group"
                onClick={() => handleViewTower(tower)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{tower.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tower.total_floors} floors | {tower.units_per_floor} units/floor
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewTower(tower); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Grid
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditTower(tower); }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDeleteTowerConfirm(tower); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {tower.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{tower.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {tower.total_floors * tower.units_per_floor} total units
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tower Form Drawer */}
      {projectId && (
        <TowerFormDrawer
          open={towerDrawerOpen}
          onOpenChange={setTowerDrawerOpen}
          projectId={projectId}
          tower={selectedTower}
          onSubmit={handleTowerSubmit}
          isSubmitting={isMutating}
        />
      )}

      {/* Project Edit Drawer */}
      <ProjectFormDrawer
        open={projectDrawerOpen}
        onOpenChange={setProjectDrawerOpen}
        project={project}
        onSubmit={handleProjectSubmit}
        isSubmitting={isMutating}
      />

      {/* Delete Tower Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tower</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{towerToDelete?.name}"? All units in this tower will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTower}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
