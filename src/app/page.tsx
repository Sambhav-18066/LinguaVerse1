import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { RecentSessions } from '@/components/dashboard/recent-sessions';
import { Activity, BookOpen, Clock, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Sessions" value="124" icon={Activity} />
        <StatsCard title="Avg. Fluency (WPM)" value="87" icon={TrendingUp} description="+2.1 from last month" />
        <StatsCard title="Avg. Lexical Richness" value="6.3" icon={BookOpen} description="+0.5 from last month" />
        <StatsCard title="Total Practice Time" value="21h 45m" icon={Clock} />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSessions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
