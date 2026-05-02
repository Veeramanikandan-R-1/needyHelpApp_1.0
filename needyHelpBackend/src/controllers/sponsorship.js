const { Router } = require('express');
const Sponsorship = require('../models/sponsorship');
const User = require('../models/user');
const verifyJWT = require('../utils/auth');
const { requireRole } = require('../utils/auth');

const router = Router();

// ----- Helpers -----
const isOwner = (post, userId) => String(post.postedBy) === String(userId);

// ----- Public list -----
// GET /v1/sponsorships?q=&category=&district=&status=&mine=true
router.get('/', async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
        const limit = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 12));
        const filter = {};

        // Public default: only open / partially_funded / fully_funded
        if (!req.query.status) {
            filter.status = { $in: ['open', 'partially_funded', 'fully_funded'] };
        } else if (req.query.status !== 'any') {
            filter.status = req.query.status;
        }
        if (req.query.category) filter.category = req.query.category;
        if (req.query.district) filter.district = req.query.district;

        const q = (req.query.q || '').trim();
        let cursor;
        if (q) {
            cursor = Sponsorship.find({ ...filter, $text: { $search: q } }, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } });
        } else {
            cursor = Sponsorship.find(filter).sort({ createdAt: -1 });
        }

        const [total, items] = await Promise.all([
            Sponsorship.countDocuments(q ? { ...filter, $text: { $search: q } } : filter),
            cursor.skip((page - 1) * limit).limit(limit),
        ]);

        res.json({
            page, limit, total,
            sponsorships: items.map((p) => p.toPublicJSON()),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ----- My posts (teacher) -----
router.get('/mine', verifyJWT, async (req, res) => {
    try {
        const items = await Sponsorship.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
        res.json({ sponsorships: items.map((p) => p.toPublicJSON({ isOwner: true })) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ----- My donations -----
router.get('/donations/mine', verifyJWT, async (req, res) => {
    try {
        const posts = await Sponsorship.find({ 'donations.donor': req.user._id })
            .sort({ 'donations.createdAt': -1 })
            .limit(50);
        const out = [];
        for (const p of posts) {
            for (const d of p.donations) {
                if (String(d.donor) === String(req.user._id)) {
                    out.push({
                        donationId: d._id,
                        postId: p._id,
                        postTitle: p.title,
                        studentName: p.studentName,
                        amount: d.amount,
                        message: d.message,
                        paymentStatus: d.paymentStatus,
                        createdAt: d.createdAt,
                    });
                }
            }
        }
        out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({ donations: out });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ----- Admin: review queue -----
router.get('/admin/review', verifyJWT, requireRole('admin'), async (req, res) => {
    try {
        const items = await Sponsorship.find({ status: 'pending_review' }).sort({ createdAt: 1 });
        res.json({ sponsorships: items.map((p) => p.toPublicJSON({ isAdmin: true })) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ----- Detail -----
router.get('/:id', async (req, res) => {
    try {
        const post = await Sponsorship.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Not found' });
        // Pull caller user if token provided (so we can decide owner/admin view)
        let viewer = null;
        const auth = req.headers.authorization;
        if (auth) {
            try {
                const jwt = require('jsonwebtoken');
                const { accessSecretKey } = require('../../config');
                const token = auth.split('Bearer ')[1];
                viewer = jwt.verify(token, accessSecretKey);
            } catch (_) { /* ignore — public view */ }
        }
        const owner = viewer && String(viewer._id) === String(post.postedBy);
        const admin = viewer && viewer.role === 'admin';

        // Hide draft / rejected from public
        if (!owner && !admin && ['draft', 'rejected', 'cancelled'].includes(post.status)) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json({ sponsorship: post.toPublicJSON({ isOwner: owner, isAdmin: admin }) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ----- Create (student self-post OR verified teacher) -----
router.post('/', verifyJWT, async (req, res) => {
    try {
        const me = await User.findById(req.user._id);
        if (!me) return res.status(404).json({ error: 'User not found' });

        const isTeacher = me.role === 'teacher' && me.verified;
        const isStudent = me.role === 'student';
        if (!isTeacher && !isStudent) {
            return res.status(403).json({
                error: 'Only verified teachers or students can create sponsorship requests. Update your role in your profile.',
            });
        }

        const allowed = [
            'studentName', 'studentClass', 'category', 'title', 'story',
            'amountTarget', 'district', 'pincode', 'deadline',
            'contactPhone', 'contactEmail', 'schoolOrInstitute',
        ];
        const payload = {
            postedBy: req.user._id,
            postedByRole: isTeacher ? 'teacher' : 'student',
            selfPosted: isStudent,
            status: 'pending_review',
        };
        for (const k of allowed) if (k in req.body) payload[k] = req.body[k];

        // Default contact for students from their own profile if missing
        if (isStudent) {
            if (!payload.contactPhone) payload.contactPhone = me.phone || '';
            if (!payload.contactEmail) payload.contactEmail = me.email || '';
            if (!payload.studentName)  payload.studentName  = me.username || '';
        }

        if (!payload.title || !payload.studentName || !payload.amountTarget) {
            return res.status(400).json({ error: 'title, studentName and amountTarget are required' });
        }
        if (isStudent && !payload.contactPhone && !payload.contactEmail) {
            return res.status(400).json({ error: 'Add a phone or email so admin can verify your request.' });
        }

        const post = await Sponsorship.create(payload);
        res.status(201).json({ sponsorship: post.toPublicJSON({ isOwner: true }) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ----- Edit (poster while in draft/pending_review, or admin anytime) -----
router.patch('/:id', verifyJWT, async (req, res) => {
    try {
        const post = await Sponsorship.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Not found' });
        const owner = isOwner(post, req.user._id);
        const admin = req.user.role === 'admin';
        if (!owner && !admin) return res.status(403).json({ error: 'Forbidden' });
        if (owner && !admin && !['draft', 'pending_review'].includes(post.status)) {
            return res.status(400).json({ error: 'Cannot edit a published post — contact admin.' });
        }
        const allowed = [
            'studentName', 'studentClass', 'category', 'title', 'story',
            'amountTarget', 'district', 'pincode', 'deadline',
            'contactPhone', 'contactEmail', 'schoolOrInstitute',
        ];
        for (const k of allowed) if (k in req.body) post[k] = req.body[k];
        await post.save();
        res.json({ sponsorship: post.toPublicJSON({ isOwner: owner, isAdmin: admin }) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ----- Admin review decision -----
router.post('/:id/review', verifyJWT, requireRole('admin'), async (req, res) => {
    try {
        const { decision, notes } = req.body;
        if (!['open', 'rejected'].includes(decision)) {
            return res.status(400).json({ error: 'decision must be "open" or "rejected"' });
        }
        const post = await Sponsorship.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Not found' });
        if (post.status !== 'pending_review') {
            return res.status(400).json({ error: `Post is not pending review (current: ${post.status})` });
        }
        post.status = decision;
        post.reviewNotes = notes || '';
        await post.save();
        res.json({ sponsorship: post.toPublicJSON({ isAdmin: true }) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ----- Donate (mock payment for v0) -----
router.post('/:id/donate', verifyJWT, async (req, res) => {
    try {
        const { amount, message = '', anonymous = false } = req.body;
        const amt = Number(amount);
        if (!Number.isFinite(amt) || amt < 1) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }
        const post = await Sponsorship.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Not found' });
        if (!['open', 'partially_funded'].includes(post.status)) {
            return res.status(400).json({ error: 'This post is not accepting donations.' });
        }
        const me = await User.findById(req.user._id);
        post.donations.push({
            donor: req.user._id,
            donorName: me?.username || 'Friend',
            amount: amt,
            paymentRef: `mock_${Date.now()}`,
            paymentStatus: 'captured',
            message: String(message).slice(0, 280),
            anonymous: !!anonymous,
        });
        post.amountRaised = (post.amountRaised || 0) + amt;
        if (post.amountRaised >= post.amountTarget) {
            post.status = 'fully_funded';
        } else {
            post.status = 'partially_funded';
        }
        await post.save();
        res.json({ sponsorship: post.toPublicJSON() });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// ----- Cancel (poster or admin) -----
router.post('/:id/cancel', verifyJWT, async (req, res) => {
    try {
        const post = await Sponsorship.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Not found' });
        const admin = req.user.role === 'admin';
        if (!isOwner(post, req.user._id) && !admin) return res.status(403).json({ error: 'Forbidden' });
        if (post.amountRaised > 0) {
            return res.status(400).json({ error: 'Cannot cancel a post that has received donations.' });
        }
        post.status = 'cancelled';
        await post.save();
        res.json({ sponsorship: post.toPublicJSON({ isOwner: true, isAdmin: admin }) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
