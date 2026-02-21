import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

export default function Fuel() {
    const [logs, setLogs] = useState<any[]>([])
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    const [formData, setFormData] = useState({
        vehicleId: '',
        liters: '',
        cost: '',
        date: new Date().toISOString().split('T')[0]
    })

    const fetchData = async () => {
        try {
            const [logsRes, vehiclesRes] = await Promise.all([
                api.get('/fuel'),
                api.get('/vehicles')
            ])
            setLogs(logsRes.data)
            setVehicles(vehiclesRes.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/fuel', {
                ...formData,
                liters: Number(formData.liters),
                cost: Number(formData.cost)
            })
            setOpen(false)
            fetchData()
            setFormData({ ...formData, liters: '', cost: '' })
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to log fuel')
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Fuel Logs</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4" /> Log Fuel</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log Fuel Expense</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Vehicle</Label>
                                <Select onValueChange={v => setFormData({ ...formData, vehicleId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                                    <SelectContent>
                                        {vehicles.map(v => (
                                            <SelectItem key={v.id} value={v.id}>{v.name} ({v.licensePlate})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Liters</Label>
                                    <Input type="number" required value={formData.liters} onChange={e => setFormData({ ...formData, liters: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Cost ($)</Label>
                                    <Input type="number" required value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Save Fuel Log</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Volume (Liters)</th>
                                <th className="px-6 py-4">Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="px-6 py-4">{new Date(log.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium">{log.vehicle?.name} <span className="text-slate-500 text-xs">({log.vehicle?.licensePlate})</span></td>
                                    <td className="px-6 py-4">{log.liters} L</td>
                                    <td className="px-6 py-4 text-emerald-600 font-medium">${log.cost}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No fuel logs found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
