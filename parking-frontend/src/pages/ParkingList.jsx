import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ParkingList() {
  const [lots, setLots] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);

  useEffect(() => {
    loadParkingLots();
  }, []);

  useEffect(() => {
    filterLots();
  }, [searchTerm, filterAvailable, lots]);

  const loadParkingLots = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/parking');
      setLots(data.lots || []);
    } catch (error) {
      toast.error('Failed to load parking lots');
    } finally {
      setLoading(false);
    }
  };

  const filterLots = () => {
    let filtered = lots;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lot =>
        lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Availability filter
    if (filterAvailable) {
      filtered = filtered.filter(lot => lot.available_slots > 0);
    }

    setFilteredLots(filtered);
  };

  const getAvailabilityBadge = (lot) => {
    const percentage = (lot.available_slots / lot.total_slots) * 100;
    if (percentage === 0) return { variant: 'danger', text: 'Full' };
    if (percentage < 20) return { variant: 'warning', text: 'Limited' };
    return { variant: 'success', text: 'Available' };
  };

  if (loading) {
    return <LoadingSpinner text="Loading parking lots..." />;
  }

  return (
    <Container className="py-4 fade-in">
      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-2">🅿️ Available Parking</h2>
        <p className="text-muted">Find and reserve your parking spot</p>
      </div>

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text className="glass-card border-0">🔍</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-card border-0"
            />
          </InputGroup>
        </Col>
        <Col md={4} className="d-flex align-items-center">
          <Form.Check
            type="switch"
            id="available-only"
            label="Show available only"
            checked={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.checked)}
            className="text-muted"
          />
        </Col>
      </Row>

      {/* Parking Lots Grid */}
      {filteredLots.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: '4rem', opacity: 0.5 }}>🅿️</div>
          <h4 className="text-muted mt-3">No parking lots found</h4>
          <p className="text-muted">Try adjusting your search or filters</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredLots.map((lot, index) => {
            const badge = getAvailabilityBadge(lot);
            const occupancyPercentage = ((lot.total_slots - lot.available_slots) / lot.total_slots * 100).toFixed(0);

            return (
              <Col key={lot.id}>
                <Card
                  className="glass-card h-100 fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card.Body className="d-flex flex-column">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">{lot.name}</h5>
                        <Badge className={`badge-${badge.variant}`}>
                          {badge.text}
                        </Badge>
                      </div>
                      <div style={{ fontSize: '2rem' }}>🅿️</div>
                    </div>

                    {/* Location */}
                    <div className="mb-3 text-muted" style={{ fontSize: '0.875rem' }}>
                      📍 {lot.location}
                    </div>

                    {/* Occupancy Bar */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
                        <span className="text-muted">Occupancy</span>
                        <span className="text-muted">{occupancyPercentage}%</span>
                      </div>
                      <div
                        style={{
                          height: '8px',
                          background: 'rgba(148, 163, 184, 0.2)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${occupancyPercentage}%`,
                            background: occupancyPercentage > 80 ? '#EF4444' : occupancyPercentage > 50 ? '#F59E0B' : '#10B981',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="d-flex gap-3 mb-3">
                      <div className="flex-fill text-center p-2 glass-card">
                        <div className="stat-label" style={{ fontSize: '0.7rem' }}>Total</div>
                        <div className="fw-bold">{lot.total_slots}</div>
                      </div>
                      <div className="flex-fill text-center p-2 glass-card">
                        <div className="stat-label" style={{ fontSize: '0.7rem' }}>Available</div>
                        <div className="fw-bold text-success">{lot.available_slots}</div>
                      </div>
                    </div>

                    {/* Reserve Button */}
                    <div className="mt-auto">
                      <Button
                        as={Link}
                        to={`/reserve/${lot.id}`}
                        disabled={lot.available_slots <= 0}
                        className="w-100 btn-gradient"
                      >
                        {lot.available_slots > 0 ? '🎫 Reserve Now' : '❌ Full'}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Summary Stats */}
      <Row className="mt-5 g-4">
        <Col md={4}>
          <div className="text-center glass-card p-4">
            <div className="stat-value">{lots.length}</div>
            <div className="stat-label">Total Locations</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="text-center glass-card p-4">
            <div className="stat-value">
              {lots.reduce((sum, lot) => sum + lot.total_slots, 0)}
            </div>
            <div className="stat-label">Total Slots</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="text-center glass-card p-4">
            <div className="stat-value text-success">
              {lots.reduce((sum, lot) => sum + lot.available_slots, 0)}
            </div>
            <div className="stat-label">Available Now</div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
