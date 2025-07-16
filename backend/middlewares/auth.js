const jwt = require("jsonwebtoken");

const auth = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    const token =
      req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.rol)) {
        return res.status(403).json({ error: "Acceso denegado por rol" });
      }

      next();
    } catch (err) {
      console.error("❌ Token inválido:", err);
      return res.status(401).json({ error: "Token inválido" });
    }
  };
};

module.exports = auth;
