async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/referral/validate?code=OHNYNoGZ");
    const json = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", json);
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}
test();
