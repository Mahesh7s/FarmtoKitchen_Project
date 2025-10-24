const Shipping = require('../models/Shipping');

// Calculate shipping cost and time
const calculateShipping = async (req, res) => {
  try {
    const { farmerId, deliveryZipCode, orderAmount } = req.body;
    
    const shipping = await Shipping.findOne({ farmer: farmerId });
    if (!shipping) {
      return res.status(404).json({ message: 'Shipping information not found' });
    }

    const deliveryArea = shipping.deliveryAreas.find(area => 
      area.zipCode === deliveryZipCode
    );

    if (!deliveryArea) {
      return res.status(400).json({ message: 'Delivery not available for this area' });
    }

    let shippingCost = deliveryArea.cost;
    if (orderAmount >= deliveryArea.freeShippingAbove) {
      shippingCost = 0;
    }

    // Get available time slots
    const today = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    const todaySlots = shipping.timeSlots.find(slot => slot.day === today);
    
    const availableSlots = todaySlots ? todaySlots.slots.filter(slot => 
      slot.currentOrders < slot.maxOrders
    ) : [];

    res.json({
      shippingCost,
      deliveryTime: deliveryArea.deliveryTime,
      availableSlots,
      sameDayDelivery: shipping.sameDayDelivery
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Book delivery slot
const bookDeliverySlot = async (req, res) => {
  try {
    const { farmerId, slotId, deliveryDate } = req.body;
    
    const shipping = await Shipping.findOne({ farmer: farmerId });
    const timeSlot = shipping.timeSlots
      .flatMap(day => day.slots)
      .find(slot => slot._id.toString() === slotId);

    if (!timeSlot || timeSlot.currentOrders >= timeSlot.maxOrders) {
      return res.status(400).json({ message: 'Slot not available' });
    }

    timeSlot.currentOrders += 1;
    await shipping.save();

    res.json({ 
      message: 'Delivery slot booked successfully',
      slot: timeSlot,
      deliveryDate 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { calculateShipping, bookDeliverySlot };