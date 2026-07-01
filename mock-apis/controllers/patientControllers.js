import { TryCatch } from "../middlewares/error.js";
import patients from "../models/patient.json" with { type: "json" };

function formatDob(dob) {
  if (!dob) return "";

  const ymd = normalizeDobToYMD(dob);
  if (!ymd) return "";

  const [year, month, day] = ymd.split("-");
  return `${month}/${day}/${year}`;
}

function isValidValue(value) {
  const str = String(value ?? "").trim().toLowerCase();
  return str !== "" && str !== "null" && str !== "undefined";
}

function normalizeDobToYMD(value) {
  if (!isValidValue(value)) return "";

  const str = String(value).trim();

  // Handles YYYY-MM-DD and ISO dates like 2026-06-25T00:00:00Z
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.split("T")[0];
  }

  // Handles MM/DD/YYYY or M/D/YYYY
  const mdySlash = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdySlash) {
    const [, month, day, year] = mdySlash;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Handles MM-DD-YYYY or M-D-YYYY
  const mdyDash = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (mdyDash) {
    const [, month, day, year] = mdyDash;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return "";
}

export const getPatients = TryCatch(async (req, res) => {
  const { mrn, firstName, lastName, dob, zip } = req.body;

  let atLeastOneCriteria = false;
  let results = patients;

  if (isValidValue(mrn)) {
    results = patients.filter((p) => String(p.mrn) === String(mrn).trim());
    atLeastOneCriteria = true;
  } else {
    let setA = [];
    let setB = [];

    if (isValidValue(firstName) || isValidValue(lastName)) {
      atLeastOneCriteria = true;
    }

    if (isValidValue(firstName)) {
      setA = patients.filter(
        (p) =>
          String(p.firstName ?? "").toLowerCase() ===
          String(firstName).trim().toLowerCase()
      );
    }

    if (isValidValue(lastName)) {
      setB = patients.filter(
        (p) =>
          String(p.lastName ?? "").toLowerCase() ===
          String(lastName).trim().toLowerCase()
      );
    }

    results = [...new Map([...setA, ...setB].map((p) => [p.id, p])).values()];

    results = results.map((p) => {
      let score = 0;

      if (
        isValidValue(firstName) &&
        String(p.firstName ?? "").toLowerCase() ===
          String(firstName).trim().toLowerCase()
      ) {
        score += 1;
      }

      if (
        isValidValue(lastName) &&
        String(p.lastName ?? "").toLowerCase() ===
          String(lastName).trim().toLowerCase()
      ) {
        score += 1;
      }

      return { ...p, matchScore: score };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);
    results = results.map(({ matchScore, ...rest }) => rest);
  }

  if (isValidValue(dob)) {
    atLeastOneCriteria = true;

    const inputDobYMD = normalizeDobToYMD(dob);

    results = results.filter((p) => {
      const patientDobYMD = normalizeDobToYMD(p.dob);
      return inputDobYMD && patientDobYMD && patientDobYMD === inputDobYMD;
    });
  }

  if (isValidValue(zip)) {
    atLeastOneCriteria = true;

    results = results.filter(
      (p) => String(p.zip ?? "").trim() === String(zip).trim()
    );
  }

  if (!atLeastOneCriteria) {
    results = [];
  }

  results = results.map((p) => ({
    ...p,
    dob: formatDob(p.dob),
  }));

  res.json({ success: true, patients: results });
});