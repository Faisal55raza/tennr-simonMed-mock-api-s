import { TryCatch } from "../middlewares/error.js";


export const createOrder = TryCatch(async (req, res) => {
  const { inputs } = req.body;

  if (!inputs) {
    return res.status(400).json({ success: false, message: "Inputs are required" });
  }

  // Generate order_id
  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

  // Handle exam_description as array
  const examDescriptions = Array.isArray(inputs.exam_description) ? inputs.exam_description : [inputs.exam_description];

  const studies = examDescriptions.map((desc, index) => ({
    accession_number: inputs.accession_number || `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
    exam_status: inputs.exam_status || "",
    exam_description: desc || "",
    stat_level: inputs.stat_level || "",
    modality: inputs.modality_code || ""
  }));

  // Build response
  const response = {
    outputs: {
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
      order: {
        facility_code: inputs?.facility_code || "",
        institution: inputs?.institution || "",
        physician_info: inputs?.physician_info || "",
        ordering_provider: inputs?.ordering_provider || "",
        studies,
        icd_codes: inputs?.icd_codes || [],
        chart_note: inputs?.chart_notes || ""
      },
      document: {
        document_name: inputs?.document_name || "document.pdf",
        document_type: inputs?.document_name?.split('.').pop() || 'pdf',
        document: inputs?.base64_data || ""
      }
    }
  };

  res.status(201).json(response);
});
