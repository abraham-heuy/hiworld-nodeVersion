import { Request, Response, NextFunction } from 'express';
import { CreateReportDto } from '../../dtos/report.dto';
import { ReportService } from './report.service';

export class ReportController {
  constructor(private reportService: ReportService) {}

  createReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateReportDto = req.body;
      const report = await this.reportService.createReport(req.authenticatedUser!.id, dto);
      res.status(201).json(report);
    } catch (error) { next(error); }
  };

  getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resolved = req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const reports = await this.reportService.getReports(resolved, limit, offset);
      res.json(reports);
    } catch (error) { next(error); }
  };

  resolveReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportId } = req.params;
      const isAdmin = (req.authenticatedUser?.rank ?? 0) >= 10;
      await this.reportService.resolveReport(reportId, req.authenticatedUser!.id, isAdmin);
      res.json({ message: 'Report resolved' });
    } catch (error) { next(error); }
  };

  deleteReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportId } = req.params;
      const isAdmin = (req.authenticatedUser?.rank ?? 0) >= 10;
      await this.reportService.deleteReport(reportId, req.authenticatedUser!.id, isAdmin);
      res.json({ message: 'Report deleted' });
    } catch (error) { next(error); }
  };
}