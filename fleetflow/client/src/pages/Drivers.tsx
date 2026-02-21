import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'

interface Driver {
    id: string
    name: string
    licenseNumber: string
    licenseExpiryDate: string
    licenseCategory: string
    safetyScore: number
    status: string
}

export default function Drivers() {
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        licenseNumber: '',
        licenseExpiryDate: '',
        licenseCategory: '',
    })

    const fetchDrivers = async () => {
        try {
            const { data } = await api.get('/drivers')
            setDrivers(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDrivers()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/drivers', formData)
            setOpen(false)
            fetchDrivers()
            setFormData({ name: '', licenseNumber: '', licenseExpiryDate: '', licenseCategory: '' })
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to add driver')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this driver?')) return
        try {
            await api.delete(`/drivers/${id}`)
            fetchDrivers()
        } catch (error) {
            alert('Failed to delete')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ON_DUTY': return 'bg-blue-100 text-blue-700'
            case 'OFF_DUTY': return 'bg-slate-100 text-slate-700'
            case 'SUSPENDED': return 'bg-red-100 text-red-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Driver Management</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="w-4 h-4" /> Add Driver</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Driver</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>License Number</Label>
                                <Input required value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>License Expiry Date</Label>
                                <Input type="date" required value={formData.licenseExpiryDate} onChange={e => setFormData({ ...formData, licenseExpiryDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>License Category</Label>
                                <Input required placeholder="e.g. CDL-A" value={formData.licenseCategory} onChange={e => setFormData({ ...formData, licenseCategory: e.target.value })} />
                            </div>
                            <Button type="submit" className="w-full">Save Driver</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Driver Name</th>
                                <th className="px-6 py-4">License Details</th>
                                <th className="px-6 py-4">Safety Score</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map(d => (
                                <tr key={d.id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{d.name}</td>
                                    <td className="px-6 py-4">
                                        <div>{d.licenseNumber} ({d.licenseCategory})</div>
                                        <div className="text-xs text-slate-500">Exp: {new Date(d.licenseExpiryDate).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-slate-200 rounded-full h-2">
                                                <div className={`h-2 rounded-full ${d.safetyScore >= 90 ? 'bg-green-500' : d.safetyScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${d.safetyScore}%` }}></div>
                                            </div>
                                            <span className="text-xs font-medium">{d.safetyScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>
                                            {d.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)} className="text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {drivers.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No drivers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
