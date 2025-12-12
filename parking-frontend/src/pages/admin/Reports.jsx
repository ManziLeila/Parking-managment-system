 import { useEffect, useState } from 'react'
import { Container, Card, Form } from 'react-bootstrap'
import api from '../../api/client'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

export default function Reports() {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [data, setData] = useState({ total_earnings: 0, breakdown: [] })

  const load = () => {
    api.get(`/api/reports/daily?date=${date}`)
      .then(({data}) => setData(data))
      .catch(()=> toast.error('Failed to load report'))
  }

  useEffect(()=>{ load() }, [])
  useEffect(()=>{ load() }, [date])

  return (
    <Container className="py-4" style={{maxWidth: 840}}>
      <Card className="card-bg p-3">
        <div className="d-flex align-items-center gap-3 mb-3">
          <h4 className="mb-0">Daily Report</h4>
          <Form.Control type="date" style={{maxWidth: 220}} value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div className="mb-2">Total Earnings: <strong>RWF {Number(data.total_earnings).toLocaleString()}</strong></div>
        <ul className="mb-0">
          {data.breakdown?.map(b => (
            <li key={b.lot_id}>{b.lot_name}: RWF {Number(b.total).toLocaleString()}</li>
          ))}
        </ul>
      </Card>
    </Container>
  )
}

