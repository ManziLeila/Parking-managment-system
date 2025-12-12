 
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Container, Card, Form, Button } from 'react-bootstrap'
import api from '../api/client'
import { toast } from 'react-toastify'

export default function Pay() {
  const { reservationId } = useParams()
  const navigate = useNavigate()
  const [amount, setAmount] = useState(2000) // demo: flat amount; can compute by hours later
  const [method, setMethod] = useState('card')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/api/payments', {
        reservation_id: Number(reservationId),
        amount: Number(amount),
        method
      })
      toast.success('Payment recorded')
      navigate(`/receipt/${reservationId}`, { state: { receipt: data.receipt } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-5" style={{maxWidth: 520}}>
      <Card className="card-bg p-4">
        <h3 className="mb-3">Payment</h3>
        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label>Amount (RWF)</Form.Label>
            <Form.Control type="number" min="100" step="100" value={amount} onChange={e=>setAmount(e.target.value)} required/>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Method</Form.Label>
            <Form.Select value={method} onChange={e=>setMethod(e.target.value)}>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
            </Form.Select>
          </Form.Group>
          <Button type="submit" disabled={loading} className="w-100">
            {loading ? 'Processing...' : 'Pay'}
          </Button>
        </Form>
      </Card>
    </Container>
  )
}
