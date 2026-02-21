import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'

interface VehicleROI {
    id: string
    name: string
    licensePlate: string
    revenue: number
    operationalCost: number
    roi: number
}

export default function Analytics() {
    const [roiData, setRoiData] = useState<VehicleROI[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchROI = async () => {
            try {
                const { data } = await api.get('/analytics/roi')
                setRoiData(data)
            } finally {
                setLoading(false)
            }
        }
        fetchROI()
    }, [])

    const handleExportCSV = async () => {
        try {
            const response = await api.get('/analytics/export/csv', { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'fleet_analytics.csv')
            document.body.appendChild(link)
            link.click()
        } catch (error) {
            alert('Failed to export CSV')
        }
    }

    const handleExportPDF = async () => {
        try {
            const response = await api.get('/analytics/export/pdf', { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'fleet_analytics.pdf')
            document.body.appendChild(link)
            link.click()
        } catch (error) {
            alert('Failed to export PDF')
        }
    }

    if (loading) return <div>Loading Analytics...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Financial Analytics & Reporting</h2>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button onClick={handleExportPDF} className="gap-2 bg-red-600 hover:bg-red-700">
                        <FileText className="w-4 h-4" /> Export PDF
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Return on Investment (ROI)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Total Revenue</th>
                                <th className="px-6 py-4">Operational Costs</th>
                                <th className="px-6 py-4">Net Profit</th>
                                <th className="px-6 py-4 text-right">ROI (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roiData.map(v => (
                                <tr key={v.id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {v.name} <span className="text-slate-500 text-xs">({v.licensePlate})</span>
                                    </td>
                                    <td className="px-6 py-4 text-green-600">${v.revenue.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-red-500">${v.operationalCost.toFixed(2)}</td>
                                    <td className="px-6 py-4 font-medium">${(v.revenue - v.operationalCost).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2.5 py-1 ${v.roi >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-full font-bold`}>
                                            {v.roi}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {roiData.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No data available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
