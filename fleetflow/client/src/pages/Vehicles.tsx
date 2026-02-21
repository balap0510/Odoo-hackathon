import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'

interface Vehicle {
    id: string
    name: string
    licensePlate: string
    maxCapacityKg: number
    odometer: number
    vehicleType: string
    status: string
}

export default function Vehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        licensePlate: '',
        maxCapacityKg: '',
        odometer: '',
        vehicleType: 'TRUCK',
        acquisitionCost: ''
    })

    const fetchVehicles = async () => {
        try {
            const { data } = await api.get('/vehicles')
            setVehicles(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVehicles()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/vehicles', {
                ...formData,
                maxCapacityKg: Number(formData.maxCapacityKg),
                odometer: Number(formData.odometer),
                acquisitionCost: Number(formData.acquisitionCost)
            })
            setOpen(false)
            fetchVehicles()
        } catch (error) {
            alert('Failed to add vehicle')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return
        try {
            await api.delete(`/vehicles/${id}`)
            fetchVehicles()
        } catch (error) {
            alert('Failed to delete')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-100 text-green-700'
            case 'ON_TRIP': return 'bg-blue-100 text-blue-700'
            case 'IN_SHOP': return 'bg-amber-100 text-amber-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Vehicle Registry</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="w-4 h-4" /> Add Vehicle</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Vehicle</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Model Name</Label>
                                    <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>License Plate</Label>
                                    <Input required value={formData.licensePlate} onChange={e => setFormData({ ...formData, licensePlate: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Capacity (kg)</Label>
                                    <Input type="number" required value={formData.maxCapacityKg} onChange={e => setFormData({ ...formData, maxCapacityKg: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Initial Odometer</Label>
                                    <Input type="number" required value={formData.odometer} onChange={e => setFormData({ ...formData, odometer: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Acquisition Cost ($)</Label>
                                    <Input type="number" required value={formData.acquisitionCost} onChange={e => setFormData({ ...formData, acquisitionCost: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={formData.vehicleType} onValueChange={v => setFormData({ ...formData, vehicleType: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TRUCK">Truck</SelectItem>
                                            <SelectItem value="VAN">Van</SelectItem>
                                            <SelectItem value="BIKE">Bike</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Save Vehicle</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Model / Type</th>
                                <th className="px-6 py-4">License Plate</th>
                                <th className="px-6 py-4">Capacity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(v => (
                                <tr key={v.id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {v.name}
                                        <div className="text-slate-500 text-xs">{v.vehicleType}</div>
                                    </td>
                                    <td className="px-6 py-4">{v.licensePlate}</td>
                                    <td className="px-6 py-4">{v.maxCapacityKg} kg</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(v.status)}`}>
                                            {v.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {vehicles.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No vehicles found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
