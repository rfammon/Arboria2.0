
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface ReportStatsProps {
    stats: {
        riskDistribution: Array<{ name: string; value: number; color: string }>;
        speciesDistribution: Array<{ name: string; value: number }>;
    };
    className?: string;
    id?: string; // For html2canvas capture targeting
}

export function ReportStats({ stats, className, id }: ReportStatsProps) {
    return (
        <div id={id} className={`grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg ${className}`}>
            {/* Risk Chart */}
            <Card className="shadow-none border-0">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-sm font-medium text-center">Distribuição de Risco</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] p-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.riskDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.riskDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36} />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Species Chart */}
            <Card className="shadow-none border-0">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-sm font-medium text-center">Top 5 Espécies</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] p-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.speciesDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Hidden disclaimer for screenshot context */}
            <div className="md:col-span-2 text-center text-xs text-muted-foreground mt-4">
                Gráficos gerados automaticamente pelo sistema ArborIA.
            </div>
        </div>
    );
}
