const Artisan = require('../models/artisan.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const artisanController = {
    async signup(req, res) {
        try {
            const { fullName, email, phoneNumber, password, confirmPassword } = req.body;

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

            
            const artisan = new Artisan({
                fullName,
                email,
                phoneNumber,
                password,
                isEmailVerified: false
            });

            const otp = artisan.generateOTP();
            console.log('Generated OTP:', otp);

            await artisan.save();

            
            res.status(201).json({ 
                message: 'Registration successful. Please verify your email with the OTP.',
                email: artisan.email,
                otp 
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

        const resetToken = crypto.randomBytes(32).toString('hex');
        artisan.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        artisan.resetPasswordExpires = Date.now() + 3600000; 

            await artisan.save();

         
            res.status(200).json({
                message: 'Password reset token sent successfully',
                resetToken
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({ message: 'Reset token and new password are required' });
            }
           
            const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

            const artisan = await Artisan.findOne({
                resetPasswordToken: resetPasswordToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!artisan) {
                return res.status(400).json({ message: 'Invalid or expired reset token' });
            }

            artisan.password = newPassword;
            artisan.resetPasswordToken = undefined;
            artisan.resetPasswordExpires = undefined;
            await artisan.save();

            res.status(200).json({ message: 'Password reset successful' });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    async verifyEmail(req, res) {
        try {
            const { email, otp } = req.body;
            
        if (!email || !otp) {
                return res.status(400).json({ 
                    message: 'Email and OTP are required'
                });
            }


        const artisan = await Artisan.findOne({ 
            email,
            verificationOTP: otp,
            otpExpires: { $gt: Date.now() },
            isEmailVerified: false
        });

       
     if (!artisan) {
               return res.status(400).json({ 
                message: 'Invalid or expired OTP',
            });
        }


            artisan.isEmailVerified = true;
            artisan.verificationOTP = undefined;  
            artisan.otpExpires = undefined;
            await artisan.save();

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