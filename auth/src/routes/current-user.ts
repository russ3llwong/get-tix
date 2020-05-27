import express from 'express';
import { currentUser } from '../middlewares/check-current-user';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
    // custom currentUser middleware
    res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };