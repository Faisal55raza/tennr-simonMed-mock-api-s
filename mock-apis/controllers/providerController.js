import { TryCatch } from "../middlewares/error.js";
import providers from "../models/providers.json" with { type: "json" };

function isValidValue(value) {
  const str = String(value ?? "").trim().toLowerCase();
  return str !== "" && str !== "null" && str !== "undefined";
}

function searchByName(firstName, lastName) {
  let setA = [];
  let setB = [];

  if (isValidValue(firstName)) {
    const fn = String(firstName).trim().toLowerCase();
    setA = providers.filter(
      (p) => String(p.providerFirstName ?? "").toLowerCase() === fn
    );
  }

  if (isValidValue(lastName)) {
    const ln = String(lastName).trim().toLowerCase();
    setB = providers.filter(
      (p) => String(p.providerLastName ?? "").toLowerCase() === ln
    );
  }

  // Union without duplicates, then rank exact matches first
  return [...new Map([...setA, ...setB].map((p) => [p.id, p])).values()]
    .map((p) => {
      let score = 0;

      if (
        isValidValue(firstName) &&
        String(p.providerFirstName ?? "").toLowerCase() ===
          String(firstName).trim().toLowerCase()
      ) {
        score++;
      }

      if (
        isValidValue(lastName) &&
        String(p.providerLastName ?? "").toLowerCase() ===
          String(lastName).trim().toLowerCase()
      ) {
        score++;
      }

      return { ...p, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .map(({ matchScore, ...rest }) => rest);
}

function filterByZip(list, zip) {
  return list.filter(
    (p) => String(p.zip ?? "").trim() === String(zip).trim()
  );
}

export const getProviders = TryCatch(async (req, res) => {
  const { id, npi, fax, firstName, lastName, zip } = req.body;

  let results = [];

  // 1. Search by ID
  const hasId = isValidValue(id);
  if (hasId) {
    results = providers.filter((p) => String(p.id) === String(id).trim());
  }

  // 2. If no results, search by NPI
  const hasNpi = isValidValue(npi);
  if (results.length === 0 && hasNpi) {
    results = providers.filter((p) => p.providerNPI === String(npi).trim());
  }

  // 3. If still no results, search by Fax
  const hasFax = isValidValue(fax);
  if (results.length === 0 && hasFax) {
    results = providers.filter((p) => p.fax === String(fax).trim());
  }

  // 4. If still no results, search by Name
  const hasName = isValidValue(firstName) || isValidValue(lastName);
  if (results.length === 0 && hasName) {
    results = searchByName(firstName, lastName);
  }

  // 5. If ZIP is provided, narrow results — but keep results if none match
  const hasZip = isValidValue(zip);
  if (hasZip && results.length > 0) {
    const zipFiltered = filterByZip(results, zip);
    if (zipFiltered.length > 0) {
      results = zipFiltered;
    }
  }

  // 6. If no valid criteria provided, return empty results
  const hasAnyCriteria = hasId || hasNpi || hasFax || hasName || hasZip;
  if (!hasAnyCriteria) {
    results = [];
  }

  res.json({
    success: true,
    providers: results,
  });
});