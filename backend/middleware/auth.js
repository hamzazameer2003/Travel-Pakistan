const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    console.log('🚫 AUTH: No token in Authorization header');
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  console.log('🔐 AUTH: Token received:', token.substring(0, 50) + '...');

  try {
    // Extract Bearer token
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    console.log('🔑 AUTH: Token to verify:', actualToken.substring(0, 30) + '...');
    console.log('🔑 AUTH: JWT Secret length:', process.env.JWT_SECRET.length);

    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded.user;
    console.log('✅ AUTH: Token verified for user:', req.user.id, req.user.role);
    next();
  } catch (err) {
    console.log('❌ AUTH: Token verification failed:', err.message);

    // More detailed error info
    if (err.message.includes('signature')) {
      console.log('🐛 AUTH Issue: Signature mismatch - JWT secret doesn\'t match token');
    } else if (err.message.includes('expired')) {
      console.log('🐛 AUTH Issue: Token expired');
    } else if (err.message.includes('malformed')) {
      console.log('🐛 AUTH Issue: Token is malformed');
    } else {
      console.log('🐛 AUTH Issue: Unknown error:', err.message);
    }

    console.log('🔧 AUTH: JWT Secret length:', process.env.JWT_SECRET.length);
    res.status(401).json({ error: 'Token is not valid' });
  }
};
