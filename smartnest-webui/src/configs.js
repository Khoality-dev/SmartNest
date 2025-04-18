// if it is production, use the production URL, else use the the ip in the current URL

export const API_URL = (process.env.NODE_ENV === "production") ? "https://api.stellarnest.xyz": `http://${window.location.hostname}:5000`;