import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';
import jwt from 'jsonwebtoken';

// generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// register new user
export const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        // validation
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, password, and name'
            });
        }

        // check if user already exists
        const existingUser = await User.findByEmail({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // create new user
        const user = await User.create({
            email,
            password,
            name
        });

        // create user preference
        await UserPreference.upsert(user.id, {
            dietary_restrictions: [],
            allergies: [],
            preferred_cuisines: [],
            default_servings: 4,
            measurement_unit: 'metric'
        });

        // generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// login user
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // verify password
        const isMatch = await User.verifyPassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // generate token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                },
                token
            },
        });
    } catch (error) {
        next(error);
    }
};

// get current user
export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

// Request password reset (placeholder - would send email in production)
export const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;

        // validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email'
            });
        }

        // find user by email
        const user = await User.findByEmail(email);

        // Don't reveal if user exists or not for security reasons
        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent'
        });
    } catch (error) {
        next(error);
    }
};
