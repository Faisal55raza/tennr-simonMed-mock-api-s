import { TryCatch } from "../middlewares/error.js";
import providers from "../models/providers.json" with { type: "json" };

export const getProviders = TryCatch(async (req, res) => {
  const { id, npi, fax, firstName, lastName, zip } = req.body;

  let results = providers;

  if (id && id.trim() !== "") {
    // Priority: Search by ID
    results = providers.filter((p) => p.id.toString() == id.trim());
  } else if (npi && npi.trim() !== "" && npi.trim() != "null") {
    // Next: Search by NPI
    results = providers.filter((p) => p.providerNPI == npi.trim());
  } else if (fax && fax.trim() !== "" && fax.trim() != "null") {
    // Next: Search by Fax
    results = providers.filter((p) => p.fax == fax.trim());
  } else {
    // Fallback: Union of First Name and Last Name
    let setA = [];
    let setB = [];

    if ((firstName && firstName.trim() !== "") || (lastName && lastName.trim() !== "")) {
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

      // Union of A and B (avoid duplicates by ID)
      results = [...new Map([...setA, ...setB].map((p) => [p.id, p])).values()];

      // Assign matchScore for sorting
      results = results.map((p) => {
        let score = 0;

        if (
          firstName &&
          firstName.trim() !== "" &&
          p.providerFirstName.toLowerCase() == firstName.trim().toLowerCase()
        ) {
          score += 1;
        }
        if (
          lastName &&
          lastName.trim() !== "" &&
          p.providerLastName.toLowerCase() == lastName.trim().toLowerCase()
        ) {
          score += 1;
        }

        return { ...p, matchScore: score };
      });

      // Sort by score (best matches first)
      results.sort((a, b) => b.matchScore - a.matchScore);

      // Remove matchScore before sending response
      results = results.map(({ matchScore, ...rest }) => rest);
    } else {
      results = []; // no search criteria provided
    }
  }

  // Apply filters


  res.json({ success: true, providers: results });
});
