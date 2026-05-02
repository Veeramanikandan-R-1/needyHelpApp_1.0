const { Schema, model } = require('../db/connection');

const CATEGORIES = ['merit', 'need', 'caste', 'minority', 'sports', 'arts', 'research', 'other'];
const LEVELS = ['school', 'higher_secondary', 'undergrad', 'postgrad', 'phd', 'any'];

const ScholarshipSchema = new Schema({
    name: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },     // Govt of TN, NSP, Tata Trusts, etc.
    category: { type: String, enum: CATEGORIES, default: 'other', index: true },
    level: { type: String, enum: LEVELS, default: 'any', index: true },
    summary: { type: String, default: '', maxlength: 280 },     // shown on cards
    description: { type: String, default: '', maxlength: 4000 }, // long form on detail page
    eligibility: { type: String, default: '', maxlength: 2000 },
    amount: { type: String, default: '' },                       // free-form: "Up to ₹20,000/year"
    deadline: { type: Date, index: true },                       // null = rolling / unknown
    applyUrl: { type: String, required: true, trim: true },
    state: { type: String, default: 'Tamil Nadu', trim: true, index: true },
    districts: [{ type: String, trim: true }],                   // empty = applies to all
    tags: [{ type: String, trim: true }],
    active: { type: Boolean, default: true, index: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ScholarshipSchema.index({ name: 'text', provider: 'text', summary: 'text', tags: 'text' });

ScholarshipSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        name: this.name,
        provider: this.provider,
        category: this.category,
        level: this.level,
        summary: this.summary,
        description: this.description,
        eligibility: this.eligibility,
        amount: this.amount,
        deadline: this.deadline,
        applyUrl: this.applyUrl,
        state: this.state,
        districts: this.districts,
        tags: this.tags,
        active: this.active,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

const Scholarship = model('Scholarship', ScholarshipSchema);

module.exports = Scholarship;
module.exports.CATEGORIES = CATEGORIES;
module.exports.LEVELS = LEVELS;
