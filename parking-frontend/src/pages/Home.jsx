import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <div className="hero">
        <Container>
          <h1 className="fade-in-up">Park Smarter. Save Time.</h1>
          <p className="fade-in-up">
            Find real-time availability, reserve your spot, pay securely, and get a QR receipt.
            Operators get a live dashboard, reports, and controls.
          </p>
          <div className="mt-4 d-flex gap-3 justify-content-center flex-wrap">
            <Button
              as={Link}
              to="/parking"
              size="lg"
              className="btn-gradient px-5 py-3"
            >
              🅿️ Find Parking
            </Button>
            <Button
              as={Link}
              to="/register"
              size="lg"
              className="btn-glass px-5 py-3"
            >
              Get Started
            </Button>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="fade-in-up">Why Choose Smart Parking?</h2>
          <p className="text-muted fade-in-up">Experience the future of parking management</p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="glass-card text-center fade-in-up">
              <div style={{ fontSize: '3rem' }} className="mb-3">⚡</div>
              <h4>Real-Time Availability</h4>
              <p className="text-muted">
                See available parking spots in real-time and reserve instantly
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-card text-center fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div style={{ fontSize: '3rem' }} className="mb-3">💳</div>
              <h4>Secure Payments</h4>
              <p className="text-muted">
                Multiple payment options with instant QR code receipts
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-card text-center fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div style={{ fontSize: '3rem' }} className="mb-3">📊</div>
              <h4>Smart Analytics</h4>
              <p className="text-muted">
                Comprehensive dashboard with insights and reports
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Stats Section */}
      <Container className="py-5">
        <div className="row g-4">
          <div className="col-md-3 col-6">
            <div className="text-center fade-in-up">
              <div className="stat-value">5+</div>
              <div className="stat-label">Parking Lots</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="text-center fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="stat-value">370</div>
              <div className="stat-label">Total Slots</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="text-center fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="stat-value">24/7</div>
              <div className="stat-label">Availability</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="text-center fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="stat-value">100%</div>
              <div className="stat-label">Secure</div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
