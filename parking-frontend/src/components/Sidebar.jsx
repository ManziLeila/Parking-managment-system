import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import '../sidebar.css'

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
                    <span className="brand-icon">🅿️</span>
                    {!collapsed && <span className="brand-text">Smart Parking</span>}
                </Link>
                <button
                    className="sidebar-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    {collapsed ? '☰' : '✕'}
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="sidebar-nav">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
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
                        {!collapsed ? (
                            <>
                                <Link to="/login" className="sidebar-btn sidebar-btn-outline">
                                    🔑 Login
                                </Link>
                                <Link to="/register" className="sidebar-btn sidebar-btn-primary">
                                    📝 Register
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="sidebar-btn sidebar-btn-icon" title="Login">
                                    🔑
                                </Link>
                                <Link to="/register" className="sidebar-btn sidebar-btn-icon" title="Register">
                                    📝
                                </Link>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="user-section">
                        {!collapsed && (
                            <div className="user-info">
                                <div className="user-avatar">
                                    {role === 'admin' ? '👨‍💼' : '👤'}
                                </div>
                                <div className="user-details">
                                    <div className="user-role">{role === 'admin' ? 'Admin' : 'Driver'}</div>
                                </div>
                            </div>
                        )}
                        <button
                            className="sidebar-btn sidebar-btn-danger"
                            onClick={handleLogout}
                        >
                            🚪 {!collapsed && 'Logout'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
