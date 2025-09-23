import { TryCatch } from "../middlewares/error.js";

export const createOrder = TryCatch(async (req, res) => {
  res.json({ message: 'Order created' });
});
