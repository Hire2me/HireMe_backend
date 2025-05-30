const Artisan = require('../models/artisan.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const artisanController = {
    async signup(req, res) {
        try {
            const { fullName, email, phoneNumber, password } = req.body;

            if (!fullName || !email || !phoneNumber || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }


            if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

            const existingArtisan = await Artisan.findOne({ 
                $or: [
                    { email },
                    { phoneNumber }
                ]
            });
            if (existingArtisan) {
                if (existingArtisan.email === email) {
                    return res.status(400).json({ message: 'Email already registered' });
                }
                if (existingArtisan.phoneNumber === phoneNumber) {
                    return res.status(400).json({ message: 'Phone number already registered' });
                }
            }

            const verificationToken = crypto.randomBytes(32).toString('hex');
            console.log('Generated token:', verificationToken);

            const artisan = new Artisan({
                fullName,
                email,
                phoneNumber,
                password,
                verificationToken,
                isEmailVerified: false
            });

            await artisan.save();

            const savedArtisan = await Artisan.findById(artisan._id); 
            console.log('Saved artisan token:', savedArtisan.verificationToken);
            
            
            const verifyEmailLink = `${process.env.BASE_URL}/api/artisans/verify-email/${verificationToken}`;
            
            res.status(201).json({ 
                message: 'Registration successful. Please verify your email.',
                verifyEmailLink, 
                verificationToken: verificationToken
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const artisan = await Artisan.findOne({ email });
            if (!artisan) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await artisan.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            if (!artisan.isEmailVerified) {
                return res.status(401).json({ message: 'Please verify your email first' });
            }

            const token = jwt.sign(
                { artisanId: artisan._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                artisan: {
                    id: artisan._id,
                    fullName: artisan.fullName,
                    email: artisan.email
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            const artisan = await Artisan.findOne({ email });
            if (!artisan) {
                return res.status(404).json({ message: 'No artisan found with this email' });
            }

            const resetToken = artisan.generatePasswordResetToken();
            await artisan.save();

            
            const resetLink = `${process.env.BASE_URL}/reset-password/${resetToken}`;

            res.status(200).json({
                message: 'Password reset instructions sent to email',
                resetLink
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({ message: 'Token and new password are required' });
            }

            const artisan = await Artisan.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!artisan) {
                return res.status(400).json({ message: 'Invalid or expired reset token' });
            }

            artisan.password = newPassword;
            artisan.clearPasswordResetToken();
            await artisan.save();

            res.status(200).json({ message: 'Password reset successful' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async verifyEmail(req, res) {
        try {
            const { token } = req.params;
            console.log('Attempting to verify token:', token);

        const artisan = await Artisan.findOne({ 
            verificationToken: token,
            isEmailVerified: false 
        });

        
        const allArtisans = await Artisan.find({});
        console.log('All artisans:', JSON.stringify(allArtisans.map(a => ({
            email: a.email,
            token: a.verificationToken,
            isVerified: a.isEmailVerified
        })), null, 2));

       
     if (!artisan) {
               return res.status(400).json({ 
                message: 'Invalid verification token',
                debug: 'No artisan found with this token'
            });
        }


            artisan.isEmailVerified = true;
            artisan.verificationToken = undefined;
            await artisan.save();

            console.log('Successfully verified artisan:', artisan.email);

            res.status(200).json({ 
                message: 'Email verified successfully',
                email: artisan.email
            });
        } catch (error) {
            console.error('Verification error:', error); 
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = artisanController;