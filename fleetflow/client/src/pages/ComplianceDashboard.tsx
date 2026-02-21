import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, ShieldAlert, FileWarning, CheckCircle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ComplianceDashboard() {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const fetchDashboard = async () => {
            const response = await api.get('/compliance/dashboard')
            setData(response.data)
        }
        fetchDashboard()
    }, [])

    if (!data) return <div className="p-8 text-center text-slate-500">Loading Compliance Data...</div>

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-red-50 border-red-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-red-600 font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Expired Licenses
                        </CardDescription>
                        <CardTitle className="text-4xl text-red-700">{data.metrics.expiredCount}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-orange-50 border-orange-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-orange-600 font-semibold flex items-center gap-2">
                            <FileWarning className="w-4 h-4" /> Expiring &lt; 30 Days
                        </CardDescription>
                        <CardTitle className="text-4xl text-orange-700">{data.metrics.expiringCount}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-slate-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-600 font-semibold flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" /> Suspended Drivers
                        </CardDescription>
                        <CardTitle className="text-4xl">{data.metrics.suspendedCount}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-emerald-50 border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-emerald-700 font-semibold flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Compliance Rate
                        </CardDescription>
                        <CardTitle className="text-4xl text-emerald-700">{data.metrics.compliancePercentage}%</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Suspended Drivers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Suspended Drivers</CardTitle>
                    <CardDescription>Drivers actively blocked from dispatch</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>License No.</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Safety Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.suspendedDrivers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-slate-500 py-6">No suspended drivers.</TableCell>
                                </TableRow>
                            ) : (
                                data.suspendedDrivers.map((driver: any) => (
                                    <TableRow key={driver.id}>
                                        <TableCell className="font-medium">{driver.name}</TableCell>
                                        <TableCell>{driver.licenseNumber}</TableCell>
                                        <TableCell className="text-red-500">{driver.suspensionReason}</TableCell>
                                        <TableCell>{driver.safetyScore}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
