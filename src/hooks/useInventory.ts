// src/hooks/useInventory.ts
import { inventoryService } from '@/services/inventoryService';
import {
    CreateProjectPayload,
    CreateTowerPayload,
    CreateUnitPayload,
    InventorySummary,
    PriceCalculation,
    PriceCalculatorPayload,
    Project,
    ProjectsQueryParams,
    ProjectsResponse,
    ReserveUnitPayload,
    Tower,
    TowersQueryParams,
    TowersResponse,
    Unit,
    UnitGridResponse,
    UnitsQueryParams,
    UnitsResponse,
    UnitSuggestParams,
    UpdateProjectPayload,
    UpdateTowerPayload,
    UpdateUnitPayload,
    UpdateUnitStatusPayload,
} from '@/types/inventoryTypes';
import { useCallback, useState } from 'react';
import useSWR from 'swr';

export const useInventory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== PROJECTS ====================

  const useProjects = (params?: ProjectsQueryParams) => {
    return useSWR<ProjectsResponse>(
      ['projects', params],
      () => inventoryService.getProjects(params),
      {
        revalidateOnFocus: false,
        keepPreviousData: true,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useProject = (id: number | null) => {
    return useSWR<Project>(
      id ? ['project', id] : null,
      () => inventoryService.getProject(id!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useInventorySummary = (projectId: number | null) => {
    return useSWR<InventorySummary>(
      projectId ? ['inventory-summary', projectId] : null,
      () => inventoryService.getInventorySummary(projectId!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const createProject = useCallback(async (payload: CreateProjectPayload): Promise<Project> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.createProject(payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: number, payload: UpdateProjectPayload): Promise<Project> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.updateProject(id, payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await inventoryService.deleteProject(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== TOWERS ====================

  const useTowers = (params?: TowersQueryParams) => {
    return useSWR<TowersResponse>(
      params?.project ? ['towers', params] : null,
      () => inventoryService.getTowers(params),
      {
        revalidateOnFocus: false,
        keepPreviousData: true,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useTower = (id: number | null) => {
    return useSWR<Tower>(
      id ? ['tower', id] : null,
      () => inventoryService.getTower(id!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useTowerUnitGrid = (towerId: number | null) => {
    return useSWR<UnitGridResponse>(
      towerId ? ['tower-unit-grid', towerId] : null,
      () => inventoryService.getTowerUnitGrid(towerId!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const createTower = useCallback(async (payload: CreateTowerPayload): Promise<Tower> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.createTower(payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTower = useCallback(async (id: number, payload: UpdateTowerPayload): Promise<Tower> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.updateTower(id, payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTower = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await inventoryService.deleteTower(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== UNITS ====================

  const useUnits = (params?: UnitsQueryParams) => {
    return useSWR<UnitsResponse>(
      ['units', params],
      () => inventoryService.getUnits(params),
      {
        revalidateOnFocus: false,
        keepPreviousData: true,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useUnit = (id: number | null) => {
    return useSWR<Unit>(
      id ? ['unit', id] : null,
      () => inventoryService.getUnit(id!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const createUnit = useCallback(async (payload: CreateUnitPayload): Promise<Unit> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.createUnit(payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUnit = useCallback(async (id: number, payload: UpdateUnitPayload): Promise<Unit> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.updateUnit(id, payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUnit = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await inventoryService.deleteUnit(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reserveUnit = useCallback(async (id: number, payload: ReserveUnitPayload): Promise<Unit> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.reserveUnit(id, payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const releaseUnit = useCallback(async (id: number): Promise<Unit> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.releaseUnit(id);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUnitStatus = useCallback(async (id: number, payload: UpdateUnitStatusPayload): Promise<Unit> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.updateUnitStatus(id, payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculatePrice = useCallback(async (payload: PriceCalculatorPayload): Promise<PriceCalculation> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.calculatePrice(payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const suggestUnits = useCallback(async (params: UnitSuggestParams): Promise<Unit[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.suggestUnits(params);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    // Projects
    useProjects,
    useProject,
    useInventorySummary,
    createProject,
    updateProject,
    deleteProject,
    // Towers
    useTowers,
    useTower,
    useTowerUnitGrid,
    createTower,
    updateTower,
    deleteTower,
    // Units
    useUnits,
    useUnit,
    createUnit,
    updateUnit,
    deleteUnit,
    reserveUnit,
    releaseUnit,
    updateUnitStatus,
    calculatePrice,
    suggestUnits,
  };
};
