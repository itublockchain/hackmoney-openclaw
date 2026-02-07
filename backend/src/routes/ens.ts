
import { Router } from 'express';
import { ENSController } from '../controllers/ENSController';

const router = Router();

// CCIP-Read Standard Endpoint
// GET /{sender}/{data}.json
router.get('/:sender/:data.json', ENSController.handleCCIPRead);

export default router;
