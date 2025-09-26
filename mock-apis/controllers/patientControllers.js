import { TryCatch } from "../middlewares/error.js";
import patients from "../models/patient.json" with { type: "json" };

function formatDob(dob) {
  if (!dob) return "";
  const date = new Date(dob);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export const getPatients = TryCatch(async (req, res) => {
  const { mrn, firstName, lastName, dob, zip } = req.body;

  let atLeastOneCriteria = false;
  let results = patients;

  if (mrn && mrn.trim() !== "") {
    results = patients.filter((p) => p.mrn == mrn);
    atLeastOneCriteria = true;
  } else {
    let setA = [];
    let setB = [];
    if ((firstName && firstName.trim() !== "") || (lastName && lastName.trim() !== "")) {
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

    results = [...new Map([...setA, ...setB].map((p) => [p.id, p])).values()];

    results = results.map((p) => {
      let score = 0;
      if (firstName && p.firstName.toLowerCase() == firstName.toLowerCase()) {
        score += 1;
      }
      if (lastName && p.lastName.toLowerCase() == lastName.toLowerCase()) {
        score += 1;
      }
      return { ...p, matchScore: score };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);
    results = results.map(({ matchScore, ...rest }) => rest);
  }

  if (dob && dob.trim() !== "") {
    atLeastOneCriteria = true;
    results = results.filter((p) => p.dob.split("T")[0] == dob);
  }

  if (!atLeastOneCriteria) {
    results = [];
  }

  // Format DOBs in MM/DD/YYYY before sending
  results = results.map((p) => ({
    ...p,
    dob: formatDob(p.dob),
  }));

  res.json({ success: true, patients: results });
});
