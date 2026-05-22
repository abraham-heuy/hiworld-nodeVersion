import { Router } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Report } from '../../entities/report.entity';
import { User } from '../../entities/user.entity';
import { protect, requireRank } from '../../middleware/auth.middleware';
import { ReportController } from './report.handler';
import { ReportService } from './report.service';

const router = Router();
const reportRepo = AppDataSource.getRepository(Report);
const userRepo = AppDataSource.getRepository(User);
const reportService = new ReportService(reportRepo, userRepo);
const reportController = new ReportController(reportService);

// Anyone logged in can create a report
router.post('/', protect, reportController.createReport);

// Admin only endpoints
router.get('/', protect, requireRank(10), reportController.getReports);
router.put('/:reportId/resolve', protect, requireRank(10), reportController.resolveReport);
router.delete('/:reportId', protect, requireRank(10), reportController.deleteReport);

export default router;