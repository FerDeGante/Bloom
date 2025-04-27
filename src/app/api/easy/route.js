import axios from "axios";
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const servicioId = searchParams.get("servicio");
  try {
    const { data } = await axios.get(
      `${process.env.EA_BASE}/v1/slots`,
      { params: { service_id: servicioId }, headers: { "X-Api-Key": process.env.EA_KEY } }
    );
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: "Error EasyAppointments" }, { status: 500 });
  }
}
