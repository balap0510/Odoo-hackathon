import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Navigation, CheckCircle2 } from 'lucide-react'

export default function Trips() {
    const [trips, setTrips] = useState<any[]>([])
    const [vehicles, setVehicles] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
    const [selectedTrip, setSelectedTrip] = useState<any>(null)
    const [endOdometer, setEndOdometer] = useState('')

    const [formData, setFormData] = useState({
        vehicleId: '',
        driverId: '',
        cargoWeight: '',
        origin: '',
        destination: '',
        revenue: ''
    })

    const fetchData = async () => {
        try {
            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                api.get('/trips'),
                api.get('/vehicles?status=AVAILABLE'),
                api.get('/drivers?status=OFF_DUTY')
            ])
            setTrips(tripsRes.data)
            setVehicles(vehiclesRes.data)
            setDrivers(driversRes.data)
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
            await api.post('/trips', {
                ...formData,
                cargoWeight: Number(formData.cargoWeight),
                revenue: Number(formData.revenue)
            })
            setOpen(false)
            fetchData()
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to create trip')
        }
    }

    const handleDispatch = async (id: string) => {
        if (!confirm('Dispatch this trip?')) return
        try {
            await api.post(`/trips/${id}/dispatch`)
            fetchData()
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to dispatch')
        }
    }

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post(`/trips/${selectedTrip.id}/complete`, { endOdometer: Number(endOdometer) })
            setCompleteDialogOpen(false)
            setSelectedTrip(null)
            setEndOdometer('')
            fetchData()
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to complete trip')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-slate-100 text-slate-700'
            case 'DISPATCHED': return 'bg-blue-100 text-blue-700 border border-blue-200'
            case 'COMPLETED': return 'bg-green-100 text-green-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Trip Dispatcher</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4" /> Create Trip</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Trip</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Vehicle</Label>
                                <Select onValueChange={v => setFormData({ ...formData, vehicleId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select available vehicle" /></SelectTrigger>
                                    <SelectContent>
                                        {vehicles.map(v => (
                                            <SelectItem key={v.id} value={v.id}>{v.name} ({v.licensePlate} / Max: {v.maxCapacityKg}kg)</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Driver</Label>
                                <Select onValueChange={v => setFormData({ ...formData, driverId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select available driver" /></SelectTrigger>
                                    <SelectContent>
                                        {drivers.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name} ({d.licenseCategory})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Origin</Label>
                                    <Input required value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Destination</Label>
                                    <Input required value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cargo Weight (kg)</Label>
                                    <Input type="number" required value={formData.cargoWeight} onChange={e => setFormData({ ...formData, cargoWeight: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Expected Revenue ($)</Label>
                                    <Input type="number" required value={formData.revenue} onChange={e => setFormData({ ...formData, revenue: e.target.value })} />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Create Draft Trip</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Trip</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleComplete} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Final Odometer Reading</Label>
                            <Input type="number" required value={endOdometer} onChange={e => setEndOdometer(e.target.value)} placeholder={`Must be > ${selectedTrip?.startOdometer}`} />
                            <p className="text-xs text-slate-500">Starting Odometer was {selectedTrip?.startOdometer}</p>
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Mark Completed</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Route</th>
                                <th className="px-6 py-4">Vehicle & Driver</th>
                                <th className="px-6 py-4">Cargo & Revenue</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trips.map(t => (
                                <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{t.origin}</div>
                                        <div className="text-slate-500 text-xs">to {t.destination}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{t.vehicle.name} <span className="text-slate-500 text-xs">({t.vehicle.licensePlate})</span></div>
                                        <div className="text-slate-500 text-xs">{t.driver.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{t.cargoWeight} kg</div>
                                        <div className="text-green-600 text-xs font-medium">${t.revenue}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(t.status)}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {t.status === 'DRAFT' && (
                                            <Button size="sm" onClick={() => handleDispatch(t.id)} className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                <Navigation className="w-4 h-4 mr-1" /> Dispatch
                                            </Button>
                                        )}
                                        {t.status === 'DISPATCHED' && (
                                            <Button size="sm" onClick={() => { setSelectedTrip(t); setCompleteDialogOpen(true) }} className="bg-green-100 text-green-700 hover:bg-green-200">
                                                <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {trips.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No trips found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
