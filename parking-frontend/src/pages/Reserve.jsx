 
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Container, Card, Form, Button } from 'react-bootstrap'
import api from '../api/client'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

export default function Reserve() {
  const { lotId } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    start: dayjs().add(15,'minute').format('YYYY-MM-DDTHH:mm'),
    end:   dayjs().add(1,'hour').add(15,'minute').format('YYYY-MM-DDTHH:mm'),
  })

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        lot_id: Number(lotId),
        start_time: new Date(form.start).toISOString(),
        end_time: new Date(form.end).toISOString(),
      }
      const { data } = await api.post('/api/reservations', payload)
      toast.success('Reservation created!')
      navigate(`/pay/${data.reservation.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reserve')
    }
  }

  return (
    <Container className="py-5" style={{maxWidth: 560}}>
      <Card className="card-bg p-4">
        <h3 className="mb-3">Reserve Slot</h3>
        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label>Start</Form.Label>
            <Form.Control type="datetime-local" value={form.start} onChange={e=>setForm({...form, start:e.target.value})} required />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>End</Form.Label>
            <Form.Control type="datetime-local" value={form.end} onChange={e=>setForm({...form, end:e.target.value})} required />
          </Form.Group>
          <Button type="submit" className="w-100">Continue to Payment</Button>
        </Form>
      </Card>
    </Container>
  )
}
