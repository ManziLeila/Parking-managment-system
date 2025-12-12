import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Badge, Modal } from 'react-bootstrap';
import api from '../../api/client';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';
import dayjs from 'dayjs';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, roleFilter, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            // In a real app, this would be an API call to /api/users
            // For now, we'll use mock data
            const mockUsers = [
                { id: 1, name: 'System Administrator', email: 'admin@parking.com', role: 'admin', phone_number: '+250788000000', created_at: '2024-01-15', reservations_count: 0 },
                { id: 2, name: 'John Doe', email: 'john@university.edu', role: 'driver', phone_number: '+250788111111', created_at: '2024-02-20', reservations_count: 12 },
                { id: 3, name: 'Jane Smith', email: 'jane@university.edu', role: 'driver', phone_number: '+250788222222', created_at: '2024-03-10', reservations_count: 8 },
                { id: 4, name: 'Bob Johnson', email: 'bob@university.edu', role: 'driver', phone_number: '+250788333333', created_at: '2024-03-15', reservations_count: 5 }
            ];
            setUsers(mockUsers);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    if (loading) {
        return <LoadingSpinner text="Loading users..." />;
    }

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        drivers: users.filter(u => u.role === 'driver').length,
        totalReservations: users.reduce((sum, u) => sum + (u.reservations_count || 0), 0)
    };

    return (
        <Container className="py-4 fade-in">
            {/* Header */}
            <div className="mb-4">
                <h2 className="mb-2">👥 User Management</h2>
                <p className="text-muted">Manage system users and view their activity</p>
            </div>

            {/* Statistics */}
            <Row className="g-4 mb-4">
                <Col md={3} sm={6}>
                    <Card className="glass-card">
                        <Card.Body>
                            <div className="stat-label">Total Users</div>
                            <div className="stat-value">{stats.total}</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6}>
                    <Card className="glass-card">
                        <Card.Body>
                            <div className="stat-label">Administrators</div>
                            <div className="stat-value text-info">{stats.admins}</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6}>
                    <Card className="glass-card">
                        <Card.Body>
                            <div className="stat-label">Drivers</div>
                            <div className="stat-value text-success">{stats.drivers}</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6}>
                    <Card className="glass-card">
                        <Card.Body>
                            <div className="stat-label">Total Reservations</div>
                            <div className="stat-value">{stats.totalReservations}</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="glass-card mb-4">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="🔍 Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="glass-card border-0"
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="glass-card border-0"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Administrators</option>
                                <option value="driver">Drivers</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Button onClick={loadUsers} className="w-100 btn-glass">
                                🔄 Refresh
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Users Table */}
            <Card className="glass-card">
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Reservations</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            background: 'var(--primary-gradient)',
                                                            color: 'white',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{user.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-muted">{user.email}</td>
                                            <td className="text-muted">{user.phone_number}</td>
                                            <td>
                                                <Badge className={user.role === 'admin' ? 'badge-info' : 'badge-success'}>
                                                    {user.role === 'admin' ? '👑 Admin' : '🚗 Driver'}
                                                </Badge>
                                            </td>
                                            <td className="text-center">{user.reservations_count}</td>
                                            <td className="text-muted">
                                                {dayjs(user.created_at).format('MMM D, YYYY')}
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    className="btn-glass"
                                                    onClick={() => handleViewUser(user)}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* User Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="glass-card border-0">
                    <Modal.Title>User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="glass-card border-0">
                    {selectedUser && (
                        <div>
                            <div className="text-center mb-4">
                                <div
                                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        background: 'var(--primary-gradient)',
                                        color: 'white',
                                        fontSize: '2rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <h4>{selectedUser.name}</h4>
                                <Badge className={selectedUser.role === 'admin' ? 'badge-info' : 'badge-success'}>
                                    {selectedUser.role === 'admin' ? '👑 Administrator' : '🚗 Driver'}
                                </Badge>
                            </div>

                            <div className="mb-3">
                                <div className="stat-label">Email</div>
                                <div>{selectedUser.email}</div>
                            </div>

                            <div className="mb-3">
                                <div className="stat-label">Phone Number</div>
                                <div>{selectedUser.phone_number}</div>
                            </div>

                            <div className="mb-3">
                                <div className="stat-label">Member Since</div>
                                <div>{dayjs(selectedUser.created_at).format('MMMM D, YYYY')}</div>
                            </div>

                            <div className="mb-3">
                                <div className="stat-label">Total Reservations</div>
                                <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                                    {selectedUser.reservations_count}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="glass-card border-0">
                    <Button variant="secondary" className="btn-glass" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
