export default function handler(req, res) {
  res.status(200).json({ status: "ok", message: "FlexiRoute backend is running on Vercel!" });
}
