import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, breakdown: [] });
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const today = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load daily earnings
      const dailyRes = await api.get(`/api/reports/daily?date=${today}`);
      setStats({
        total: dailyRes.data.total_earnings,
        breakdown: dailyRes.data.breakdown
      });

      // Load overview statistics
      const [lotsRes, reservationsRes] = await Promise.all([
        api.get('/api/parking-lots'),
        api.get('/api/reservations/all')
      ]);

      const lots = lotsRes.data;
      const reservations = reservationsRes.data;

      // Calculate statistics
      const totalSlots = lots.reduce((sum, lot) => sum + lot.total_slots, 0);
      const availableSlots = lots.reduce((sum, lot) => sum + lot.available_slots, 0);
      const occupancyRate = ((totalSlots - availableSlots) / totalSlots * 100).toFixed(1);

      const activeReservations = reservations.filter(r =>
        r.status === 'active' || r.status === 'pending'
      ).length;

      setOverview({
        totalRevenue: dailyRes.data.total_earnings,
        activeReservations,
        occupancyRate,
        totalLots: lots.length,
        totalSlots,
        availableSlots,
        lots
      });

      // Mock recent activity (in real app, this would come from backend)
      setRecentActivity([
        { type: 'reservation', message: 'New reservation at Main Campus Parking', time: '5 min ago' },
        { type: 'payment', message: 'Payment received - RWF 5,000', time: '12 min ago' },
        { type: 'user', message: 'New user registered', time: '25 min ago' },
        { type: 'reservation', message: 'Reservation completed at Faculty Parking', time: '1 hour ago' }
      ]);

    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  // Prepare chart data
  const revenueData = stats.breakdown.map(b => ({
    name: b.lot_name?.substring(0, 15) || 'Unknown',
    revenue: Number(b.total) || 0
  }));

  const occupancyData = overview?.lots.map(lot => ({
    name: lot.name?.substring(0, 15) || 'Unknown',
    occupied: lot.total_slots - lot.available_slots,
    available: lot.available_slots
  })) || [];

  const statusData = [
    { name: 'Active', value: overview?.activeReservations || 0, color: '#10B981' },
    { name: 'Available', value: overview?.availableSlots || 0, color: '#3B82F6' }
  ];

  return (
    <Container className="py-4 fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Admin Dashboard</h2>
          <p className="text-muted mb-0">Welcome back! Here's what's happening today.</p>
        </div>
        <Button as={Link} to="/admin/lots" className="btn-gradient">
          ➕ Add Parking Lot
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        <Col md={3} sm={6}>
          <StatCard
            icon="💰"
            label="Today's Revenue"
            value={`RWF ${Number(overview?.totalRevenue || 0).toLocaleString()}`}
            trend="up"
            trendValue="+12.5%"
            color="success"
          />
        </Col>
        <Col md={3} sm={6}>
          <StatCard
            icon="📋"
            label="Active Reservations"
            value={overview?.activeReservations || 0}
            trend="up"
            trendValue="+5"
            color="info"
          />
        </Col>
        <Col md={3} sm={6}>
          <StatCard
            icon="🅿️"
            label="Occupancy Rate"
            value={`${overview?.occupancyRate || 0}%`}
            trend={overview?.occupancyRate > 70 ? 'up' : 'down'}
            trendValue={`${overview?.occupancyRate || 0}%`}
            color="warning"
          />
        </Col>
        <Col md={3} sm={6}>
          <StatCard
            icon="🏢"
            label="Total Parking Lots"
            value={overview?.totalLots || 0}
            color="primary"
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-4 mb-4">
        {/* Revenue by Parking Lot */}
        <Col lg={8}>
          <Card className="glass-card">
            <Card.Body>
              <h5 className="mb-3">📊 Revenue by Parking Lot (Today)</h5>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis
                      dataKey="name"
                      stroke="#94A3B8"
                      style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis stroke="#94A3B8" style={{ fontSize: '0.75rem' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                        color: '#F1F5F9'
                      }}
                    />
                    <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Occupancy Status */}
        <Col lg={4}>
          <Card className="glass-card">
            <Card.Body>
              <h5 className="mb-3">🎯 Occupancy Status</h5>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                        color: '#F1F5F9'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ fontSize: '0.875rem', color: '#94A3B8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row className="g-4">
        {/* Parking Lot Occupancy Details */}
        <Col lg={8}>
          <Card className="glass-card">
            <Card.Body>
              <h5 className="mb-3">🚗 Parking Lot Occupancy</h5>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis
                      dataKey="name"
                      stroke="#94A3B8"
                      style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis stroke="#94A3B8" style={{ fontSize: '0.75rem' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                        color: '#F1F5F9'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.875rem', color: '#94A3B8' }} />
                    <Bar dataKey="occupied" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="available" stackId="a" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col lg={4}>
          <Card className="glass-card">
            <Card.Body>
              <h5 className="mb-3">⚡ Recent Activity</h5>
              <div className="d-flex flex-column gap-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-start gap-3 pb-3"
                    style={{ borderBottom: index < recentActivity.length - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none' }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>
                      {activity.type === 'reservation' && '📋'}
                      {activity.type === 'payment' && '💳'}
                      {activity.type === 'user' && '👤'}
                    </div>
                    <div className="flex-grow-1">
                      <div style={{ fontSize: '0.875rem' }}>{activity.message}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="g-4 mt-2">
        <Col>
          <Card className="glass-card">
            <Card.Body>
              <h5 className="mb-3">⚡ Quick Actions</h5>
              <div className="d-flex gap-3 flex-wrap">
                <Button as={Link} to="/admin/lots" variant="outline-primary" className="btn-glass">
                  🏢 Manage Parking Lots
                </Button>
                <Button as={Link} to="/admin/reservations" variant="outline-primary" className="btn-glass">
                  📋 View Reservations
                </Button>
                <Button as={Link} to="/admin/reports" variant="outline-primary" className="btn-glass">
                  📊 Generate Reports
                </Button>
                <Button onClick={loadDashboardData} variant="outline-primary" className="btn-glass">
                  🔄 Refresh Data
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
