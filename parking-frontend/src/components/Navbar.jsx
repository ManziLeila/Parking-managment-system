 
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navbar as RBNavbar, Container, Nav, Button } from 'react-bootstrap'

export default function Navbar() {
  const { token, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <RBNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <RBNavbar.Brand as={Link} to="/">Smart Parking</RBNavbar.Brand>
        <RBNavbar.Toggle />
        <RBNavbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/parking">Find Parking</Nav.Link>
            {token && <Nav.Link as={NavLink} to="/my-reservations">My Reservations</Nav.Link>}
            {role === 'admin' && (
              <>
                <Nav.Link as={NavLink} to="/admin">Admin</Nav.Link>
                <Nav.Link as={NavLink} to="/admin/lots">Manage Lots</Nav.Link>
                <Nav.Link as={NavLink} to="/admin/reservations">Reservations</Nav.Link>
                <Nav.Link as={NavLink} to="/admin/reports">Reports</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {!token ? (
              <>
                <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
                <Nav.Link as={NavLink} to="/register">Register</Nav.Link>
              </>
            ) : (
              <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
            )}
          </Nav>
        </RBNavbar.Collapse>
      </Container>
    </RBNavbar>
  )
}
