import { TryCatch } from "../middlewares/error.js";
import { v4 as uuidv4 } from "uuid"; // for order_id

export const createOrder = TryCatch(async (req, res) => {
  const { inputs } = req.body;

  if (!inputs) {
    return res.status(400).json({ success: false, message: "Inputs are required" });
  }

  // Generate order_id
  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

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
        studies: [
          {
            accession_number: inputs?.accession_number || "",
            exam_status: inputs?.exam_status || "",
            exam_description: inputs?.exam_description || "",
            stat_level: inputs?.stat_level || "",
            modality: inputs?.modality_code || ""
          }
        ],
        icd_codes: inputs?.icd_codes || [],
        chart_note: inputs?.chart_notes || ""
      },
      document: {
        document_type: "pdf",
        document: inputs?.base64_data || ""
      }
    }
  };
  
  res.status(201).json(response);
});

