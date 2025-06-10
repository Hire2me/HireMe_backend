const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');

// Replace this with your actual User model or DB methods
const User = require('../models/user.model'); // Adjust path to your User model

dotenv.config();

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log('Google profile received:', profile.id);

                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    console.log('Google user already exists:', user.id);
                    return done(null, user);
                }

                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    console.log('User with same email exists, linking Google account...');

                    user.googleId = profile.id;
                    user.fullName = user.fullName || profile.displayName;
                    user.profilePic = user.profilePic || profile.photos[0].value;
                    user.isVerified = true;
                    await user.save();

                    console.log('User updated with Google info:', user.id);
                    return done(null, user);
                }

                const newUser = new User({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    fullName: profile.displayName,
                    profilePic: profile.photos[0].value,
                    isVerified: true,
                });

                await newUser.save();
                console.log('New Google user created:', newUser.id);
                return done(null, newUser);
            } catch (error) {
                console.error('Error during Google authentication:', error);
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
