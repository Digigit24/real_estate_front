import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAnalytics } from '@/hooks/useAnalytics';
import { BarChart3, Building, DollarSign, Megaphone, RefreshCw, Target, TrendingUp, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '0.0%';
  return `${value.toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Skeleton helpers
// ---------------------------------------------------------------------------

function OverviewCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-20 mb-2" />
        <Skeleton className="h-3 w-36" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function BarChartSkeleton({ bars = 5 }: { bars?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function Analytics() {
  const [periodDays, setPeriodDays] = useState<number>(30);

  const {
    useOverview,
    useSalesFunnel,
    useRevenue,
    useAgentLeaderboard,
    useLeadSources,
  } = useAnalytics();

  const queryParams = { days: periodDays };

  const { data: overview, isLoading: overviewLoading, mutate: refreshOverview } = useOverview();
  const { data: funnel, isLoading: funnelLoading, mutate: refreshFunnel } = useSalesFunnel(queryParams);
  const { data: revenue, isLoading: revenueLoading, mutate: refreshRevenue } = useRevenue(queryParams);
  const { data: agentLeaderboard, isLoading: agentsLoading, mutate: refreshAgents } = useAgentLeaderboard(queryParams);
  const { data: leadSources, isLoading: sourcesLoading, mutate: refreshSources } = useLeadSources(queryParams);

  const isAnyLoading = overviewLoading || funnelLoading || revenueLoading || agentsLoading || sourcesLoading;

  function handleRefresh() {
    refreshOverview();
    refreshFunnel();
    refreshRevenue();
    refreshAgents();
    refreshSources();
  }

  // Derived values for funnel chart scaling
  const maxFunnelCount = funnel?.stages?.length
    ? Math.max(...funnel.stages.map((s) => s.lead_count), 1)
    : 1;

  // Derived values for revenue trend chart scaling
  const maxTrendValue = revenue?.monthly_trend?.length
    ? Math.max(...revenue.monthly_trend.map((m) => m.value), 1)
    : 1;

  return (
    <div className="flex-1 p-6 overflow-auto space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive overview of sales, inventory, and agent performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={String(periodDays)}
            onValueChange={(val) => setPeriodDays(Number(val))}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isAnyLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnyLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ---------- Overview Cards ---------- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewLoading ? (
          <>
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
          </>
        ) : overview ? (
          <>
            {/* Total Units */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.inventory.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {overview.inventory.available} available &middot; {overview.inventory.booked} booked &middot; {overview.inventory.sold} sold
                </p>
              </CardContent>
            </Card>

            {/* Total Leads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.leads.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {overview.leads.new_today} new today &middot; {formatPercent(overview.leads.conversion_rate)} conversion
                </p>
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overview.revenue.total_value)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(overview.revenue.collected)} collected &middot; {formatCurrency(overview.revenue.pending)} pending
                </p>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activity</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.activity.site_visits_last_7_days}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  site visits (7d) &middot; {overview.activity.payments_due_next_7_days} payments due
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
            No overview data available.
          </div>
        )}
      </div>

      {/* ---------- Sales Funnel + Revenue Trend ---------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Funnel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Sales Funnel</CardTitle>
            </div>
            {funnel && (
              <Badge variant="secondary" className="text-xs font-normal">
                {funnel.total_leads} total &middot; {formatPercent(funnel.overall_conversion_rate)} conversion
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {funnelLoading ? (
              <BarChartSkeleton bars={6} />
            ) : funnel?.stages?.length ? (
              <div className="space-y-3">
                {funnel.stages.map((stage) => {
                  const pct = (stage.lead_count / maxFunnelCount) * 100;
                  return (
                    <div key={stage.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stage.name}</span>
                        <span className="text-muted-foreground tabular-nums">{stage.lead_count}</span>
                      </div>
                      <div className="h-4 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(pct, 2)}%`,
                            backgroundColor: stage.color_hex || 'hsl(var(--primary))',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No funnel data available for this period.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
            </div>
            {revenue && (
              <Badge variant="secondary" className="text-xs font-normal">
                {formatCurrency(revenue.total_value)} total
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <BarChartSkeleton bars={6} />
            ) : revenue?.monthly_trend?.length ? (
              <div className="space-y-3">
                {revenue.monthly_trend.map((month) => {
                  const pct = (month.value / maxTrendValue) * 100;
                  return (
                    <div key={month.month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {month.bookings} bookings
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            {formatCurrency(month.value)}
                          </span>
                        </div>
                      </div>
                      <div className="h-4 rounded-full bg-primary/20">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No revenue trend data available for this period.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------- Agent Leaderboard ---------- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Agent Leaderboard</CardTitle>
          </div>
          {agentLeaderboard && (
            <Badge variant="secondary" className="text-xs font-normal">
              {agentLeaderboard.count} agents
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : agentLeaderboard?.results?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Leads Assigned</TableHead>
                  <TableHead className="text-right">Site Visits</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentLeaderboard.results.map((agent) => (
                  <TableRow key={agent.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        {agent.rank <= 3 ? (
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${agent.rank === 1
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                                : agent.rank === 2
                                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                              }`}
                          >
                            {agent.rank}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{agent.rank}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{agent.name || `Agent ${agent.user_id}`}</TableCell>
                    <TableCell className="text-right tabular-nums">{agent.leads_assigned}</TableCell>
                    <TableCell className="text-right tabular-nums">{agent.site_visits}</TableCell>
                    <TableCell className="text-right tabular-nums">{agent.bookings}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={agent.conversion_rate >= 20 ? 'default' : 'secondary'}
                        className="tabular-nums"
                      >
                        {formatPercent(agent.conversion_rate)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No agent performance data available for this period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- Lead Source ROI ---------- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Lead Source ROI</CardTitle>
          </div>
          {leadSources && (
            <Badge variant="secondary" className="text-xs font-normal">
              {leadSources.results.length} sources
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {sourcesLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : leadSources?.results?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Site Visits</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Visit Rate</TableHead>
                  <TableHead className="text-right">Booking Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadSources.results.map((source) => (
                  <TableRow key={source.source}>
                    <TableCell className="font-medium">{source.source}</TableCell>
                    <TableCell className="text-right tabular-nums">{source.leads}</TableCell>
                    <TableCell className="text-right tabular-nums">{source.site_visits}</TableCell>
                    <TableCell className="text-right tabular-nums">{source.bookings}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="tabular-nums">
                        {formatPercent(source.visit_rate)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={source.booking_rate >= 10 ? 'default' : 'secondary'}
                        className="tabular-nums"
                      >
                        {formatPercent(source.booking_rate)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No lead source data available for this period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
