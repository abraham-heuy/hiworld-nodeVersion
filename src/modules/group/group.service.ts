import { In, Repository } from 'typeorm';
import { CreateGroupCommentDto, UpdateGroupCommentDto  } from '../../dtos/group-comment.dto';
import { CreateGroupDto, ReportGroupDto, UpdateGroupDto } from '../../dtos/group.dto';
import { GroupComment } from '../../entities/group-comment.entity';
import { Group } from '../../entities/group.entity';
import { User } from '../../entities/user.entity';
import { NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException } from '../../exceptions/HttpExceptions';

export class GroupService {
  constructor(
    private groupRepo: Repository<Group>,
    private groupCommentRepo: Repository<GroupComment>,
    private userRepo: Repository<User>
  ) {}

  async createGroup(authorId: string, dto: CreateGroupDto): Promise<Group> {
    const author = await this.userRepo.findOne({ where: { id: authorId } });
    if (!author) throw new NotFoundException('Author not found');
    const members = dto.initialMembers ? JSON.stringify([authorId, ...dto.initialMembers]) : JSON.stringify([authorId]);
    const group = this.groupRepo.create({
      name: dto.name,
      description: dto.description,
      author: authorId,
      members,
      date: new Date(),
      is_active: true,
    });
    return this.groupRepo.save(group);
  }

  async getGroups(limit = 20, offset = 0): Promise<Group[]> {
    return this.groupRepo.find({
      where: { is_active: true },
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getGroupById(groupId: string): Promise<Group> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (!group.is_active) throw new ForbiddenException('Group is banned or inactive');
    return group;
  }

  async updateGroup(groupId: string, userId: string, dto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.author !== userId) throw new ForbiddenException('Only the group creator can edit');
    if (dto.name !== undefined) group.name = dto.name;
    if (dto.description !== undefined) group.description = dto.description;
    if (dto.layout !== undefined) group.layout = dto.layout;
    if (dto.settings !== undefined) group.settings = dto.settings;
    return this.groupRepo.save(group);
  }

  async deleteGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.author !== userId) throw new ForbiddenException('Only the group creator can delete');
    await this.groupRepo.remove(group);
  }

  async joinGroup(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    let members = JSON.parse(group.members || '[]');
    if (members.includes(userId)) throw new BadRequestException('Already a member');
    members.push(userId);
    group.members = JSON.stringify(members);
    return this.groupRepo.save(group);
  }

  async leaveGroup(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    let members = JSON.parse(group.members || '[]');
    if (!members.includes(userId)) throw new BadRequestException('Not a member');
    members = members.filter((id: string) => id !== userId);
    group.members = JSON.stringify(members);
    return this.groupRepo.save(group);
  }

  async removeMember(groupId: string, requesterId: string, targetUserId: string): Promise<Group> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.author !== requesterId) throw new ForbiddenException('Only the group creator can remove members');
    let members = JSON.parse(group.members || '[]');
    if (!members.includes(targetUserId)) throw new BadRequestException('User is not a member');
    members = members.filter((id: string) => id !== targetUserId);
    group.members = JSON.stringify(members);
    return this.groupRepo.save(group);
  }

  async getGroupMembers(groupId: string): Promise<User[]> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    const memberIds = JSON.parse(group.members || '[]');
    if (memberIds.length === 0) return [];
    return this.userRepo.find({
      where: { id: In(memberIds) },
      select: ['id', 'username', 'pfp', 'status']
    });
  }

  async reportGroup(groupId: string, _userId: string, _dto: ReportGroupDto): Promise<{ message: string }> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    group.reports_count += 1;
    await this.groupRepo.save(group);
    return { message: 'Group reported. Admin will review.' };
  }

  async banGroup(groupId: string, adminId: string): Promise<void> {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (!admin || admin.rank < 10) throw new UnauthorizedException('Admin privileges required');
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    group.is_active = false;
    await this.groupRepo.save(group);
  }

  async addGroupComment(groupId: string, authorId: string, dto: CreateGroupCommentDto): Promise<GroupComment> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    const comment = this.groupCommentRepo.create({
      groupId,
      author: authorId,
      text: dto.text,
      date: new Date(),
    });
    return this.groupCommentRepo.save(comment);
  }

  async getGroupComments(groupId: string, limit = 20, offset = 0): Promise<GroupComment[]> {
    return this.groupCommentRepo.find({
      where: { groupId },
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async updateGroupComment(commentId: string, userId: string, dto: UpdateGroupCommentDto): Promise<GroupComment> {
    const comment = await this.groupCommentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author !== userId) throw new ForbiddenException('You can only edit your own comments');
    comment.text = dto.text;
    return this.groupCommentRepo.save(comment);
  }

  async deleteGroupComment(commentId: string, userId: string, isAdmin = false): Promise<void> {
    const comment = await this.groupCommentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author !== userId && !isAdmin) throw new ForbiddenException('Cannot delete this comment');
    await this.groupCommentRepo.remove(comment);
  }
}