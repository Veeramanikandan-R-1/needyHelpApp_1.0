const { Router } = require('express');
const Scholarship = require('../models/scholarship');
const verifyJWT = require('../utils/auth');
const { requireRole } = require('../utils/auth');

const router = Router();

// Public: list scholarships with filters
// GET /v1/scholarships?q=&category=&level=&district=&active=&upcoming=&page=&limit=
router.get('/', async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
        const limit = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 12));
        const filter = {};

        // By default only show active scholarships to public; admin can pass active=any
        if (req.query.active !== 'any') filter.active = true;

        if (req.query.category) filter.category = req.query.category;
        if (req.query.level)    filter.level    = req.query.level;
        if (req.query.district) {
            const d = req.query.district.trim();
            // Match scholarships open to this district OR statewide (empty districts array)
            filter.$or = [{ districts: d }, { districts: { $size: 0 } }];
        }
        if (req.query.upcoming === 'true') {
            filter.$and = (filter.$and || []).concat([{
                $or: [{ deadline: null }, { deadline: { $gte: new Date() } }],
            }]);
        }

        const q = (req.query.q || '').trim();
        let cursor;
        if (q) {
            cursor = Scholarship.find({ ...filter, $text: { $search: q } }, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } });
        } else {
            cursor = Scholarship.find(filter).sort({ deadline: 1, createdAt: -1 });
        }

        const [total, items] = await Promise.all([
            Scholarship.countDocuments(q ? { ...filter, $text: { $search: q } } : filter),
            cursor.skip((page - 1) * limit).limit(limit),
        ]);

        res.json({
            page, limit, total,
            scholarships: items.map((s) => s.toPublicJSON()),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Public: single scholarship
router.get('/:id', async (req, res) => {
    try {
        const s = await Scholarship.findById(req.params.id);
        if (!s || (!s.active && req.headers.authorization === undefined)) {
            return res.status(404).json({ error: 'Scholarship not found' });
        }
        res.json({ scholarship: s.toPublicJSON() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Admin: create
router.post('/', verifyJWT, requireRole('admin'), async (req, res) => {
    try {
        const allowed = [
            'name', 'provider', 'category', 'level', 'summary', 'description',
            'eligibility', 'amount', 'deadline', 'applyUrl', 'state', 'districts', 'tags', 'active',
        ];
        const payload = {};
        for (const k of allowed) if (k in req.body) payload[k] = req.body[k];

        if (!payload.name || !payload.provider || !payload.applyUrl) {
            return res.status(400).json({ error: 'Name, provider and apply URL are required' });
        }

        payload.addedBy = req.user._id;
        const s = await Scholarship.create(payload);
        res.status(201).json({ scholarship: s.toPublicJSON() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Admin: update
router.patch('/:id', verifyJWT, requireRole('admin'), async (req, res) => {
    try {
        const allowed = [
            'name', 'provider', 'category', 'level', 'summary', 'description',
            'eligibility', 'amount', 'deadline', 'applyUrl', 'state', 'districts', 'tags', 'active',
        ];
        const updates = {};
        for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
        const s = await Scholarship.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!s) return res.status(404).json({ error: 'Not found' });
        res.json({ scholarship: s.toPublicJSON() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Admin: delete
router.delete('/:id', verifyJWT, requireRole('admin'), async (req, res) => {
    try {
        const s = await Scholarship.findByIdAndDelete(req.params.id);
        if (!s) return res.status(404).json({ error: 'Not found' });
        res.json({ ok: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
