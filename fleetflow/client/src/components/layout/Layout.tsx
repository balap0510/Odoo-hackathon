import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import {
    LayoutDashboard,
    Truck,
    Users,
    MapPin,
    Wrench,
    Fuel,
    BarChart,
    LogOut
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
    { title: 'Command Center', href: '/', icon: LayoutDashboard },
    { title: 'Vehicles', href: '/vehicles', icon: Truck },
    { title: 'Drivers', href: '/drivers', icon: Users },
    { title: 'Trip Dispatcher', href: '/trips', icon: MapPin },
    { title: 'Maintenance', href: '/maintenance', icon: Wrench },
    { title: 'Fuel & Expenses', href: '/fuel', icon: Fuel },
    { title: 'Analytics', href: '/analytics', icon: BarChart },
]

export default function Layout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col">
                <div className="h-16 flex items-center px-6 bg-slate-950 font-bold text-lg text-white tracking-widest gap-3">
                    <Truck className="w-5 h-5 text-blue-500" />
                    FLEETFLOW
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/')
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                                    isActive ? "bg-blue-600/10 text-blue-500 font-medium" : "hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.title}
                            </Link>
                        )
                    })}
                </div>

                <div className="p-4 bg-slate-950 border-t border-slate-800">
                    <div className="text-sm pb-3">
                        <p className="font-semibold text-white">{user?.email}</p>
                        <p className="text-xs text-slate-500 uppercase">{user?.role.replace('_', ' ')}</p>
                    </div>
                    <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleLogout}>
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 z-10">
                    <h1 className="text-xl font-semibold text-slate-800">
                        {navItems.find(item => item.href === location.pathname)?.title || 'Fleet Dashboard'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                        <span className="text-sm text-slate-500 font-medium">System Online</span>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 relative">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
