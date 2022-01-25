import { Router } from 'express';
import { executor, git_updater, inventory_provider, port_check_provider, rule_provider } from '..';
import { logger } from '../utils';

export const router = Router();

router.get('/stats/rules', (req, res) => {
  res.send(rule_provider.stats());
});

router.get('/stats/inventory', (req, res) => {
  res.send(inventory_provider.stats());
});

router.get('/stats/checks', (req, res) => {
  res.send(port_check_provider.stats());
});

router.post('/update', async (req, res) => {
  const to_update = req.body.component;
  logger.info(`Received update call via api for: ${to_update}`);
  switch (to_update) {
    case 'inventory':
      inventory_provider.update();
      res.send('Updated inventory');
      break;
    case 'rules':
      rule_provider.update();
      res.send('Updated rules');
      break;
    case 'checks':
      port_check_provider.update();
      res.send('Updated port checks');
      break;
    case 'source':
      const result = await git_updater.checkForChanges();
      if (result) res.send('Updated sources');
      else res.send('No changes on source remote');
      break;
    case 'all':
      inventory_provider.update();
      rule_provider.update();
      port_check_provider.update();
      break;
    default:
      break;
  }
});

router.post('/run', (req, res) => {
  executor.run();
  res.send('Executing checks');
});
