const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const leads = [];
let nextLeadId = 1;

const normalizeStatus = (status) => {
  const allowed = ["new", "contacted", "closed"];
  return allowed.includes(status) ? status : "new";
};

app.post("/api/lead", (req, res) => {
  const { name, phone, selectedService, selectedPackage, price } = req.body;

  if (!name || !phone || !selectedService || !selectedPackage || price === undefined) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, phone, selectedService, selectedPackage, price"
    });
  }

  const lead = {
    id: nextLeadId++,
    name: String(name).trim(),
    phone: String(phone).trim(),
    selectedService: String(selectedService).trim(),
    selectedPackage: String(selectedPackage).trim(),
    price: Number(price) || 0,
    status: "new",
    createdAt: new Date().toISOString()
  };

  leads.push(lead);

  return res.status(201).json({
    success: true,
    message: "Lead captured successfully",
    data: lead
  });
});

app.get("/api/leads", (_req, res) => {
  res.json({ success: true, data: leads });
});

app.patch("/api/leads/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const lead = leads.find((item) => item.id === id);

  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found" });
  }

  lead.status = normalizeStatus(status);

  return res.json({ success: true, data: lead });
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Baansiam Connect server running on port ${PORT}`);
});
