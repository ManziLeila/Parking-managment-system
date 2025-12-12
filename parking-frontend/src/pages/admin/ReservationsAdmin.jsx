 import { useEffect, useState } from 'react'
import { Container, Table, Button, Badge } from 'react-bootstrap'
import api from '../../api/client'
import { toast } from 'react-toastify'

export default function ReservationsAdmin() {
  const [items, setItems] = useState([])
  const load = () => api.get('/api/reservations').then(({data}) => setItems(data.reservations || []))
  useEffect(()=>{ load() }, [])

  const complete = async (id) => { await api.put(`/api/reservations/${id}/complete`); toast.success('Completed'); load() }
  const cancel = async (id) => { await api.put(`/api/reservations/${id}/cancel`); toast.info('Cancelled'); load() }

  return (
    <Container className="py-4">
      <h3 className="mb-3">All Reservations</h3>
      <Table striped hover responsive variant="dark">
        <thead><tr><th>ID</th><th>User</th><th>Lot</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(r=>(
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.user_name}</td>
              <td>{r.lot_name}</td>
              <td>{new Date(r.start_time).toLocaleString()}</td>
              <td>{new Date(r.end_time).toLocaleString()}</td>
              <td><Badge className="badge-soft">{r.status}</Badge></td>
              <td>
                <Button size="sm" className="me-2" onClick={()=>complete(r.id)}>Complete</Button>
                <Button size="sm" variant="outline-warning" onClick={()=>cancel(r.id)}>Cancel</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  )
}

