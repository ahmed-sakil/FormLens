import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin, supabaseUrl, supabaseAnonKey } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required: missing Authorization Bearer header.' } });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required: invalid or missing access token.' } });
  }

  try {
    let user = null;
    let authError = null;

    // Strategy 1: Attempt verification via supabaseAdmin
    try {
      const adminResult = await supabaseAdmin.auth.getUser(token);
      if (adminResult?.data?.user) {
        user = adminResult.data.user;
      } else {
        authError = adminResult?.error;
      }
    } catch (adminErr) {
      authError = adminErr;
    }

    // Strategy 2: If admin client verification fails, verify directly with user token client
    if (!user) {
      try {
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
          global: { headers: { Authorization: `Bearer ${token}` } }
        });
        const userResult = await userClient.auth.getUser();
        if (userResult?.data?.user) {
          user = userResult.data.user;
          authError = null;
        } else {
          authError = userResult?.error || authError;
        }
      } catch (fallbackErr) {
        authError = fallbackErr;
      }
    }

    if (!user) {
      logger.security('Invalid authentication attempt', { error: authError?.message || 'User not found', ip: req.ip });
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'UNAUTHORIZED', 
          message: `Authentication failed: ${authError?.message || 'Invalid or expired session token.'}` 
        } 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('Auth middleware execution error', { error: err.message });
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: `Authentication error: ${err.message}` } });
  }
}
