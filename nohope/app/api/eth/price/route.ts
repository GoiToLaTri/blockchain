export async function GET() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
  );

  const data = await res.json();

  return Response.json(data);
}
