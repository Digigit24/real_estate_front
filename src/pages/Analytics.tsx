import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  Building,
  DollarSign,
  Megaphone,
  RefreshCw,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Activity,
  PieChart as PieChartIcon,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number | undefined | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) return '0.0%';
  return `${value.toFixed(1)}%`;
};

export function Analytics() {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const { useOverview, useSalesFunnel, useRevenue, useAgentLeaderboard, useLeadSources, useInventoryAnalytics } = useAnalytics();

  const queryParams = { days: periodDays };

  const { data: overview, isLoading: overviewLoading, mutate: refreshOverview } = useOverview();
  const { data: funnel, isLoading: funnelLoading, mutate: refreshFunnel } = useSalesFunnel(queryParams);
  const { data: revenue, isLoading: revenueLoading, mutate: refreshRevenue } = useRevenue(queryParams);
  const { data: agentLeaderboard, isLoading: agentsLoading, mutate: refreshAgents } = useAgentLeaderboard(queryParams);
  const { data: leadSources, isLoading: sourcesLoading, mutate: refreshSources } = useLeadSources(queryParams);
  const { data: inventory, isLoading: inventoryLoading, mutate: refreshInventory } = useInventoryAnalytics(queryParams);

  const isAnyLoading = overviewLoading || funnelLoading || revenueLoading || agentsLoading || sourcesLoading || inventoryLoading;

  const handleRefresh = () => {
    refreshOverview();
    refreshFunnel();
    refreshRevenue();
    refreshAgents();
    refreshSources();
    refreshInventory();
  };

  // Prepare chart data
  const funnelChartData = funnel?.stages?.map(s => ({
    name: s.name,
    Leads: s.lead_count,
    fill: s.color_hex || '#8884d8'
  })) || [];

  const revenueChartData = revenue?.monthly_trend?.map(m => ({
    name: m.month,
    Revenue: m.value,
    Bookings: m.bookings
  })) || [];

  // Colors for pie chart
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

  let inventoryData: any[] = [];
  if (inventory) {
    if (Array.isArray(inventory)) {
      // If the backend returns an array of projects
      inventoryData = inventory.map((p: any) => ({
        name: p.project_name || `Project ${p.project_id}`,
        Available: p.available,
        Booked: p.booked + p.sold + p.reserved,
        Total: p.total
      }));
    } else {
      // Single global inventory object
      inventoryData = [
        { name: 'Available', value: inventory.available },
        { name: 'Booked', value: inventory.booked },
        { name: 'Sold', value: inventory.sold },
        { name: 'Reserved', value: inventory.reserved },
        { name: 'Blocked', value: inventory.blocked }
      ].filter(item => item.value > 0);
    }
  }

  const StatCard = ({ title, value, subtext, icon: Icon, color, loading }: any) => (
    <Card className={`relative overflow-hidden bg-white/70 backdrop-blur-xl border border-${color}-100 shadow-sm hover:shadow-md transition-all`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50/50 rounded-bl-[100px] -z-10`} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
            {loading ? (
              <div className="h-9 w-24 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <h3 className={`text-3xl font-black text-slate-800 mt-2`}>{value}</h3>
            )}
            <p className="text-xs font-medium text-slate-500 mt-2 flex items-center">
              {subtext}
            </p>
          </div>
          <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-600" /> Executive Analytics
          </h1>
          <p className="text-muted-foreground mt-1.5 font-medium">Real-time KPI metrics and conversion dashboards.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 p-2 rounded-xl backdrop-blur-sm border border-slate-200">
          <Select value={String(periodDays)} onValueChange={(val) => setPeriodDays(Number(val))}>
            <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 font-medium text-indigo-900 bg-transparent">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last 365 Days</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-px h-6 bg-slate-200"></div>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isAnyLoading} className="text-indigo-600 hover:bg-indigo-50">
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnyLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={overview ? formatCurrency(overview.revenue.total_value) : '$0'}
          subtext={overview ? <><ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" /> {formatCurrency(overview.revenue.collected)} collected</> : 'Loading...'}
          icon={DollarSign}
          color="emerald"
          loading={overviewLoading}
        />
        <StatCard
          title="Active Leads"
          value={overview ? overview.leads.total.toLocaleString() : '0'}
          subtext={overview ? <><ArrowUpRight className="w-3 h-3 text-blue-500 mr-1" /> {overview.leads.new_today} new today</> : 'Loading...'}
          icon={Users}
          color="blue"
          loading={overviewLoading}
        />
        <StatCard
          title="Conversion Rate"
          value={overview ? formatPercent(overview.leads.conversion_rate) : '0%'}
          subtext={overview ? `${overview.leads.won} total conversions` : 'Loading...'}
          icon={Target}
          color="purple"
          loading={overviewLoading}
        />
        <StatCard
          title="Available Units"
          value={overview ? overview.inventory.available.toLocaleString() : '0'}
          subtext={overview ? `Out of ${overview.inventory.total} total units` : 'Loading...'}
          icon={Building}
          color="amber"
          loading={overviewLoading}
        />
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card className="border border-slate-200/60 shadow-md rounded-2xl overflow-hidden bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Revenue Trend</h2>
            </div>
            {revenue && <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">{formatCurrency(revenue.total_value)} Total</Badge>}
          </div>
          <div className="p-6 h-[350px]">
            {revenueLoading ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse bg-slate-50/50 rounded-xl">Loading...</div>
            ) : revenueChartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No trend data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Sales Funnel */}
        <Card className="border border-slate-200/60 shadow-md rounded-2xl overflow-hidden bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Sales Funnel</h2>
            </div>
            {funnel && <Badge variant="secondary" className="bg-purple-50 text-purple-700">{formatPercent(funnel.overall_conversion_rate)} Conversion</Badge>}
          </div>
          <div className="p-6 h-[350px]">
            {funnelLoading ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse bg-slate-50/50 rounded-xl">Loading...</div>
            ) : funnelChartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No funnel data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelChartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontWeight: 600, fontSize: 13 }} width={120} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Leads" radius={[0, 6, 6, 0]} barSize={28}>
                    {funnelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Inventory Breakdown */}
        <Card className="border border-slate-200/60 shadow-md rounded-2xl overflow-hidden bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Inventory Distribution</h2>
          </div>
          <div className="p-6 h-[320px]">
            {inventoryLoading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">Loading...</div>
            ) : Array.isArray(inventoryData) && inventoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {inventoryData[0].Total !== undefined ? ( // If it's the project-level array
                  <BarChart data={inventoryData.slice(0, 5)} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="Available" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={32} />
                    <Bar dataKey="Booked" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : ( // Global object pie chart
                  <PieChart>
                    <Pie data={inventoryData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 mt-20">No inventory data.</div>
            )}
          </div>
        </Card>

        {/* Lead Source ROI */}
        <Card className="lg:col-span-2 border border-slate-200/60 shadow-md rounded-2xl overflow-hidden bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Lead Source ROI</h2>
            </div>
          </div>
          <div className="overflow-x-auto p-0">
            <Table>
              <TableHeader className="bg-slate-50/80 hover:bg-slate-50 border-b border-slate-100">
                <TableRow>
                  <TableHead className="py-4 font-semibold text-slate-600 pl-6">Source Channel</TableHead>
                  <TableHead className="py-4 font-semibold text-slate-600 text-right">Leads</TableHead>
                  <TableHead className="py-4 font-semibold text-slate-600 text-right">Site Visits</TableHead>
                  <TableHead className="py-4 font-semibold text-slate-600 text-right">Bookings</TableHead>
                  <TableHead className="py-4 font-semibold text-slate-600 text-right">Visit Rate</TableHead>
                  <TableHead className="py-4 font-semibold text-slate-600 text-right pr-6">Booking Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sourcesLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400 animate-pulse">Loading sources...</TableCell></TableRow>
                ) : leadSources?.results?.length ? (
                  leadSources.results.map((source) => (
                    <TableRow key={source.source} className="hover:bg-slate-50/50">
                      <TableCell className="font-semibold text-slate-800 pl-6">{source.source.replace(/_/g, ' ').toUpperCase()}</TableCell>
                      <TableCell className="text-right font-medium text-slate-600">{source.leads}</TableCell>
                      <TableCell className="text-right font-medium text-slate-600">{source.site_visits}</TableCell>
                      <TableCell className="text-right font-bold text-slate-800">{source.bookings}</TableCell>
                      <TableCell className="text-right">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold">{formatPercent(source.visit_rate)}</span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge className={source.booking_rate >= 10 ? 'bg-emerald-100 text-emerald-700 border-none' : 'bg-slate-100 text-slate-600 border-none'}>
                          {formatPercent(source.booking_rate)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">No source data.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Agent Leaderboard */}
      <Card className="border border-slate-200/60 shadow-md rounded-2xl overflow-hidden bg-white">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Team Performance Leaderboard</h2>
          </div>
        </div>
        <div className="overflow-x-auto p-0">
          <Table>
            <TableHeader className="bg-slate-50/80 hover:bg-slate-50 border-b border-slate-100">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-600 pl-6 w-16">Rank</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600">Sales Agent</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600 text-right">Leads Claimed</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600 text-right">Site Visits</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600 text-right">Total Bookings</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600 text-right pr-6">Conversion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentsLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400 animate-pulse">Loading leaderboard...</TableCell></TableRow>
              ) : agentLeaderboard?.results?.length ? (
                agentLeaderboard.results.map((agent) => (
                  <TableRow key={agent.user_id} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6">
                      {agent.rank <= 3 ? (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                                                    ${agent.rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            agent.rank === 2 ? 'bg-slate-200 text-slate-600 border border-slate-300' :
                              'bg-orange-100 text-orange-700 border border-orange-200'}
                                                `}>
                          #{agent.rank}
                        </div>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center font-semibold text-slate-400">
                          #{agent.rank}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-slate-800">{agent.name || `User ID ${agent.user_id}`}</TableCell>
                    <TableCell className="text-right font-medium text-slate-600">{agent.leads_assigned}</TableCell>
                    <TableCell className="text-right font-medium text-slate-600">{agent.site_visits}</TableCell>
                    <TableCell className="text-right font-black text-slate-800">{agent.bookings}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge className={agent.conversion_rate >= 15 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}>
                        {formatPercent(agent.conversion_rate)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">No agent performance data.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
