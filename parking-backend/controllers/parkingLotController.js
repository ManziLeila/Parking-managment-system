 
const ParkingLotModel = require('../models/parkingLotModel');

const ParkingLotController = {
  async list(req, res) {
    try {
      const lots = await ParkingLotModel.findAll();
      res.json({ lots });
    } catch (err) {
      console.error('List lots error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getOne(req, res) {
    try {
      const lot = await ParkingLotModel.findById(req.params.id);
      if (!lot) return res.status(404).json({ message: 'Parking lot not found' });
      res.json({ lot });
    } catch (err) {
      console.error('Get lot error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async create(req, res) {
    try {
      const { name, location, total_slots, available_slots } = req.body || {};
      if (!name || !location || total_slots == null) {
        return res.status(400).json({ message: 'name, location, total_slots are required' });
      }
      if (total_slots < 0) {
        return res.status(400).json({ message: 'total_slots must be >= 0' });
      }
      if (available_slots != null && (available_slots < 0 || available_slots > total_slots)) {
        return res.status(400).json({ message: 'available_slots must be between 0 and total_slots' });
      }

      const lot = await ParkingLotModel.create({ name, location, total_slots, available_slots });
      res.status(201).json({ message: 'Created', lot });
    } catch (err) {
      console.error('Create lot error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async update(req, res) {
    try {
      const { name, location, total_slots, available_slots } = req.body || {};
      const existing = await ParkingLotModel.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Parking lot not found' });

      // Basic sanity checks if numbers provided
      if (total_slots != null && total_slots < 0) {
        return res.status(400).json({ message: 'total_slots must be >= 0' });
      }
      if (available_slots != null) {
        const max = total_slots != null ? total_slots : existing.total_slots;
        if (available_slots < 0 || available_slots > max) {
          return res.status(400).json({ message: 'available_slots must be between 0 and total_slots' });
        }
      }

      const updated = await ParkingLotModel.update(req.params.id, {
        name, location, total_slots, available_slots
      });
      res.json({ message: 'Updated', lot: updated });
    } catch (err) {
      console.error('Update lot error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async remove(req, res) {
    try {
      const ok = await ParkingLotModel.remove(req.params.id);
      if (!ok) return res.status(404).json({ message: 'Parking lot not found' });
      res.json({ message: 'Deleted' });
    } catch (err) {
      console.error('Delete lot error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = ParkingLotController;
