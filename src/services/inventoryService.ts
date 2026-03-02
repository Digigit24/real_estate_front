// src/services/inventoryService.ts
import { crmClient } from '@/lib/client';
import { API_CONFIG, buildQueryString } from '@/lib/apiConfig';
import {
  Project,
  Tower,
  Unit,
  UnitGridResponse,
  InventorySummary,
  PriceCalculation,
  ProjectsResponse,
  TowersResponse,
  UnitsResponse,
  ProjectsQueryParams,
  TowersQueryParams,
  UnitsQueryParams,
  UnitSuggestParams,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreateTowerPayload,
  UpdateTowerPayload,
  CreateUnitPayload,
  UpdateUnitPayload,
  ReserveUnitPayload,
  UpdateUnitStatusPayload,
  PriceCalculatorPayload,
} from '@/types/inventoryTypes';

class InventoryService {
  // ==================== PROJECTS ====================

  async getProjects(params?: ProjectsQueryParams): Promise<ProjectsResponse> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<ProjectsResponse>(
        `${API_CONFIG.INVENTORY.PROJECTS}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch projects';
      throw new Error(message);
    }
  }

  async getProject(id: number): Promise<Project> {
    try {
      const response = await crmClient.get<Project>(
        API_CONFIG.INVENTORY.PROJECT_DETAIL.replace(':id', id.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch project';
      throw new Error(message);
    }
  }

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    try {
      const response = await crmClient.post<Project>(
        API_CONFIG.INVENTORY.PROJECT_CREATE,
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create project';
      throw new Error(message);
    }
  }

  async updateProject(id: number, payload: UpdateProjectPayload): Promise<Project> {
    try {
      const response = await crmClient.patch<Project>(
        API_CONFIG.INVENTORY.PROJECT_UPDATE.replace(':id', id.toString()),
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update project';
      throw new Error(message);
    }
  }

  async deleteProject(id: number): Promise<void> {
    try {
      await crmClient.delete(
        API_CONFIG.INVENTORY.PROJECT_DELETE.replace(':id', id.toString())
      );
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete project';
      throw new Error(message);
    }
  }

  async getInventorySummary(projectId: number): Promise<InventorySummary> {
    try {
      const response = await crmClient.get<InventorySummary>(
        API_CONFIG.INVENTORY.PROJECT_INVENTORY_SUMMARY.replace(':id', projectId.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch inventory summary';
      throw new Error(message);
    }
  }

  // ==================== TOWERS ====================

  async getTowers(params?: TowersQueryParams): Promise<TowersResponse> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<TowersResponse>(
        `${API_CONFIG.INVENTORY.TOWERS}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch towers';
      throw new Error(message);
    }
  }

  async getTower(id: number): Promise<Tower> {
    try {
      const response = await crmClient.get<Tower>(
        API_CONFIG.INVENTORY.TOWER_DETAIL.replace(':id', id.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch tower';
      throw new Error(message);
    }
  }

  async createTower(payload: CreateTowerPayload): Promise<Tower> {
    try {
      const response = await crmClient.post<Tower>(
        API_CONFIG.INVENTORY.TOWER_CREATE,
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create tower';
      throw new Error(message);
    }
  }

  async updateTower(id: number, payload: UpdateTowerPayload): Promise<Tower> {
    try {
      const response = await crmClient.patch<Tower>(
        API_CONFIG.INVENTORY.TOWER_UPDATE.replace(':id', id.toString()),
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update tower';
      throw new Error(message);
    }
  }

  async deleteTower(id: number): Promise<void> {
    try {
      await crmClient.delete(
        API_CONFIG.INVENTORY.TOWER_DELETE.replace(':id', id.toString())
      );
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete tower';
      throw new Error(message);
    }
  }

  async getTowerUnitGrid(towerId: number): Promise<UnitGridResponse> {
    try {
      const response = await crmClient.get<UnitGridResponse>(
        API_CONFIG.INVENTORY.TOWER_UNIT_GRID.replace(':id', towerId.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch unit grid';
      throw new Error(message);
    }
  }

  // ==================== UNITS ====================

  async getUnits(params?: UnitsQueryParams): Promise<UnitsResponse> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<UnitsResponse>(
        `${API_CONFIG.INVENTORY.UNITS}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch units';
      throw new Error(message);
    }
  }

  async getUnit(id: number): Promise<Unit> {
    try {
      const response = await crmClient.get<Unit>(
        API_CONFIG.INVENTORY.UNIT_DETAIL.replace(':id', id.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch unit';
      throw new Error(message);
    }
  }

  async createUnit(payload: CreateUnitPayload): Promise<Unit> {
    try {
      const response = await crmClient.post<Unit>(
        API_CONFIG.INVENTORY.UNIT_CREATE,
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create unit';
      throw new Error(message);
    }
  }

  async updateUnit(id: number, payload: UpdateUnitPayload): Promise<Unit> {
    try {
      const response = await crmClient.patch<Unit>(
        API_CONFIG.INVENTORY.UNIT_UPDATE.replace(':id', id.toString()),
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update unit';
      throw new Error(message);
    }
  }

  async deleteUnit(id: number): Promise<void> {
    try {
      await crmClient.delete(
        API_CONFIG.INVENTORY.UNIT_DELETE.replace(':id', id.toString())
      );
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete unit';
      throw new Error(message);
    }
  }

  async reserveUnit(id: number, payload: ReserveUnitPayload): Promise<Unit> {
    try {
      const response = await crmClient.post<Unit>(
        API_CONFIG.INVENTORY.UNIT_RESERVE.replace(':id', id.toString()),
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to reserve unit';
      throw new Error(message);
    }
  }

  async releaseUnit(id: number): Promise<Unit> {
    try {
      const response = await crmClient.post<Unit>(
        API_CONFIG.INVENTORY.UNIT_RELEASE.replace(':id', id.toString())
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to release unit';
      throw new Error(message);
    }
  }

  async updateUnitStatus(id: number, payload: UpdateUnitStatusPayload): Promise<Unit> {
    try {
      const response = await crmClient.post<Unit>(
        API_CONFIG.INVENTORY.UNIT_UPDATE_STATUS.replace(':id', id.toString()),
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update unit status';
      throw new Error(message);
    }
  }

  async calculatePrice(payload: PriceCalculatorPayload): Promise<PriceCalculation> {
    try {
      const response = await crmClient.post<PriceCalculation>(
        API_CONFIG.INVENTORY.UNIT_PRICE_CALCULATOR,
        payload
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to calculate price';
      throw new Error(message);
    }
  }

  async suggestUnits(params: UnitSuggestParams): Promise<Unit[]> {
    try {
      const queryString = buildQueryString(params);
      const response = await crmClient.get<Unit[]>(
        `${API_CONFIG.INVENTORY.UNIT_SUGGEST}${queryString}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch unit suggestions';
      throw new Error(message);
    }
  }

  // ==================== FIRST LOGIN ====================

  async initializePipelineDefaults(): Promise<{ created: boolean; stages?: any[] }> {
    try {
      const response = await crmClient.post(
        API_CONFIG.PIPELINE_SEED.INITIALIZE_DEFAULTS
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to initialize pipeline defaults';
      throw new Error(message);
    }
  }
}

export const inventoryService = new InventoryService();
