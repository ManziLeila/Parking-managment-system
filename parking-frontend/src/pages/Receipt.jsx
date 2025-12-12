 
import { useLocation, useParams, Link } from 'react-router-dom'
import { Container, Card, Button } from 'react-bootstrap'

export default function Receipt() {
  const { reservationId } = useParams()
  const { state } = useLocation()
  const receipt = state?.receipt // { qr, transaction_code }

  return (
    <Container className="py-5" style={{maxWidth: 620}}>
      <Card className="card-bg p-4 text-center">
        <h3 className="mb-2">Payment Receipt</h3>
        <div className="mb-3">Reservation #{reservationId}</div>
        {receipt?.qr ? (
          <>
            <img src={receipt.qr} alt="QR Code" style={{maxWidth: 300}} className="mx-auto d-block mb-3"/>
            <div>Transaction: <strong>{receipt.transaction_code}</strong></div>
          </>
        ) : (
          <p>No receipt data found.</p>
        )}
        <Button as={Link} to="/my-reservations" className="mt-3">Go to My Reservations</Button>
      </Card>
    </Container>
  )
}
