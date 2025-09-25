import { TryCatch } from "../middlewares/error.js";


export const createOrder = TryCatch(async (req, res) => {
  const { inputs } = req.body;

  if (!inputs) {
    return res.status(400).json({ success: false, message: "Inputs are required" });
  }

  // Generate order_id
  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

  // Handle exam_description as array
  

  // Build response
  const order = {
      order_id: orderId,
      patient: {
        patient_id: inputs?.patient_id || "",
        patient_name: inputs?.patient_name || "",
        dob: inputs?.dob || "",
        gender: inputs?.gender || "",
        patient_address: inputs?.patient_address || "",
        patient_contact: inputs?.patient_contact || "",
        work_phone: inputs?.work_phone || ""
      },
      orderInfo: {
        facility_code: inputs?.facility_code || "",
        institution: inputs?.institution || "",
        physician_info: inputs?.physician_info || "",
        ordering_provider: inputs?.ordering_provider || "",
        studies: inputs?.studies || "",
        icd_codes: inputs?.icd_codes || [],
        chart_note: inputs?.chart_notes || ""
      },
      document: {
        document_name: inputs?.document_name || "document.pdf",
        document_type: inputs?.document_name?.split('.').pop() || 'pdf',
        document: inputs?.base64_data || ""
      }
  };

  res.status(201).json({success : true,order});
});
