import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import nodemailer from 'nodemailer';
import { redisClient } from '../config/redis';
import crypto from 'crypto';

interface AuthRequest extends Request {
  user?: { id: string };
}

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.REFRESH_SECRET as string,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ msg: 'User already exists' });
      return;
    }
    
    user = new User({ name, email, password });
    await user.save();
    
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
    
    // Store refresh token in Redis with expiration
    await redisClient.setEx(`refresh_token:${user._id}`, 7 * 24 * 60 * 60, refreshToken);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ 
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !await user.matchPassword(password)) {
      // Track failed login attempts
      const failedKey = `failed_login:${req.ip}`;
      const count = await redisClient.incr(failedKey);
      if (count === 1) await redisClient.expire(failedKey, 300); // 5 minutes
      
      if (count > 5) {
        await redisClient.setEx(`blocked_ip:${req.ip}`, 3600, '1'); // Block for 1 hour
      }
      
      res.status(401).json({ msg: 'Invalid credentials' });
      return;
    }
    
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
    
    // Invalidate old refresh token and store new one
    await redisClient.del(`refresh_token:${user._id}`);
    await redisClient.setEx(`refresh_token:${user._id}`, 7 * 24 * 60 * 60, refreshToken);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ 
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ msg: 'No refresh token' });
    return;
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string) as { id: string };
    
    // Check if token exists in Redis
    const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);
    if (!storedToken || storedToken !== refreshToken) {
      res.status(401).json({ msg: 'Invalid refresh token' });
      return;
    }
    
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ msg: 'User not found' });
      return;
    }
    
    // Generate new tokens (refresh token rotation)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.role);
    
    // Replace old refresh token with new one
    await redisClient.del(`refresh_token:${user._id}`);
    await redisClient.setEx(`refresh_token:${user._id}`, 7 * 24 * 60 * 60, newRefreshToken);
    
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ token: accessToken });
  } catch (err) {
    res.status(401).json({ msg: 'Invalid refresh token' });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await redisClient.del(`refresh_token:${req.user.id}`);
    }
    res.clearCookie('refreshToken');
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Store reset token in Redis with 10 minute expiration
    await redisClient.setEx(`reset_token:${resetTokenHash}`, 600, user._id.toString());
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset - DevHub',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    
    res.json({ msg: 'Reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error sending email' });
  }
};

export const confirmResetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;
  try {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await redisClient.get(`reset_token:${resetTokenHash}`);
    
    if (!userId) {
      res.status(400).json({ msg: 'Invalid or expired reset token' });
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    
    user.password = password;
    await user.save();
    
    // Delete the reset token
    await redisClient.del(`reset_token:${resetTokenHash}`);
    
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, skills, bio, profileStep, github, linkedin, website } = req.body;
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    
    if (name) user.name = name;
    if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim());
    if (bio) user.bio = bio;
    if (profileStep !== undefined) user.profileStep = profileStep;
    if (github) user.github = github;
    if (linkedin) user.linkedin = linkedin;
    if (website) user.website = website;
    
    await user.save();
    
    res.json({
      msg: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        bio: user.bio,
        profileStep: user.profileStep,
        github: user.github,
        linkedin: user.linkedin,
        website: user.website
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};