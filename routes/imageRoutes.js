const express = require("express");
const Doctor = require('../models/doctor');
const router = express.Router();

// Serve doctor image by ID
router.get("/doctor/:id/image", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    // Check if image data exists
    if (!doctor || !doctor.img || !doctor.img.data) {
      return res.status(404).end(); 
    }

    res.set("Content-Type", doctor.img.contentType);
    res.send(doctor.img.data);
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
