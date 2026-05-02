const { Schema, model } = require('../db/connection');

const STATUSES = [
    'draft', 'pending_review', 'open', 'partially_funded',
    'fully_funded', 'delivered', 'closed', 'rejected', 'cancelled',
];
const CATEGORIES = ['tuition_fee', 'books', 'uniform', 'hostel', 'exam_fee', 'other'];

const DonationSchema = new Schema({
    donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    donorName: { type: String, default: '' },     // snapshot — survives if user deleted
    amount: { type: Number, required: true, min: 1 },
    paymentRef: { type: String, default: '' },     // mock for now
    paymentStatus: { type: String, enum: ['initiated','captured','failed','refunded'], default: 'captured' },
    message: { type: String, default: '', maxlength: 280 },
    anonymous: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const SponsorshipSchema = new Schema({
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    postedByRole: { type: String, enum: ['student', 'teacher'], default: 'teacher', index: true },
    selfPosted: { type: Boolean, default: false }, // true when student posts for themselves
    // Admin-only contact info captured at creation (helps admin verify before approving)
    contactPhone: { type: String, default: '', trim: true, maxlength: 20 },
    contactEmail: { type: String, default: '', trim: true, maxlength: 120 },
    schoolOrInstitute: { type: String, default: '', trim: true, maxlength: 160 },

    studentName: { type: String, required: true, trim: true, maxlength: 80 },
    studentClass: { type: String, default: '', trim: true, maxlength: 120 },
    category: { type: String, enum: CATEGORIES, default: 'tuition_fee', index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    story: { type: String, default: '', maxlength: 1500 },
    amountTarget: { type: Number, required: true, min: 100 },
    amountRaised: { type: Number, default: 0, min: 0 },
    district: { type: String, default: '', trim: true, index: true },
    pincode: { type: String, default: '', trim: true },
    status: { type: String, enum: STATUSES, default: 'pending_review', index: true },
    reviewNotes: { type: String, default: '' },
    deadline: { type: Date },

    donations: [DonationSchema],

    deliveryProof: {
        files: [String],
        notes: { type: String, default: '' },
        uploadedAt: Date,
        verifiedByAdmin: { type: Boolean, default: false },
        verifiedAt: Date,
    },
}, { timestamps: true });

SponsorshipSchema.index({ title: 'text', story: 'text', studentName: 'text' });

SponsorshipSchema.methods.toPublicJSON = function (opts = {}) {
    const { isOwner = false, isAdmin = false } = opts;
    const json = {
        id: this._id,
        postedBy: this.postedBy,
        postedByRole: this.postedByRole,
        selfPosted: !!this.selfPosted,
        schoolOrInstitute: this.schoolOrInstitute,
        studentName: this.studentName,
        studentClass: this.studentClass,
        category: this.category,
        title: this.title,
        story: this.story,
        amountTarget: this.amountTarget,
        amountRaised: this.amountRaised,
        district: this.district,
        pincode: this.pincode,
        status: this.status,
        deadline: this.deadline,
        donationCount: this.donations.filter((d) => d.paymentStatus === 'captured').length,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
    if (isOwner || isAdmin) {
        json.reviewNotes = this.reviewNotes;
        json.deliveryProof = this.deliveryProof;
        // Contact details only ever leave the server for the owner / an admin
        json.contactPhone = this.contactPhone;
        json.contactEmail = this.contactEmail;
        json.donations = this.donations.map((d) => ({
            id: d._id,
            donorName: d.anonymous ? 'Anonymous' : d.donorName,
            amount: d.amount,
            message: d.message,
            paymentStatus: d.paymentStatus,
            createdAt: d.createdAt,
        }));
    } else {
        // Public sees recent supporters (anonymised, no amounts when anonymous)
        json.recentSupporters = this.donations
            .filter((d) => d.paymentStatus === 'captured')
            .slice(-5)
            .reverse()
            .map((d) => ({
                donorName: d.anonymous ? 'Anonymous' : d.donorName,
                amount: d.anonymous ? null : d.amount,
                message: d.message,
                createdAt: d.createdAt,
            }));
    }
    return json;
};

const Sponsorship = model('Sponsorship', SponsorshipSchema);

module.exports = Sponsorship;
module.exports.STATUSES = STATUSES;
module.exports.CATEGORIES = CATEGORIES;
