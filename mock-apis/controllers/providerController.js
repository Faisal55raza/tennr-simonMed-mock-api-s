import { TryCatch } from "../middlewares/error.js";
import providers from "../models/providers.json" with { type: "json" };

export const getProviders = TryCatch(async (req, res) => {
  const { id, npi, fax, firstName, lastName, zip } = req.body;

  let results = [];

  // 1. Search by ID
  if (id && id.trim() !== "") {
    results = providers.filter((p) => p.id.toString() === id.trim());
  }

  // 2. If no results, search by NPI
  if (
    results.length === 0 &&
    npi &&
    npi.trim() !== "" &&
    npi.trim() !== "null"
  ) {
    results = providers.filter((p) => p.providerNPI === npi.trim());
  }

  // 3. If still no results, search by Fax
  if (
    results.length === 0 &&
    fax &&
    fax.trim() !== "" &&
    fax.trim() !== "null"
  ) {
    results = providers.filter((p) => p.fax === fax.trim());
  }

  // 4. If still no results, search by Name
  if (
    results.length === 0 &&
    ((firstName && firstName.trim() !== "") ||
      (lastName && lastName.trim() !== ""))
  ) {
    let setA = [];
    let setB = [];

    if (firstName && firstName.trim() !== "") {
      const fn = firstName.trim().toLowerCase();
      setA = providers.filter(
        (p) => p.providerFirstName.toLowerCase() === fn
      );
    }

    if (lastName && lastName.trim() !== "") {
      const ln = lastName.trim().toLowerCase();
      setB = providers.filter(
        (p) => p.providerLastName.toLowerCase() === ln
      );
    }

    // Union without duplicates
    results = [
      ...new Map([...setA, ...setB].map((p) => [p.id, p])).values(),
    ];

    // Rank exact matches first
    results = results
      .map((p) => {
        let score = 0;

        if (
          firstName &&
          p.providerFirstName.toLowerCase() ===
            firstName.trim().toLowerCase()
        ) {
          score++;
        }

        if (
          lastName &&
          p.providerLastName.toLowerCase() ===
            lastName.trim().toLowerCase()
        ) {
          score++;
        }

        return { ...p, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .map(({ matchScore, ...rest }) => rest);
  }

  res.json({
    success: true,
    providers: results,
  });
});