// src/hooks/useBrokers.ts
import { brokerService } from '@/services/brokerService';
import {
    Broker,
    BrokerLeaderboardResponse,
    BrokersQueryParams,
    BrokersResponse,
    Commission,
    CommissionsQueryParams,
    CommissionsResponse,
    CreateBrokerPayload,
    CreateCommissionPayload,
    UpdateBrokerPayload,
    UpdateCommissionPayload,
} from '@/types/brokerTypes';
import { useCallback, useState } from 'react';
import useSWR from 'swr';

export const useBrokers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== BROKER QUERIES ====================

  const useBrokersList = (params?: BrokersQueryParams) => {
    return useSWR<BrokersResponse>(
      ['brokers', params],
      () => brokerService.getBrokers(params),
      {
        revalidateOnFocus: false,
        keepPreviousData: true,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useBroker = (id: number | null) => {
    return useSWR<Broker>(
      id ? ['broker', id] : null,
      () => brokerService.getBroker(id!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useLeaderboard = () => {
    return useSWR<BrokerLeaderboardResponse>(
      ['broker-leaderboard'],
      () => brokerService.getLeaderboard(),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useCommissionsList = (params?: CommissionsQueryParams) => {
    return useSWR<CommissionsResponse>(
      ['commissions', params],
      () => brokerService.getCommissions(params),
      {
        revalidateOnFocus: false,
        keepPreviousData: true,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useBrokerLeads = (brokerId: number | null) => {
    return useSWR<any[]>(
      brokerId ? ['broker-leads', brokerId] : null,
      () => brokerService.getBrokerLeads(brokerId!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useBrokerCommissions = (brokerId: number | null) => {
    return useSWR<Commission[]>(
      brokerId ? ['broker-commissions', brokerId] : null,
      () => brokerService.getBrokerCommissions(brokerId!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  const useCommissionDetail = (id: number | null) => {
    return useSWR<Commission>(
      id ? ['commission-detail', id] : null,
      () => brokerService.getCommission(id!),
      {
        revalidateOnFocus: false,
        onError: (err) => setError(err.message),
      }
    );
  };

  // ==================== BROKER MUTATIONS ====================

  const createBroker = useCallback(async (payload: CreateBrokerPayload): Promise<Broker> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await brokerService.createBroker(payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBroker = useCallback(async (id: number, payload: UpdateBrokerPayload): Promise<Broker> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await brokerService.updateBroker(id, payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBroker = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await brokerService.deleteBroker(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCommission = useCallback(async (payload: CreateCommissionPayload): Promise<Commission> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await brokerService.createCommission(payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCommission = useCallback(async (id: number, payload: UpdateCommissionPayload): Promise<Commission> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await brokerService.updateCommission(id, payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCommission = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await brokerService.deleteCommission(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markCommissionPaid = useCallback(async (id: number, paidDate: string): Promise<Commission> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await brokerService.markCommissionPaid(id, paidDate);
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
    // Queries
    useBrokersList,
    useBroker,
    useLeaderboard,
    useCommissionsList,
    useBrokerLeads,
    useBrokerCommissions,
    useCommissionDetail,
    // Mutations
    createBroker,
    updateBroker,
    deleteBroker,
    createCommission,
    updateCommission,
    deleteCommission,
    markCommissionPaid,
  };
};
