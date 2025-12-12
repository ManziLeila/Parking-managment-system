 
const express = require('express');
const ParkingLotController = require('../controllers/parkingLotController');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', ParkingLotController.list);
router.get('/:id', ParkingLotController.getOne);

// Admin-only
router.post('/', authRequired, requireRole('admin'), ParkingLotController.create);
router.put('/:id', authRequired, requireRole('admin'), ParkingLotController.update);
router.delete('/:id', authRequired, requireRole('admin'), ParkingLotController.remove);

module.exports = router;
