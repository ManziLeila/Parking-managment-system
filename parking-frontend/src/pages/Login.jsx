import { useState } from 'react'
import { Form, Button, Card, Container } from 'react-bootstrap'
import api from '../api/client'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { jwtDecode } from 'jwt-decode'   // <-- named export

export default function Login() {
  const [form, setForm] = useState({ email:'', password:'' })
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/api/auth/login', form)
      login(data.token)
      const { role } = jwtDecode(data.token) || {}
      toast.success('Logged in!')
      navigate(role === 'admin' ? '/admin' : '/parking')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <Container className="py-5" style={{maxWidth: 480}}>
      <Card className="card-bg p-4">
        <h3 className="mb-3">Welcome back</h3>
        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={form.email}
              onChange={e=>setForm({...form, email:e.target.value})}
              required
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={form.password}
              onChange={e=>setForm({...form, password:e.target.value})}
              required
            />
          </Form.Group>
          <Button type="submit" className="w-100">Login</Button>
        </Form>
      </Card>
    </Container>
  )
}
