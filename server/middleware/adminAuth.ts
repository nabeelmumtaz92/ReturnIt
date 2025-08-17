import { Request, Response, NextFunction } from 'express';

// Admin authentication middleware
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.session?.user) {
    return res.status(401).json({ 
      message: "Authentication required",
      redirect: "/login"
    });
  }

  const user = req.session.user;
  
  // Master admin list
  const masterAdmins = ['nabeelmumtaz92@gmail.com', 'durremumtaz@gmail.com'];
  
  // Strict admin check - only master admins
  if (!user.isAdmin || !masterAdmins.includes(user.email)) {
    console.log(`Unauthorized admin access attempt by: ${user.email} (isAdmin: ${user.isAdmin})`);
    return res.status(403).json({ 
      message: "Admin access required. Unauthorized access denied.",
      redirect: "/"
    });
  }

  // Log admin access for security monitoring
  console.log(`Admin access granted to: ${user.email} for ${req.path}`);
  next();
}

// Middleware to check if user is admin (without blocking)
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.session?.user;
  const masterAdmins = ['nabeelmumtaz92@gmail.com', 'durremumtaz@gmail.com'];
  (req as any).isAdmin = user?.isAdmin && masterAdmins.includes(user?.email);
  next();
}