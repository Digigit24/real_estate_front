// src/pages/Integrations.tsx
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIntegrations } from '@/hooks/useIntegrations';
import { integrationService } from '@/services/integrationService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, RefreshCw, Plug, Workflow, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Integration } from '@/types/integration.types';

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

  // In your useEffect for OAuth callback, add a check
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // WAIT for integrations data to load before processing
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
            logOAuth('Google integration not found in list', integrationsData.results);
            throw new Error('Google Sheets integration not found');
          }

          // Construct the same redirect_uri used during OAuth initiation
          let redirectUri = `${window.location.origin}${window.location.pathname}`;
          if (!redirectUri.endsWith('/')) {
            redirectUri += '/';
          }

          logOAuth('Posting OAuth callback to backend', {
            integrationId: googleIntegration.id,
            state,
            redirectUri,
          });

          const data = await integrationService.oauthCallback({
            code,
            state,
            integration_id: googleIntegration.id,
            connection_name: 'Google Sheets',
            redirect_uri: redirectUri,
          });

          logOAuth('OAuth callback response', data);
          toast.success(`Successfully connected!`);
          mutateConnections();
          setActiveTab('connected');

          searchParams.delete('code');
          searchParams.delete('state');
          searchParams.delete('scope');
          setSearchParams(searchParams, { replace: true });

        } catch (error: any) {
          console.error('OAuth callback error:', error);
          logOAuth('OAuth callback failed', {
            message: error?.message,
            response: error?.response?.data,
            stack: error?.stack,
          });
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
  }, [searchParams, setSearchParams, mutateConnections, isProcessingOAuth, integrationsData]); // ADD integrationsData to dependencies

  // Handle OAuth callback success/error from backend redirect (legacy support)
  useEffect(() => {
    const success = searchParams.get('oauth_success');
    const connectionName = searchParams.get('connection_name');

    if (success === 'true') {
      toast.success(`Successfully connected ${connectionName || 'Google Sheets'}!`, {
        description: 'You can now create workflows using this connection',
        duration: 5000,
      });

      // Refresh connections list
      mutateConnections();

      // Switch to connected tab
      setActiveTab('connected');

      // Clean up URL
      searchParams.delete('oauth_success');
      searchParams.delete('connection_name');
      setSearchParams(searchParams, { replace: true });
    }

    const error = searchParams.get('oauth_error');
    if (error) {
      logOAuth('Received oauth_error from backend redirect', error);
      toast.error(`Connection failed: ${error}`, {
        description: 'Please try again or contact support',
        duration: 7000,
      });

      // Clean up URL
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
      // Check if integration is already connected
      const existingConnection = connectionsData?.results.find(conn => conn.integration === integration.id);

      if (existingConnection) {
        // Show info that integration is already connected
        const accountName = existingConnection.name || existingConnection.integration_details?.name || 'your account';
        toast.info(`Already connected to ${accountName}`, {
          description: 'You can manage this connection from the Connected tab',
          duration: 5000,
        });

        // Switch to connected tab to show the existing connection
        setActiveTab('connected');
        return;
      }

      if (integration.requires_oauth) {
        // Initiate OAuth flow
        toast.info('Redirecting to Google for authorization...');

        // Construct the redirect URI - where Google should send the user back
        // Ensure it ends with a trailing slash to match Google Cloud Console configuration
        let redirectUri = `${window.location.origin}${window.location.pathname}`;
        if (!redirectUri.endsWith('/')) {
          redirectUri += '/';
        }

        logOAuth('Initiating OAuth with redirect_uri', { redirectUri });

        const result = await initiateOAuth({
          integration_id: integration.id,
          redirect_uri: redirectUri
        });

        // Validate that we received a valid authorization URL
        if (!result?.authorization_url) {
          throw new Error('No authorization URL received from server');
        }

        // Ensure the authorization URL points to Google OAuth
        if (!result.authorization_url.includes('accounts.google.com')) {
          console.error('Invalid authorization URL:', result.authorization_url);
          throw new Error('Invalid authorization URL received');
        }

        // Log the authorization URL for debugging (helps verify redirect_uri parameter)
        logOAuth('Authorization URL received', {
          url: result.authorization_url,
          state: result.state,
          integrationId: integration.id,
          parsedRedirect: (() => {
            try {
              const parsed = new URL(result.authorization_url);
              return parsed.searchParams.get('redirect_uri');
            } catch {
              return 'unparseable';
            }
          })(),
        });

        // Redirect to Google OAuth
        window.location.href = result.authorization_url;
      } else {
        // For non-OAuth integrations, navigate to manual setup
        navigate(`/integrations/connect/${integration.id}`);
      }
    } catch (error: any) {
      console.error('OAuth initiation error:', error);
      toast.error(error.message || 'Failed to initiate connection');
    }
  }, [navigate, initiateOAuth, connectionsData, setActiveTab]);

  const handleViewWorkflows = useCallback(() => {
    navigate('/integrations/workflows');
  }, [navigate]);

  const handleCreateWorkflow = useCallback(() => {
    navigate('/integrations/workflows/new');
  }, [navigate]);

  // Check if an integration is connected
  const isConnected = useCallback((integrationId: number) => {
    return connectionsData?.results.some(conn => conn.integration === integrationId) || false;
  }, [connectionsData]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Plug className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Integrations Workspace</h1>
            <p className="text-sm text-slate-500">
              Manage your active connections and automation workflows ({connectionsData?.count || 0} active).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
          <Button onClick={handleCreateWorkflow} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <Plus className="h-4 w-4 mr-1.5" /> New Workflow
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="bg-slate-100/50 border border-slate-200/60 p-1 mb-2">
          <TabsTrigger value="available" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">App Marketplace</TabsTrigger>
          <TabsTrigger value="connected" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Connected Apps</TabsTrigger>
          <TabsTrigger value="workflows" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Active Workflows</TabsTrigger>
        </TabsList>

        {/* Available Integrations Tab */}
        <TabsContent value="available" className="mt-4">
          {integrationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              ))}
            </div>
          ) : integrationsError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl text-center py-12">
              <p className="text-sm font-medium text-red-600">Failed to load integration marketplace.</p>
              <Button variant="outline" size="sm" className="mt-4 bg-white" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          ) : !integrationsData?.results?.length ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl py-16 text-center">
              <Plug className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-lg font-medium text-slate-600">No Integrations Available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {integrationsData.results.map((integration) => (
                <div key={integration.id} className="relative group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[80px] -z-10 group-hover:scale-110 transition-transform"></div>

                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">
                      {integration.logo_url ? (
                        <img src={integration.logo_url} alt={integration.name} className="h-8 w-8 object-contain" />
                      ) : (
                        <Plug className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                    {isConnected(integration.id) && (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium tracking-wide">
                        <Check className="w-3 h-3 mr-1" /> Connected
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mb-1.5">{integration.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
                    {integration.description || `Integrate ${integration.name} directly into your workflow.`}
                  </p>

                  <div className="mt-auto">
                    <Button
                      variant={isConnected(integration.id) ? 'outline' : 'default'}
                      className={`w-full ${isConnected(integration.id) ? 'bg-white hover:bg-slate-50 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
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
                <div key={i} className="flex items-center justify-between p-4 border rounded-xl bg-white">
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
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl py-16 text-center">
              <Check className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-lg font-medium text-slate-600 mb-1">No Connected Apps</p>
              <p className="text-sm text-slate-500 mb-4">Connect apps from the marketplace to build workflows.</p>
              <Button onClick={() => setActiveTab('available')} className="bg-indigo-600 hover:bg-indigo-700">
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {connectionsData.results.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                      {connection.integration_details?.logo_url ? (
                        <img src={connection.integration_details.logo_url} alt={connection.name} className="h-6 w-6 object-contain" />
                      ) : (
                        <Plug className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-800">{connection.name}</p>
                      <p className="text-sm font-medium text-slate-500">
                        Via {connection.integration_details?.name || 'Manual'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={connection.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-300'}>
                      {connection.is_active ? 'Active' : 'Offline'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
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
                <div key={i} className="p-5 border rounded-xl bg-white">
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
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl py-16 text-center">
              <Workflow className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-lg font-medium text-slate-600 mb-1">No Active Workflows</p>
              <p className="text-sm text-slate-500 mb-4">Create automated tasks between your connected applications.</p>
              <Button onClick={handleCreateWorkflow} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create New Workflow
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {workflowsData.results.map((workflow) => (
                <div
                  key={workflow.id}
                  className="bg-white p-5 border border-slate-200 rounded-xl hover:shadow-lg transition-all cursor-pointer relative group flex flex-col h-full"
                  onClick={() => navigate(`/integrations/workflows/${workflow.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity rounded-xl"></div>

                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <h3 className="text-[15px] font-bold text-slate-800 tracking-tight leading-tight flex-1 pr-3">{workflow.name}</h3>
                    <Badge variant="outline" className={`shrink-0 ${workflow.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {workflow.is_active ? 'Running' : 'Paused'}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-500 mb-5 line-clamp-2 relative z-10 flex-1">
                    {workflow.description || "Automated background task linking external modules."}
                  </p>

                  <div className="flex items-center gap-2 mt-auto relative z-10 pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/integrations/workflows/${workflow.id}`);
                      }}
                    >
                      <Workflow className="w-3.5 h-3.5 mr-1.5" /> Edit Flow
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white hover:bg-slate-50 text-slate-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/integrations/workflows/${workflow.id}/logs`);
                      }}
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
