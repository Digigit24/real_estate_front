import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, TrendingUp, IndianRupee, PieChart, CalendarClock, Target,
  MapPin, Clock, ArrowRight, Zap, CheckCircle2, ChevronRight, Activity, Building, Briefcase
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RechartsPieChart, Pie, Legend
} from 'recharts';
import { format, parseISO, isPast, isToday, addDays } from 'date-fns';

import { analyticsService } from '@/services/analyticsService';
import { useCRM } from '@/hooks/useCRM';
import { useMeeting } from '@/hooks/useMeeting';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState(30);

  // Fetch Analytics Overview Data (KPIs)
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics_overview', timeRange],
    queryFn: () => analyticsService.getOverview()
  });

  // Fetch Funnel Data
  const { data: funnel, isLoading: funnelLoading } = useQuery({
    queryKey: ['analytics_funnel', timeRange],
    queryFn: () => analyticsService.getSalesFunnel({ days: timeRange })
  });

  // Fetch Revenue Trends
  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics_revenue', timeRange],
    queryFn: () => analyticsService.getRevenue({ days: timeRange })
  });

  // Inventory Allocation
  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ['analytics_inventory'],
    queryFn: () => analyticsService.getInventoryAnalytics()
  });

  // CRM Data strictly for operational widgets (Recent Tasks, Meetings)
  const { useTasks } = useCRM();
  const { useUpcomingMeetings } = useMeeting();
  const { data: tasksData, isLoading: tasksLoading } = useTasks({ page: 1, page_size: 5, status: 'TODO' });
  const { data: meetingsData, isLoading: meetingsLoading } = useUpcomingMeetings({ page: 1, page_size: 5 });

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const tasks = tasksData?.results || [];
  const meetings = meetingsData?.results || [];

  const inventoryPieData = inventory ? [
    { name: 'Available', value: inventory.available, color: '#3b82f6' }, // blue
    { name: 'Booked', value: inventory.booked, color: '#8b5cf6' },       // purple
    { name: 'Reserved', value: inventory.reserved, color: '#f59e0b' },   // amber
    { name: 'Sold', value: inventory.sold, color: '#10b981' }            // emerald
  ] : [];

  const revenueAreaChartData = revenue?.monthly_trend || [];
  const funnelBarData = funnel?.stages?.filter(s => s.name !== 'LOST') || [];

  return (
    <div className="flex-1 p-6 overflow-x-hidden overflow-y-auto bg-slate-950 text-slate-200 min-h-screen relative selection:bg-indigo-500/30 font-sans animate-in fade-in zoom-in-95 duration-500">

      {/* Background Aesthetics */}
      <div className="absolute top-0 right-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-black pointer-events-none z-0 w-full h-full" />
      <div className="absolute top-1/4 left-[-100px] w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8 pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">Builder Admin Console</h1>
            <p className="text-slate-400 mt-1">Real-time overview of your real estate portfolio.</p>
          </div>
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
            {[7, 30, 90, 365].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${timeRange === days ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Top KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl shadow-2xl hover:bg-slate-800/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-400">Total Leads</p>
                  <h3 className="text-3xl font-bold text-slate-100">{overviewLoading ? '...' : overview?.leads.total || 0}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Users className="text-blue-400 w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-400 font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" /> +{overview?.leads.new_today || 0}
                </span>
                <span className="text-slate-500 ml-2">new today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl shadow-2xl hover:bg-slate-800/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-400">Total Revenue</p>
                  <h3 className="text-3xl font-bold text-emerald-400">{overviewLoading ? '...' : formatCurrency(overview?.revenue.collected)}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <IndianRupee className="text-emerald-400 w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-amber-400 font-medium">{formatCurrency(overview?.revenue.pending)}</span>
                <span className="text-slate-500 ml-2">pending</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl shadow-2xl hover:bg-slate-800/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-400">Conversion Rate</p>
                  <h3 className="text-3xl font-bold text-purple-400">{overviewLoading ? '...' : `${overview?.leads.conversion_rate || 0}%`}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <Target className="text-purple-400 w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-300 font-medium">Out of {overview?.leads.total || 0}</span>
                <span className="text-slate-500 ml-2">leads total</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl shadow-2xl hover:bg-slate-800/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-400">Inventory Status</p>
                  <h3 className="text-3xl font-bold text-indigo-400">{overviewLoading ? '...' : overview?.inventory.available || 0}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Building className="text-indigo-400 w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-300 font-medium">/{overview?.inventory.total || 0}</span>
                <span className="text-slate-500 ml-2">total units available</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue Area Chart */}
          <Card className="lg:col-span-2 bg-slate-900/40 border-slate-800/60 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-800/50">
              <div>
                <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" /> Revenue & Bookings Over Time
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">Monthly collection trend</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 h-[300px]">
              {revenueLoading ? (
                <div className="h-full flex items-center justify-center text-slate-500">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueAreaChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                      dx={-10}
                    />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                      itemStyle={{ color: '#818cf8' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Inventory Pie Chart */}
          <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-2 border-b border-slate-800/50">
              <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" /> Inventory Breakdown
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">Current status allocation</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-[300px] flex flex-col items-center justify-center">
              {invLoading ? (
                <div className="text-slate-500">Loading...</div>
              ) : inventoryPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={inventoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {inventoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-500">No inventory data</div>
              )}
            </CardContent>
          </Card>

          {/* Sales Funnel Chart */}
          <Card className="lg:col-span-1 border-slate-800/60 bg-slate-900/40 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-800/50">
              <div>
                <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" /> Sales Funnel Flow
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 h-[250px] lg:h-[300px]">
              {funnelLoading ? (
                <div className="h-full flex items-center justify-center text-slate-500">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={funnelBarData}
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                      cursor={{ fill: '#1e293b', opacity: 0.4 }}
                    />
                    <Bar dataKey="lead_count" radius={[0, 4, 4, 0]} barSize={20}>
                      {funnelBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color_hex || '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Operational Alerts & Upcoming Tasks */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Pending Tasks */}
            <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md shadow-2xl flex flex-col">
              <CardHeader className="border-b border-slate-800/50 pb-4 flex flex-row justify-between items-center">
                <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Action Required (Tasks)
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 px-2 h-7" onClick={() => navigate('/crm/tasks')}>View All</Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-auto max-h-[300px]">
                {tasksLoading ? (
                  <div className="p-6 text-center text-slate-500">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">No pending tasks!</div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {tasks.map(task => {
                      const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));
                      return (
                        <div key={task.id} className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer group" onClick={() => navigate('/crm/tasks')}>
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">{task.title}</p>
                            {task.priority && (
                              <Badge variant="outline" className={`text-[10px] ${task.priority === 'HIGH' ? 'text-red-400 border-red-500/30' : 'text-slate-400 border-slate-700'}`}>
                                {task.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            {task.lead_name && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {task.lead_name}</span>}
                            {task.due_date && <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400 font-medium' : ''}`}><Clock className="w-3 h-3" /> {format(parseISO(task.due_date), 'MMM dd')}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md shadow-2xl flex flex-col">
              <CardHeader className="border-b border-slate-800/50 pb-4 flex flex-row justify-between items-center">
                <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-purple-400" /> Upcoming Meetings
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-purple-400 hover:text-purple-300 px-2 h-7" onClick={() => navigate('/crm/meetings')}>View Agenda</Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-auto max-h-[300px]">
                {meetingsLoading ? (
                  <div className="p-6 text-center text-slate-500">Loading meetings...</div>
                ) : meetings.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">No scheduled meetings.</div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {meetings.map((meeting: any) => (
                      <div key={meeting.id} className="p-4 flex gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => navigate('/crm/meetings')}>
                        <div className="flex flex-col items-center justify-center bg-purple-500/10 border border-purple-500/20 rounded-lg w-12 h-12 shrink-0">
                          <span className="text-[10px] text-purple-400 font-medium uppercase">{format(parseISO(meeting.start_at), 'MMM')}</span>
                          <span className="text-lg font-bold text-slate-200">{format(parseISO(meeting.start_at), 'dd')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{meeting.title}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                            <span>{format(parseISO(meeting.start_at), 'hh:mm a')}</span>
                            {meeting.lead_name && <span className="truncate flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" /> {meeting.lead_name}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
