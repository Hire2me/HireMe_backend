const mongoose = require('mongoose');

const workImageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        }
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('WorkImage', workImageSchema);