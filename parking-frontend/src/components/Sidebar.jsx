import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from 'react-bootstrap'
import { useState } from 'react'

export default function Sidebar() {
    const { token, role, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [collapsed, setCollapsed] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const isActive = (path) => location.pathname === path

    const navItems = [
        { path: '/parking', label: 'Find Parking', icon: '🔍', roles: ['driver', 'admin'] },
        { path: '/my-reservations', label: 'My Reservations', icon: '📋', roles: ['driver', 'admin'], requireAuth: true },
        { path: '/admin', label: 'Dashboard', icon: '📊', roles: ['admin'] },
        { path: '/admin/lots', label: 'Manage Lots', icon: '🏢', roles: ['admin'] },
        { path: '/admin/reservations', label: 'All Reservations', icon: '📝', roles: ['admin'] },
        { path: '/admin/reports', label: 'Reports', icon: '📈', roles: ['admin'] },
    ]

    const filteredItems = navItems.filter(item => {
        if (item.requireAuth && !token) return false
        if (item.roles && !item.roles.includes(role)) return false
        return true
    })

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Sidebar Header */}
            <div className="sidebar-header">
                <Link to="/" className="sidebar-brand">
                    {!collapsed && (
                        <>
                            <span className="brand-icon">🅿️</span>
                            <span className="brand-text">Smart Parking</span>
                        </>
                    )}
                    {collapsed && <span className="brand-icon-only">🅿️</span>}
                </Link>
                <button
                    className="sidebar-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    {collapsed ? '→' : '←'}
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="sidebar-nav">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                        title={collapsed ? item.label : ''}
                    >
                        <span className="link-icon">{item.icon}</span>
                        {!collapsed && <span className="link-text">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                {!token ? (
                    <div className="auth-buttons">
                        <Button
                            as={Link}
                            to="/login"
                            variant="outline-light"
                            size="sm"
                            className="w-100 mb-2"
                        >
                            {!collapsed && 'Login'}
                            {collapsed && '🔑'}
                        </Button>
                        <Button
                            as={Link}
                            to="/register"
                            variant="primary"
                            size="sm"
                            className="w-100"
                        >
                            {!collapsed && 'Register'}
                            {collapsed && '📝'}
                        </Button>
                    </div>
                ) : (
                    <div className="user-section">
                        {!collapsed && (
                            <div className="user-info mb-2">
                                <div className="user-avatar">
                                    {role === 'admin' ? '👨‍💼' : '👤'}
                                </div>
                                <div className="user-details">
                                    <div className="user-role">{role === 'admin' ? 'Admin' : 'Driver'}</div>
                                </div>
                            </div>
                        )}
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleLogout}
                            className="w-100"
                        >
                            {!collapsed && '🚪 Logout'}
                            {collapsed && '🚪'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
