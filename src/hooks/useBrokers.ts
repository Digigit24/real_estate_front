// src/hooks/useBrokers.ts
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { brokerService } from '@/services/brokerService';
import {
  Broker,
  BrokersResponse,
  Commission,
  CommissionsResponse,
  BrokerLeaderboardResponse,
  BrokersQueryParams,
  CommissionsQueryParams,
  CreateBrokerPayload,
  UpdateBrokerPayload,
  UpdateCommissionPayload,
} from '@/types/brokerTypes';

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

  const markCommissionPaid = useCallback(async (id: number): Promise<Commission> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await brokerService.markCommissionPaid(id);
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
    // Mutations
    createBroker,
    updateBroker,
    deleteBroker,
    updateCommission,
    markCommissionPaid,
  };
};
