 import { useEffect, useState } from 'react'
import { Container, Table, Button, Row, Col, Form, Card } from 'react-bootstrap'
import api from '../../api/client'
import { toast } from 'react-toastify'

export default function ManageLots() {
  const [lots, setLots] = useState([])
  const [form, setForm] = useState({ name:'', location:'', total_slots: 0, available_slots: 0 })
  const load = () => api.get('/api/parking').then(({data}) => setLots(data.lots || []))

  useEffect(()=>{ load() }, [])

  const create = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/parking', { ...form, total_slots: +form.total_slots, available_slots: +form.available_slots })
      toast.success('Lot created'); setForm({ name:'', location:'', total_slots:0, available_slots:0 }); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed')
    }
  }

  const remove = async (id) => {
    await api.delete(`/api/parking/${id}`); toast.info('Lot deleted'); load()
  }

  return (
    <Container className="py-4">
      <Row className="g-3">
        <Col md={7}>
          <Card className="card-bg p-3">
            <h4>Parking Lots</h4>
            <Table striped hover responsive variant="dark" className="mt-3">
              <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Total</th><th>Avail</th><th></th></tr></thead>
              <tbody>
                {lots.map(l => (
                  <tr key={l.id}>
                    <td>{l.id}</td><td>{l.name}</td><td>{l.location}</td>
                    <td>{l.total_slots}</td><td>{l.available_slots}</td>
                    <td><Button size="sm" variant="outline-danger" onClick={()=>remove(l.id)}>Delete</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="card-bg p-3">
            <h4>Add Lot</h4>
            <Form onSubmit={create} className="mt-3">
              <Form.Group className="mb-2"><Form.Label>Name</Form.Label>
                <Form.Control value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>
              </Form.Group>
              <Form.Group className="mb-2"><Form.Label>Location</Form.Label>
                <Form.Control value={form.location} onChange={e=>setForm({...form, location:e.target.value})} required/>
              </Form.Group>
              <Form.Group className="mb-2"><Form.Label>Total Slots</Form.Label>
                <Form.Control type="number" min="0" value={form.total_slots} onChange={e=>setForm({...form, total_slots:e.target.value})} required/>
              </Form.Group>
              <Form.Group className="mb-3"><Form.Label>Available Slots</Form.Label>
                <Form.Control type="number" min="0" value={form.available_slots} onChange={e=>setForm({...form, available_slots:e.target.value})} required/>
              </Form.Group>
              <Button type="submit" className="w-100">Create</Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

