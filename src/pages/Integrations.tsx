// src/pages/Integrations.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntegrations } from '@/hooks/useIntegrations';
import { integrationService } from '@/services/integrationService';
import type { Integration } from '@/types/integration.types';
import { Check, ExternalLink, Plug, Plus, RefreshCw, Workflow } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const Integrations = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { useIntegrationsList, useConnectionsList, useWorkflowsList, initiateOAuth } = useIntegrations();
  const [activeTab, setActiveTab] = useState<'available' | 'connected' | 'workflows'>('available');
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const debugOAuth = import.meta.env.DEV || import.meta.env.VITE_DEBUG_OAUTH === 'true';

  const logOAuth = (...args: unknown[]) => {
    if (debugOAuth) {
      // eslint-disable-next-line no-console
      console.debug('[Integrations][OAuth]', ...args);
    }
  };

  // Fetch data
  const { data: integrationsData, error: integrationsError, isLoading: integrationsLoading, mutate: mutateIntegrations } = useIntegrationsList({ is_active: true });
  const { data: connectionsData, error: connectionsError, isLoading: connectionsLoading, mutate: mutateConnections } = useConnectionsList({ is_active: true });
  const { data: workflowsData, error: workflowsError, isLoading: workflowsLoading, mutate: mutateWorkflows } = useWorkflowsList();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state && !isProcessingOAuth && integrationsData?.results) {
      logOAuth('Detected OAuth params in URL', { codePreview: `${code.slice(0, 6)}...`, state });
      setIsProcessingOAuth(true);

      const handleOAuthCallback = async () => {
        try {
          toast.info('Processing Google authorization...');

          const googleIntegration = integrationsData.results.find(
            (integration) => integration.type === 'GOOGLE_SHEETS'
          );

          if (!googleIntegration) {
            throw new Error('Google Sheets integration not found');
          }

          let redirectUri = `${window.location.origin}${window.location.pathname}`;
          if (!redirectUri.endsWith('/')) redirectUri += '/';

          const data = await integrationService.oauthCallback({
            code,
            state,
            integration_id: googleIntegration.id,
            connection_name: 'Google Sheets',
            redirect_uri: redirectUri,
          });

          toast.success(`Successfully connected!`);
          mutateConnections();
          setActiveTab('connected');

          searchParams.delete('code');
          searchParams.delete('state');
          searchParams.delete('scope');
          setSearchParams(searchParams, { replace: true });

        } catch (error: any) {
          console.error('OAuth callback error:', error);
          toast.error(`Connection failed: ${error.message}`);
          searchParams.delete('code');
          searchParams.delete('state');
          searchParams.delete('scope');
          setSearchParams(searchParams, { replace: true });
        } finally {
          setIsProcessingOAuth(false);
        }
      };

      handleOAuthCallback();
    }
  }, [searchParams, setSearchParams, mutateConnections, isProcessingOAuth, integrationsData]);

  useEffect(() => {
    const success = searchParams.get('oauth_success');
    const connectionName = searchParams.get('connection_name');

    if (success === 'true') {
      toast.success(`Successfully connected ${connectionName || 'Google Sheets'}!`, {
        description: 'You can now create workflows using this connection',
        duration: 5000,
      });
      mutateConnections();
      setActiveTab('connected');
      searchParams.delete('oauth_success');
      searchParams.delete('connection_name');
      setSearchParams(searchParams, { replace: true });
    }

    const error = searchParams.get('oauth_error');
    if (error) {
      toast.error(`Connection failed: ${error}`, { description: 'Please try again or contact support', duration: 7000 });
      searchParams.delete('oauth_error');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, mutateConnections]);

  const handleRefresh = useCallback(() => {
    mutateIntegrations();
    mutateConnections();
    mutateWorkflows();
    toast.success('Refreshed successfully');
  }, [mutateIntegrations, mutateConnections, mutateWorkflows]);

  const handleConnectIntegration = useCallback(async (integration: Integration) => {
    try {
      const existingConnection = connectionsData?.results.find(conn => conn.integration === integration.id);

      if (existingConnection) {
        const accountName = existingConnection.name || existingConnection.integration_details?.name || 'your account';
        toast.info(`Already connected to ${accountName}`, {
          description: 'You can manage this connection from the Connected tab',
          duration: 5000,
        });
        setActiveTab('connected');
        return;
      }

      if (integration.requires_oauth) {
        toast.info('Redirecting to Google for authorization...');
        let redirectUri = `${window.location.origin}${window.location.pathname}`;
        if (!redirectUri.endsWith('/')) redirectUri += '/';

        const result = await initiateOAuth({ integration_id: integration.id, redirect_uri: redirectUri });

        if (!result?.authorization_url) throw new Error('No authorization URL received from server');
        if (!result.authorization_url.includes('accounts.google.com')) throw new Error('Invalid authorization URL received');

        window.location.href = result.authorization_url;
      } else {
        navigate(`/integrations/connect/${integration.id}`);
      }
    } catch (error: any) {
      console.error('OAuth initiation error:', error);
      toast.error(error.message || 'Failed to initiate connection');
    }
  }, [navigate, initiateOAuth, connectionsData, setActiveTab]);

  const handleCreateWorkflow = useCallback(() => navigate('/integrations/workflows/new'), [navigate]);

  const isConnected = useCallback((integrationId: number) => {
    return connectionsData?.results.some(conn => conn.integration === integrationId) || false;
  }, [connectionsData]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg">
            <Plug className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Integrations Workspace</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your active connections and automation workflows ({connectionsData?.count || 0} active).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
          <Button onClick={handleCreateWorkflow} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <Plus className="h-4 w-4 mr-1.5" /> New Workflow
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 p-1 mb-2">
          <TabsTrigger value="available" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">App Marketplace</TabsTrigger>
          <TabsTrigger value="connected" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Connected Apps</TabsTrigger>
          <TabsTrigger value="workflows" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Active Workflows</TabsTrigger>
        </TabsList>

        {/* Available Integrations Tab */}
        <TabsContent value="available" className="mt-4">
          {integrationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              ))}
            </div>
          ) : integrationsError ? (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-center py-12">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load integration marketplace.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleRefresh}>Try Again</Button>
            </div>
          ) : !integrationsData?.results?.length ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl py-16 text-center">
              <Plug className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No Integrations Available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {integrationsData.results.map((integration) => (
                <div key={integration.id} className="relative group bg-card border border-border rounded-xl p-5 hover:shadow-md dark:hover:shadow-slate-900 transition-all overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-bl-[80px] -z-10 group-hover:scale-110 transition-transform" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                      {integration.logo_url ? (
                        <img src={integration.logo_url} alt={integration.name} className="h-8 w-8 object-contain" />
                      ) : (
                        <Plug className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                    {isConnected(integration.id) && (
                      <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 font-medium tracking-wide">
                        <Check className="w-3 h-3 mr-1" /> Connected
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">{integration.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 flex-1">
                    {integration.description || `Integrate ${integration.name} directly into your workflow.`}
                  </p>

                  <div className="mt-auto">
                    <Button
                      variant={isConnected(integration.id) ? 'outline' : 'default'}
                      className={`w-full ${isConnected(integration.id) ? '' : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white'}`}
                      onClick={() => handleConnectIntegration(integration)}
                    >
                      {isConnected(integration.id) ? 'Manage Settings' : integration.requires_oauth ? 'Connect Account' : 'Manual Setup'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Connected Apps Tab */}
        <TabsContent value="connected" className="mt-4">
          {connectionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1.5" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
              ))}
            </div>
          ) : !connectionsData?.results?.length ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl py-16 text-center">
              <Check className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-1">No Connected Apps</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">Connect apps from the marketplace to build workflows.</p>
              <Button onClick={() => setActiveTab('available')} className="bg-indigo-600 hover:bg-indigo-700">Browse Marketplace</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {connectionsData.results.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                      {connection.integration_details?.logo_url ? (
                        <img src={connection.integration_details.logo_url} alt={connection.name} className="h-6 w-6 object-contain" />
                      ) : (
                        <Plug className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{connection.name}</p>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Via {connection.integration_details?.name || 'Manual'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={connection.is_active
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'}>
                      {connection.is_active ? 'Active' : 'Offline'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30"
                      onClick={() => navigate(`/integrations/connections/${connection.id}`)}
                    >
                      Settings
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="mt-4">
          {workflowsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-5 border rounded-xl bg-card">
                  <Skeleton className="h-5 w-48 mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : !workflowsData?.results?.length ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl py-16 text-center">
              <Workflow className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-1">No Active Workflows</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">Create automated tasks between your connected applications.</p>
              <Button onClick={handleCreateWorkflow} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Create New Workflow
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {workflowsData.results.map((workflow) => (
                <div
                  key={workflow.id}
                  className="bg-card p-5 border border-border rounded-xl hover:shadow-lg dark:hover:shadow-slate-900 transition-all cursor-pointer relative group flex flex-col h-full"
                  onClick={() => navigate(`/integrations/workflows/${workflow.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 dark:from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity rounded-xl" />

                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight flex-1 pr-3">{workflow.name}</h3>
                    <Badge variant="outline" className={`shrink-0 ${workflow.is_active
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                      {workflow.is_active ? 'Running' : 'Paused'}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 line-clamp-2 relative z-10 flex-1">
                    {workflow.description || 'Automated background task linking external modules.'}
                  </p>

                  <div className="flex items-center gap-2 mt-auto relative z-10 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30"
                      onClick={(e) => { e.stopPropagation(); navigate(`/integrations/workflows/${workflow.id}`); }}
                    >
                      <Workflow className="w-3.5 h-3.5 mr-1.5" /> Edit Flow
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                      onClick={(e) => { e.stopPropagation(); navigate(`/integrations/workflows/${workflow.id}/logs`); }}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Logs
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integrations;
