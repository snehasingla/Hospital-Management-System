const User = require('../models/User'); // adjust path if needed

const searchDoctors = async (req, res) => {
  try {
    const { specialization, disease } = req.query;

    const query = { role: 'doctor' };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (disease) {
      query.diseasesTreated = { $in: [new RegExp(disease, 'i')] };
    }

    const doctors = await User.find(query).select('-password'); // exclude password

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to search doctors' });
  }
};

// Get all unique specializations from doctors
const getAllSpecializations = async (req, res) => {
  try {
    const specializations = await User.find({ role: 'doctor' }).distinct('specialization');
    
    // Filter out null/empty values and sort
    const filteredSpecializations = specializations
      .filter(spec => spec && spec.trim().length > 0)
      .sort();
    
    res.json(filteredSpecializations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch specializations' });
  }
};

module.exports = { searchDoctors, getAllSpecializations };
