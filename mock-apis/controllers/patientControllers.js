import { TryCatch } from "../middlewares/error.js";
import patients from "../models/patient.json" with { type: "json" };

function isValidValue(value) {
  const str = String(value ?? "").trim().toLowerCase();
  return str !== "" && str !== "null" && str !== "undefined";
}

function normalizeDobToYMD(value) {
  if (!isValidValue(value)) return "";

  const str = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.split("T")[0];
  }

  const mdySlash = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdySlash) {
    const [, month, day, year] = mdySlash;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const mdyDash = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (mdyDash) {
    const [, month, day, year] = mdyDash;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return "";
}

function formatDob(dob) {
  const ymd = normalizeDobToYMD(dob);
  if (!ymd) return "";

  const [year, month, day] = ymd.split("-");
  return `${month}/${day}/${year}`;
}

function filterByDob(list, dob) {
  const inputDobYMD = normalizeDobToYMD(dob);
  if (!inputDobYMD) return [];

  return list.filter((p) => {
    const patientDobYMD = normalizeDobToYMD(p.dob);
    return patientDobYMD && patientDobYMD === inputDobYMD;
  });
}

function filterByZip(list, zip) {
  return list.filter(
    (p) => String(p.zip ?? "").trim() === String(zip).trim()
  );
}

function searchByName(firstName, lastName) {
  let setA = [];
  let setB = [];

  if (isValidValue(firstName)) {
    const fn = String(firstName).trim().toLowerCase();
    setA = patients.filter(
      (p) => String(p.firstName ?? "").toLowerCase() === fn
    );
  }

  if (isValidValue(lastName)) {
    const ln = String(lastName).trim().toLowerCase();
    setB = patients.filter(
      (p) => String(p.lastName ?? "").toLowerCase() === ln
    );
  }

  return [...new Map([...setA, ...setB].map((p) => [p.id, p])).values()]
    .map((p) => {
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
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .map(({ matchScore, ...rest }) => rest);
}

export const getPatients = TryCatch(async (req, res) => {
  const { mrn, firstName, lastName, dob, zip } = req.body;

  let results = [];

  // 1. Search by MRN
  if (isValidValue(mrn)) {
    results = patients.filter(
      (p) => String(p.mrn) === String(mrn).trim()
    );
  }

  // 2. If no results, search by First Name / Last Name
  if (
    results.length === 0 &&
    (isValidValue(firstName) || isValidValue(lastName))
  ) {
    results = searchByName(firstName, lastName);
  }

  // 3. If DOB is provided, filter current results.
  // If no previous result exists, search all patients by DOB.
  if (isValidValue(dob)) {
  results =
    results.length > 0
      ? filterByDob(results, dob)
      : results;
}

if (isValidValue(zip)) {
  results =
    results.length > 0
      ? filterByZip(results, zip)
      : results;
}

  // 5. If no valid criteria provided, return empty results
  if (
    !isValidValue(mrn) &&
    !isValidValue(firstName) &&
    !isValidValue(lastName) &&
    !isValidValue(dob) &&
    !isValidValue(zip)
  ) {
    results = [];
  }

  results = results.map((p) => ({
    ...p,
    dob: formatDob(p.dob),
  }));

  res.json({ success: true, patients: results });
});