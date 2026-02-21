import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface KPIs {
    totalFleet: number
    activeFleet: number
    maintenanceAlerts: number
    utilizationRate: string
    pendingCargo: number
}

// Dummy chart data since requirement asks for charts but no specific time-series endpoint exists yet
const dummyChartData = [
    { name: 'Mon', trips: 12 },
    { name: 'Tue', trips: 19 },
    { name: 'Wed', trips: 15 },
    { name: 'Thu', trips: 22 },
    { name: 'Fri', trips: 28 },
    { name: 'Sat', trips: 10 },
    { name: 'Sun', trips: 5 },
]

export default function Dashboard() {
    const [kpis, setKpis] = useState<KPIs | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchKPIs = async () => {
            try {
                const response = await api.get('/analytics/kpis')
                setKpis(response.data)
            } catch (error) {
                console.error('Failed to fetch KPIs', error)
            } finally {
                setLoading(false)
            }
        }
        fetchKPIs()
    }, [])

    if (loading || !kpis) {
        return <div className="text-center py-10 text-slate-500">Loading Dashboard...</div>
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase">Active Fleet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{kpis.activeFleet}</div>
                        <p className="text-sm text-slate-500 mt-1">Vehicles on trip ({kpis.totalFleet} total)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase">Maintenance Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${kpis.maintenanceAlerts > 0 ? 'text-amber-500' : 'text-slate-800'}`}>
                            {kpis.maintenanceAlerts}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Vehicles in shop</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase">Utilization Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-500">{kpis.utilizationRate}%</div>
                        <p className="text-sm text-slate-500 mt-1">Assigned / Total Fleet</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase">Pending Cargo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{kpis.pendingCargo} <span className="text-xl">kg</span></div>
                        <p className="text-sm text-slate-500 mt-1">Awaiting dispatch</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Weekly Trip Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dummyChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="trips" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
