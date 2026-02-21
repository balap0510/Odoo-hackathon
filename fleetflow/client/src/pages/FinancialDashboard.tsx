import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, TrendingDown, PieChart } from 'lucide-react'

export default function FinancialDashboard() {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const fetchDashboard = async () => {
            const response = await api.get('/financials/dashboard')
            setData(response.data)
        }
        fetchDashboard()
    }, [])

    if (!data) return <div className="p-8 text-center text-slate-500">Loading Financial Data...</div>

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-emerald-50 border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-emerald-700 font-semibold flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Total Revenue
                        </CardDescription>
                        <CardTitle className="text-4xl text-emerald-700">${data.metrics.totalRevenue.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-red-50 border-red-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-red-700 font-semibold flex items-center gap-2">
                            <PieChart className="w-4 h-4" /> Total Core Costs
                        </CardDescription>
                        <CardTitle className="text-4xl text-red-700">${data.metrics.totalCosts.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-orange-50 border-orange-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-orange-700 font-semibold flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" /> Avg Fuel Efficiency
                        </CardDescription>
                        <CardTitle className="text-4xl text-orange-700">{data.metrics.fuelEfficiency} <span className="text-xl">KM/L</span></CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-700 font-semibold flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" /> Avg Cost per KM
                        </CardDescription>
                        <CardTitle className="text-4xl text-blue-700">${data.metrics.costPerKm}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className={data.metrics.netProfit >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}>
                    <CardHeader className="pb-2">
                        <CardDescription className={data.metrics.netProfit >= 0 ? "text-emerald-700 font-semibold" : "text-red-700 font-semibold"}>
                            Net Profit / True ROI
                        </CardDescription>
                        <CardTitle className={`text-4xl gap-2 items-baseline flex ${data.metrics.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            ${data.metrics.netProfit.toLocaleString()}
                            <span className="text-lg opacity-80">({data.metrics.roiPercentage}%)</span>
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* In a real scenario we would render Recharts here for Revenue Trend and Cost Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        <li className="flex justify-between border-b pb-2">
                            <span className="text-slate-600">Maintenance</span>
                            <span className="font-medium">${data.costBreakdown.maintenance.toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between border-b pb-2">
                            <span className="text-slate-600">Fuel</span>
                            <span className="font-medium">${data.costBreakdown.fuel.toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-slate-600">Other Operations</span>
                            <span className="font-medium">${data.costBreakdown.other.toLocaleString()}</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
