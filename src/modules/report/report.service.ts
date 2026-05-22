import { Repository } from 'typeorm';
import { CreateReportDto } from '../../dtos/report.dto';
import { Report } from '../../entities/report.entity';
import { User } from '../../entities/user.entity';
import { NotFoundException, ForbiddenException } from '../../exceptions/HttpExceptions';

export class ReportService {
  constructor(
    private reportRepo: Repository<Report>,
    private userRepo: Repository<User>
  ) {}

  async createReport(reporterId: string, dto: CreateReportDto): Promise<Report> {
    // Check that target user exists
    const targetUser = await this.userRepo.findOne({ where: { id: dto.targetUserId } });
    if (!targetUser) throw new NotFoundException('Target user not found');
    if (reporterId === dto.targetUserId) throw new ForbiddenException('Cannot report yourself');

    const report = this.reportRepo.create({
      userId: reporterId,
      creatorId: dto.targetUserId,
      contentType: dto.contentType,
      contentId: dto.contentId,
      reason: dto.reason,
      resolved: false,
    });
    return this.reportRepo.save(report);
  }

  async getReports(resolved?: boolean, limit = 50, offset = 0): Promise<Report[]> {
    const where: any = {};
    if (resolved !== undefined) where.resolved = resolved;
    return this.reportRepo.find({
      where,
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async resolveReport(reportId: string, _adminId: string, isAdmin: boolean): Promise<void> {
    if (!isAdmin) throw new ForbiddenException('Only admins can resolve reports');
    const report = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    report.resolved = true;
    await this.reportRepo.save(report);
  }

  async deleteReport(reportId: string, _adminId: string, isAdmin: boolean): Promise<void> {
    if (!isAdmin) throw new ForbiddenException('Only admins can delete reports');
    await this.reportRepo.delete(reportId);
  }
}