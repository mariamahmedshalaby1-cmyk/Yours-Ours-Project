const mongoose = require('mongoose');

const professionalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true,
            default: ''
        },
        profilePicture: {
            type: String,
            default: null
        },
        specialty: {
            type: String,
            enum: ['electrician', 'plumber', 'carpenter', 'cleaner', 'ac_repair', 'painter'],
            required: [true, 'Specialty is required']
        },
        experienceYears: {
            type: Number,
            min: 0,
            max: 50,
            default: 0
        },
        services: {
            type: [String],
            enum: ['repair', 'installation', 'maintenance'],
            default: []
        },
        bio: {
            type: String,
            trim: true,
            default: ''
        },
        nationalId: {
            type: String,
            default: null
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        workSessions: [
            {
                date: { type: String, required: true },
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
                serviceType: {
                    type: String,
                    enum: ['plumbing', 'electrical', 'carpentry', 'maintenance'],
                    required: true
                },
                location: { type: String, trim: true },
                status: {
                    type: String,
                    enum: ['scheduled', 'pending', 'completed', 'cancelled'],
                    default: 'pending'
                }
            }
        ],
        completedJobs: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalEarnings: { type: Number, default: 0 },
        avgResponseTime: { type: Number, default: 0 },
        startingFee:     { type: Number, default: 0, min: 0 }
        
    },
    { timestamps: true }
);

module.exports = mongoose.model('Professional', professionalSchema);
