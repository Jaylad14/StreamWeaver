const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateOtp, hashOtp } = require('../utils/otp');
const { sendOtp } = require('../utils/mailer');

const router = express.Router();

const loginFailures = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;

const failureState = (email) => {
  const now = Date.now();
  const entry = loginFailures.get(email);
  if (!entry || now - entry.first > LOGIN_WINDOW_MS) {
    const fresh = { count: 0, first: now };
    loginFailures.set(email, fresh);
    return fresh;
  }
  return entry;
};
const OTP_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_SECONDS = 60;

const normalise = (value) => String(value || '').toLowerCase().trim();

const issueOtp = async (user) => {
  const code = generateOtp();
  user.otpHash = hashOtp(code);
  user.otpExpires = new Date(Date.now() + OTP_MINUTES * 60 * 1000);
  user.otpAttempts = 0;
  user.otpSentAt = new Date();
  await user.save();
  await sendOtp(user.email, code);
};

router.post('/signup', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalise(req.body.email);
    const password = String(req.body.password || '');
    if (!name || !email || password.length < 8) {
      return res.status(400).json({ error: 'Enter your name, email, and a password of at least 8 characters.' });
    }
    if (await User.exists({ email })) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ name, email, passwordHash, role: 'user', verified: false });
    await issueOtp(user);
    res.status(201).json({ message: 'Account created. Enter the verification code.', email });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Sign-up failed. Try again.' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const email = normalise(req.body.email);
    const code = String(req.body.code || '').trim();
    const user = await User.findOne({ email });
    if (!user || user.verified !== false) {
      return res.status(400).json({ error: 'No pending verification for this email.' });
    }
    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'The code has expired. Request a new one.' });
    }
    if (user.otpAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many wrong attempts. Request a new code.' });
    }
    if (hashOtp(code) !== user.otpHash) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ error: 'Incorrect code.' });
    }
    user.verified = true;
    user.otpHash = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();
    res.json({ message: 'Email verified. You can sign in now.' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed. Try again.' });
  }
});

router.post('/resend', async (req, res) => {
  try {
    const email = normalise(req.body.email);
    const user = await User.findOne({ email });
    if (!user || user.verified !== false) {
      return res.status(400).json({ error: 'No pending verification for this email.' });
    }
    const waited = (Date.now() - (user.otpSentAt ? user.otpSentAt.getTime() : 0)) / 1000;
    if (waited < RESEND_SECONDS) {
      return res.status(429).json({ error: `Wait ${Math.ceil(RESEND_SECONDS - waited)} seconds before requesting another code.` });
    }
    await issueOtp(user);
    res.json({ message: 'A new code has been sent.' });
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ error: 'Could not send a new code. Try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalise(req.body.email);
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const state = failureState(email);
    if (state.count >= LOGIN_MAX_FAILURES) {
      const minutes = Math.ceil((LOGIN_WINDOW_MS - (Date.now() - state.first)) / 60000);
      return res.status(429).json({ error: `Too many failed attempts. Try again in ${minutes} minute(s).` });
    }

    const user = await User.findOne({ email });
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!valid) {
      state.count += 1;
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    loginFailures.delete(email);
    if (user.disabled) {
      return res.status(403).json({ error: 'This account has been disabled.' });
    }
    if (user.verified === false) {
      return res.status(403).json({ error: 'Verify your email before signing in.', needsVerification: true });
    }
    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, email: user.email, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Sign-in failed. Try again.' });
  }
});

module.exports = router;
