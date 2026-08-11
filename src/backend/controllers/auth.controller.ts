import { Request, Response, NextFunction } from 'express';
import { syncUserSchema } from '../validators/auth.validator';
import * as authService from '../services/auth.service';
import { firebaseAuth } from '../config/firebase';
import { supabaseAdmin } from '../config/supabase';

export const sync = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    let uid = '';
    let email = '';
    let name = '';
    let picture = '';
    let isSupabase = false;

    try {
      const { data: { user: sbUser }, error: sbError } = await supabaseAdmin.auth.getUser(token);
      if (sbUser && !sbError) {
        isSupabase = true;
        uid = sbUser.id;
        email = sbUser.email || '';
        name = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || '';
        picture = sbUser.user_metadata?.avatar_url || '';
      }
    } catch (e) {
      // Fallback to Firebase
    }

    if (!isSupabase) {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      uid = decodedToken.uid;
      email = decodedToken.email || '';
      name = (decodedToken as any).name || '';
      picture = (decodedToken as any).picture || '';
    }

    const { role } = syncUserSchema.parse(req.body);

    const user = await authService.syncUser(
      uid,
      email,
      name,
      picture,
      role
    );

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
