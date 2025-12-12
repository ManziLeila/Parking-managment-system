import { useEffect, useState } from 'react'
import { Container, Table, Button, Badge } from 'react-bootstrap'
import api from '../api/client'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

export default function MyReservations() {
  const [items, setItems] = useState([])

  const load = () => {
    api.get('/api/reservations/my')
      .then(({ data }) => setItems(data.reservations || []))
      .catch(() => toast.error('Failed to load reservations'))
  }

  useEffect(() => { load() }, [])

  const cancel = async (id) => {
    await api.put(`/api/reservations/${id}/cancel`)
    toast.info('Reservation cancelled')
    load()
  }

  return (
    <Container className="py-4">
      <h2 className="mb-3">My Reservations</h2>
      <Table striped hover responsive variant="dark">
        <thead>
          <tr>
            <th>ID</th><th>Lot</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.lot_name}</td>
              <td>{new Date(r.start_time).toLocaleString()}</td>
              <td>{new Date(r.end_time).toLocaleString()}</td>
              <td><Badge className="badge-soft">{r.status}</Badge></td>
              <td>
                {/* Only show Pay button if not already paid or completed */}
                {!['paid', 'completed', 'cancelled'].includes(r.status) && (
                  <Button as={Link} to={`/pay/${r.id}`} size="sm" className="me-2">Pay</Button>
                )}
                {/* Only show Cancel button for booked/active (not paid or completed) */}
                {['booked', 'active'].includes(r.status) && (
                  <Button size="sm" variant="outline-warning" onClick={() => cancel(r.id)}>Cancel</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  )
}

