import { useEffect, useState } from 'react'
import { Container, Card, Form, Button, Table, Badge } from 'react-bootstrap'
import api from '../../api/client'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

export default function Reports() {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [summary, setSummary] = useState({ total_earnings: 0, breakdown: [] })
  const [details, setDetails] = useState({ summary: {}, bookings: [] })
  const [loading, setLoading] = useState(false)

  const loadSummary = () => {
    api.get(`/api/reports/daily?date=${date}`)
      .then(({ data }) => setSummary(data))
      .catch(() => toast.error('Failed to load summary'))
  }

  const loadDetails = () => {
    setLoading(true)
    api.get(`/api/reports/daily-details?date=${date}`)
      .then(({ data }) => setDetails(data))
      .catch(() => toast.error('Failed to load booking details'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSummary()
    loadDetails()
  }, [date])

  // Download CSV function
  const downloadCSV = () => {
    if (!details.bookings || details.bookings.length === 0) {
      toast.warning('No bookings to download')
      return
    }

    // CSV headers
    const headers = [
      'Reservation ID',
      'User Name',
      'Email',
      'Phone',
      'Parking Lot',
      'Location',
      'Slot Number',
      'Start Time',
      'End Time',
      'Status',
      'Amount (RWF)',
      'Payment Method',
      'Payment Status',
      'Transaction Code',
      'Payment Time'
    ]

    // CSV rows
    const rows = details.bookings.map(b => [
      b.reservation_id,
      b.user_name,
      b.user_email,
      b.phone_number || 'N/A',
      b.parking_lot,
      b.location,
      b.slot_number || 'N/A',
      dayjs(b.start_time).format('YYYY-MM-DD HH:mm'),
      dayjs(b.end_time).format('YYYY-MM-DD HH:mm'),
      b.status,
      b.amount || '0',
      b.payment_method || 'N/A',
      b.payment_status || 'unpaid',
      b.transaction_code || 'N/A',
      b.payment_time ? dayjs(b.payment_time).format('YYYY-MM-DD HH:mm') : 'N/A'
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `parking-report-${date}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Report downloaded successfully')
  }

  const getStatusBadge = (status) => {
    const variants = {
      booked: 'primary',
      paid: 'success',
      active: 'info',
      completed: 'secondary',
      cancelled: 'danger'
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  const getPaymentStatusBadge = (status) => {
    if (!status) return <Badge bg="warning">Unpaid</Badge>
    const variants = {
      paid: 'success',
      pending: 'warning',
      failed: 'danger',
      refunded: 'info'
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Daily Reports</h2>

      {/* Summary Card */}
      <Card className="card-bg p-3 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0">Summary</h4>
          <div className="d-flex gap-2 align-items-center">
            <Form.Control
              type="date"
              style={{ maxWidth: 220 }}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            <Button
              variant="success"
              size="sm"
              onClick={downloadCSV}
              disabled={loading || !details.bookings?.length}
            >
              📥 Download CSV
            </Button>
          </div>
        </div>

        <div className="row">
          <div className="col-md-3 mb-2">
            <div className="text-muted small">Total Bookings</div>
            <div className="h5 mb-0">{details.summary?.total_bookings || 0}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="text-muted small">Paid Bookings</div>
            <div className="h5 mb-0 text-success">{details.summary?.paid_bookings || 0}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="text-muted small">Pending Bookings</div>
            <div className="h5 mb-0 text-warning">{details.summary?.pending_bookings || 0}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="text-muted small">Total Revenue</div>
            <div className="h5 mb-0 text-success">
              RWF {Number(details.summary?.total_revenue || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <hr className="my-3" />

        <div>
          <div className="text-muted small mb-2">Revenue by Parking Lot</div>
          {summary.breakdown?.length > 0 ? (
            <ul className="mb-0">
              {summary.breakdown.map(b => (
                <li key={b.lot_id}>
                  <strong>{b.lot_name}:</strong> RWF {Number(b.total).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted">No revenue for this date</div>
          )}
        </div>
      </Card>

      {/* Detailed Bookings Table */}
      <Card className="card-bg p-3">
        <h5 className="mb-3">Booking Details</h5>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : details.bookings?.length > 0 ? (
          <div className="table-responsive">
            <Table striped hover variant="dark">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Parking Lot</th>
                  <th>Slot</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {details.bookings.map(booking => (
                  <tr key={booking.reservation_id}>
                    <td>{booking.reservation_id}</td>
                    <td>
                      <div>{booking.user_name}</div>
                      <small className="text-muted">{booking.user_email}</small>
                    </td>
                    <td>{booking.phone_number || 'N/A'}</td>
                    <td>
                      <div>{booking.parking_lot}</div>
                      <small className="text-muted">{booking.location}</small>
                    </td>
                    <td>{booking.slot_number || 'N/A'}</td>
                    <td>
                      <div>{dayjs(booking.start_time).format('HH:mm')}</div>
                      <div>{dayjs(booking.end_time).format('HH:mm')}</div>
                    </td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td>
                      {booking.amount ? (
                        <span className="text-success">
                          RWF {Number(booking.amount).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <div>{getPaymentStatusBadge(booking.payment_status)}</div>
                      {booking.payment_method && (
                        <small className="text-muted">{booking.payment_method}</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            No bookings found for {date}
          </div>
        )}
      </Card>
    </Container>
  )
}
