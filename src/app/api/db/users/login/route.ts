import { connectDB } from '@/lib/mongoose';
import { UserModel } from '@/models';

// POST /api/db/users/login — authenticate user
export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    let user = await UserModel.findOne({ email: email.toLowerCase() });
    
    // Demo auto-seed logic
    if (!user && (email === 'admin@naturenook.com' || email === 'user@naturenook.com')) {
      const role = email === 'admin@naturenook.com' ? 'admin' : 'user';
      const name = role === 'admin' ? 'Admin User' : 'Demo User';
      
      user = await UserModel.create({
        _id: `user-${Date.now()}`,
        name,
        email,
        password, // The model hook will hash this
        role
      });
    }

    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user.toJSON();
    return Response.json(safeUser);
  } catch (error: unknown) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
