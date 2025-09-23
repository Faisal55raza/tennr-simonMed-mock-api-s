import { TryCatch } from "../middlewares/error.js";

export const getProviders = TryCatch(async (req, res) => {
 const { id, npi, fax, firstName, lastName, zip } = req.body;

  let results = providers;

  if (id && id.trim() !== "") {
    // Priority: Search by ID
    results = providers.filter((p) => p.id.toString() === id.trim());
  } else if (npi && npi.trim() !== "") {
    // Next: Search by NPI
    results = providers.filter((p) => p.providerNPI === npi.trim());
  } else if (fax && fax.trim() !== "") {
    // Next: Search by Fax
    results = providers.filter((p) => p.fax === fax.trim());
  } else {
    // Fallback: Union of First Name and Last Name
    let setA = [];
    let setB = [];

    if ((firstName && firstName.trim() !== "") || (lastName && lastName.trim() !== "")) {
      if (firstName && firstName.trim() !== "") {
        const fn = firstName.trim().toLowerCase();
        setA = providers.filter((p) => p.providerFirstName.toLowerCase() === fn);
      }

      if (lastName && lastName.trim() !== "") {
        const ln = lastName.trim().toLowerCase();
        setB = providers.filter((p) => p.providerLastName.toLowerCase() === ln);
      }

      // Union of A and B (avoid duplicates by ID)
      results = [...new Map([...setA, ...setB].map((p) => [p.id, p])).values()];
    } else {
      results = []; // no search criteria provided
    }
  }

  // Apply filters
  if (zip && zip.trim() !== "") {
    results = results.filter((p) => p.address.zip === zip.trim());
  }

  res.json({ success: true, providers: results });

});
