import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authorized" });
  try {
    req.userId = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};