import { TryCatch } from "../middlewares/error.js";
import patients from "../models/patient.json" assert { type: "json" };


export const getPatients = TryCatch(async (req, res) => {
  const { mrn, firstName, lastName, dob, zip } = req.body;

  let atLeastOneCriteria = false;

  let results = patients;

  if (mrn && mrn.trim() !== "") {
    // Priority: Search by MRN
    results = patients.filter((p) => p.mrn == mrn);
    atLeastOneCriteria = true;
  } else {
    let setA = [];
    let setB = [];

    if((firstName && firstName.trim() !== "") || (lastName && lastName.trim() !== "")) {
      
      atLeastOneCriteria = true;
    }
    if (firstName && firstName.trim() !== "") {
      setA = patients.filter(
        (p) => p.firstName.toLowerCase() == firstName.toLowerCase()
      );
    }

    if (lastName && lastName.trim() !== "") {
      setB = patients.filter(
        (p) => p.lastName.toLowerCase() == lastName.toLowerCase()
      );
    }

    // Union of A and B (avoid duplicates by ID)
    results = [...new Map([...setA, ...setB].map((p) => [p.id, p])).values()];
  
  
  }

  // Apply filters
  if (dob && dob.trim() !== "") {
    atLeastOneCriteria = true;
    results = results.filter(
      (p) => {
        const tempDob = p.dob;
  
        return tempDob.split("T")[0] == dob}
    );
   
  }
  if (zip && zip.trim() !== "") {
    atLeastOneCriteria = true;
    results = results.filter((p) => p.patientAddress.zip == zip);
  }
  // If no criteria provided, return empty array
  if(!atLeastOneCriteria) {
    results = [];
  }
  res.json({success: true, patients: results });
});
