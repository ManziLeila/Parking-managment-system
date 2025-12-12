import { useState } from 'react'
import { Form, Button, Card, Container } from 'react-bootstrap'
import api from '../api/client'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', password:'', role:'driver'
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/api/auth/register', form)
      login(data.token)
      toast.success('Registered!')
      // If admin, send to admin dashboard; otherwise to parking
      navigate((data?.user?.role === 'admin') ? '/admin' : '/parking')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <Container className="py-5" style={{maxWidth: 520}}>
      <Card className="card-bg p-4">
        <h3 className="mb-3">Create Account</h3>
        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control value={form.firstName}
              onChange={e=>setForm({...form, firstName:e.target.value})} required/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control value={form.lastName}
              onChange={e=>setForm({...form, lastName:e.target.value})} required/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={form.email}
              onChange={e=>setForm({...form, email:e.target.value})} required/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={form.password}
              onChange={e=>setForm({...form, password:e.target.value})} required/>
          </Form.Group>

          {/* Role selector for demo/admin creation */}
          <Form.Group className="mb-4">
            <Form.Label>Role</Form.Label>
            <Form.Select value={form.role}
              onChange={e=>setForm({...form, role:e.target.value})}>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit" className="w-100">Register</Button>
        </Form>
      </Card>
    </Container>
  )
}
