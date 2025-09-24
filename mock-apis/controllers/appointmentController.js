import { TryCatch } from "../middlewares/error.js";
import appointments from "../models/appointments.json" with { type: "json" };
import { parse } from 'date-fns';

export const getAppointments = TryCatch(async(req, res) => {
const { patientId, days, appointmentStatus } = req.body;

  if (!patientId) {
    return res.status(400).json({ error: "patientId is required" });
  }

  let results = appointments.filter(
    (appt) =>
      appt.patientId == patientId &&
      (!appointmentStatus || appt.status === appointmentStatus)
  );
  
  // Filter by last X days
  if (days) {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - parseInt(days,10)); // look BACK
    
    results = results.filter((appt) => {
      const temptApptDate = appt.appoinmentDate;
      const apptDate = new Date(temptApptDate);
      return apptDate >= cutoff && apptDate <= now;
    });
  }
   
  res.json({ success: true, appointments: results });
});
