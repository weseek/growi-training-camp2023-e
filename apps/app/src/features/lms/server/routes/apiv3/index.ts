import express, { Router } from 'express';

import Crowi from '~/server/crowi';


module.exports = (crowi: Crowi): Router => {
  const router = express.Router();

  router.use('/cource', require('./lms-cource')(crowi));

  return router;
};
