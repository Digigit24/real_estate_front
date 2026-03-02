// src/pages/Projects.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '@/hooks/useInventory';
import { ProjectCard } from '@/components/inventory/ProjectCard';
import { ProjectsTable } from '@/components/inventory/ProjectsTable';
import { ProjectFormDrawer } from '@/components/inventory/ProjectFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, LayoutGrid, List, RefreshCw, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import type { Project, CreateProjectPayload, ProjectsQueryParams } from '@/types/inventoryTypes';

type ViewMode = 'grid' | 'table';

export function Projects() {
  const navigate = useNavigate();
  const { useProjects, createProject, updateProject, deleteProject, isLoading: isMutating } = useInventory();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [queryParams, setQueryParams] = useState<ProjectsQueryParams>({
    page: 1,
    page_size: 50,
    ordering: '-created_at',
  });

  const { data: projectsData, isLoading, mutate: refreshProjects } = useProjects({
    ...queryParams,
    search: searchQuery || undefined,
  });

  const projects = projectsData?.results || [];

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleView = useCallback((project: Project) => {
    navigate(`/inventory/projects/${project.id}`);
  }, [navigate]);

  const handleCreate = useCallback(() => {
    setSelectedProject(null);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((project: Project) => {
    setSelectedProject(project);
    setDrawerOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback((project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async (data: CreateProjectPayload) => {
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, data);
        toast.success('Project updated');
      } else {
        await createProject(data);
        toast.success('Project created');
      }
      setDrawerOpen(false);
      refreshProjects();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save project');
    }
  }, [selectedProject, createProject, updateProject, refreshProjects]);

  const handleDelete = useCallback(async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      toast.success('Project deleted');
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      refreshProjects();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project');
    }
  }, [projectToDelete, deleteProject, refreshProjects]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your real estate projects
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Project
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-1 border rounded-lg p-0.5">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode('table')}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => refreshProjects()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        )
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-sm font-medium">No projects yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first real estate project to get started.
          </p>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Project
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteConfirm}
            />
          ))}
        </div>
      ) : (
        <ProjectsTable
          projects={projects}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteConfirm}
        />
      )}

      {/* Pagination info */}
      {projectsData && projectsData.count > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          Showing {projects.length} of {projectsData.count} projects
        </div>
      )}

      {/* Form Drawer */}
      <ProjectFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        project={selectedProject}
        onSubmit={handleSubmit}
        isSubmitting={isMutating}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
              All associated towers and units will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
