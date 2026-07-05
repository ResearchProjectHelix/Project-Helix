const os = require("os");

function getDeviceId() {
  return `${os.hostname()}-${os.platform()}-${os.arch()}`;
}

async function checkLicense() {
  try {
    const deviceId = getDeviceId();

    const res = await fetch("https://YOUR_SUPABASE_OR_API_ENDPOINT/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        deviceId
        // later add: email / license key
      })
    });

    const data = await res.json();

    return data.valid === true;
  } catch (err) {
    console.error("License check failed:", err);
    return false;
  }
}

module.exports = { checkLicense };