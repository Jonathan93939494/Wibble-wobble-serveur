// ==========================================
// MIDDLEWARE D'AUTHENTIFICATION
// Gestion des sessions et validation des tokens
// ==========================================

function authMiddleware(sessions) {
  return (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token manquant. Veuillez vous connecter.'
      });
    }

    const sessionToken = token.replace('Bearer ', '');
    const session = sessions.get(sessionToken);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Session invalide ou expirée.'
      });
    }

    // Vérifier l'expiration (24h)
    const now = Date.now();
    if (now - session.createdAt > 24 * 60 * 60 * 1000) {
      sessions.delete(sessionToken);
      return res.status(401).json({
        success: false,
        error: 'Session expirée. Veuillez vous reconnecter.'
      });
    }

    req.session = session;
    req.sessionToken = sessionToken;
    next();
  };
}

module.exports = { authMiddleware };
