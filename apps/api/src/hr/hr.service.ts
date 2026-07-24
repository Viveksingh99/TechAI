import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceStatus, LeaveStatus, Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import {
  buildSearchFilter,
  createPaginatedResult,
} from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInDto } from './dto/check-in.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { CreateSalarySlipDto } from './dto/create-salary-slip.dto';
import { RejectLeaveDto } from './dto/reject-leave.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
  phone: true,
} satisfies Prisma.UserSelect;

const EMPLOYEE_INCLUDE = {
  user: { select: USER_SELECT },
  manager: { include: { user: { select: USER_SELECT } } },
} satisfies Prisma.EmployeeInclude;

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Employees
  // ---------------------------------------------------------------------

  async findAllEmployees(pagination: PaginationDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
      ...buildSearchFilter(pagination.search, ['employeeCode', 'department', 'designation']),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        include: EMPLOYEE_INCLUDE,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async findEmployee(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...EMPLOYEE_INCLUDE,
        subordinates: { include: { user: { select: USER_SELECT } } },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto) {
    await this.ensureEmployeeExists(id);

    return this.prisma.employee.update({
      where: { id },
      data: {
        department: dto.department,
        designation: dto.designation,
        employmentType: dto.employmentType,
        status: dto.status,
        dateOfJoining: dto.dateOfJoining ? new Date(dto.dateOfJoining) : undefined,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        address: dto.address,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        managerId: dto.managerId,
        ctc: dto.ctc,
        bankAccountNumber: dto.bankAccountNumber,
        bankIfsc: dto.bankIfsc,
        panNumber: dto.panNumber,
        resignationDate: dto.resignationDate ? new Date(dto.resignationDate) : undefined,
        terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
      },
      include: EMPLOYEE_INCLUDE,
    });
  }

  async removeEmployee(id: string): Promise<{ message: string }> {
    await this.ensureEmployeeExists(id);
    await this.prisma.employee.update({ where: { id }, data: { deletedAt: new Date() } });

    return { message: 'Employee removed successfully' };
  }

  // ---------------------------------------------------------------------
  // Attendance
  // ---------------------------------------------------------------------

  async checkIn(employeeId: string, dto: CheckInDto) {
    const today = this.startOfToday();

    const existing = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (existing?.checkIn) {
      throw new BadRequestException('Already checked in for today');
    }

    return this.prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: today } },
      create: {
        employeeId,
        date: today,
        checkIn: new Date(),
        status: AttendanceStatus.PRESENT,
        notes: dto.notes,
      },
      update: { checkIn: new Date(), status: AttendanceStatus.PRESENT, notes: dto.notes },
    });
  }

  async checkOut(employeeId: string) {
    const today = this.startOfToday();

    const attendance = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (!attendance?.checkIn) {
      throw new BadRequestException('You must check in before checking out');
    }

    const checkOut = new Date();
    const workHours = (checkOut.getTime() - attendance.checkIn.getTime()) / 3_600_000;

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut, workHours },
    });
  }

  async listAttendance(
    pagination: PaginationDto,
    filter: { employeeId?: string; from?: string; to?: string },
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.AttendanceWhereInput = {
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      ...(filter.from || filter.to
        ? {
            date: {
              ...(filter.from ? { gte: new Date(filter.from) } : {}),
              ...(filter.to ? { lte: new Date(filter.to) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({
        where,
        include: { employee: { include: { user: { select: USER_SELECT } } } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { date: 'desc' },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  // ---------------------------------------------------------------------
  // Leave types
  // ---------------------------------------------------------------------

  createLeaveType(dto: CreateLeaveTypeDto) {
    return this.prisma.leaveType.create({ data: dto });
  }

  listLeaveTypes() {
    return this.prisma.leaveType.findMany({ orderBy: { name: 'asc' } });
  }

  // ---------------------------------------------------------------------
  // Leave requests
  // ---------------------------------------------------------------------

  async requestLeave(employeeId: string, dto: CreateLeaveDto) {
    const leaveType = await this.prisma.leaveType.findUnique({ where: { id: dto.leaveTypeId } });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('endDate must be on or after startDate');
    }

    const totalDays =
      Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;

    return this.prisma.leave.create({
      data: {
        employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate,
        endDate,
        totalDays,
        reason: dto.reason,
      },
      include: { leaveType: true },
    });
  }

  async listLeaves(
    pagination: PaginationDto,
    filter: { employeeId?: string; status?: LeaveStatus },
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.LeaveWhereInput = {
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.leave.findMany({
        where,
        include: {
          leaveType: true,
          employee: { include: { user: { select: USER_SELECT } } },
          approvedBy: { select: USER_SELECT },
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leave.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async approveLeave(id: string, approverId: string) {
    await this.ensureLeaveExists(id);

    return this.prisma.leave.update({
      where: { id },
      data: {
        status: LeaveStatus.APPROVED,
        approvedById: approverId,
        approvedAt: new Date(),
      },
    });
  }

  async rejectLeave(id: string, approverId: string, dto: RejectLeaveDto) {
    await this.ensureLeaveExists(id);

    return this.prisma.leave.update({
      where: { id },
      data: {
        status: LeaveStatus.REJECTED,
        approvedById: approverId,
        approvedAt: new Date(),
        rejectionReason: dto.rejectionReason,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Holidays
  // ---------------------------------------------------------------------

  createHoliday(dto: CreateHolidayDto) {
    return this.prisma.holiday.create({
      data: { ...dto, date: new Date(dto.date) },
    });
  }

  listHolidays(year?: number) {
    return this.prisma.holiday.findMany({
      where: year
        ? { date: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } }
        : undefined,
      orderBy: { date: 'asc' },
    });
  }

  async updateHoliday(id: string, dto: UpdateHolidayDto) {
    await this.ensureExists(this.prisma.holiday, id, 'Holiday');

    return this.prisma.holiday.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
    });
  }

  async removeHoliday(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.holiday, id, 'Holiday');
    await this.prisma.holiday.delete({ where: { id } });

    return { message: 'Holiday deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Salary slips
  // ---------------------------------------------------------------------

  createSalarySlip(dto: CreateSalarySlipDto) {
    const basicSalary = dto.basicSalary;
    const allowances = dto.allowances ?? 0;
    const deductions = dto.deductions ?? 0;
    const bonus = dto.bonus ?? 0;
    const tax = dto.tax ?? 0;
    const netSalary = basicSalary + allowances + bonus - deductions - tax;

    return this.prisma.salarySlip.create({
      data: { ...dto, allowances, deductions, bonus, tax, netSalary },
    });
  }

  async listSalarySlips(
    pagination: PaginationDto,
    filter: { employeeId?: string },
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.SalarySlipWhereInput = filter.employeeId
      ? { employeeId: filter.employeeId }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.salarySlip.findMany({
        where,
        include: { employee: { include: { user: { select: USER_SELECT } } } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.salarySlip.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async markSalarySlipPaid(id: string) {
    await this.ensureExists(this.prisma.salarySlip, id, 'Salary slip');

    return this.prisma.salarySlip.update({
      where: { id },
      data: { status: 'PAID', paidOn: new Date() },
    });
  }

  // ---------------------------------------------------------------------
  // Performance reviews
  // ---------------------------------------------------------------------

  createPerformanceReview(dto: CreatePerformanceReviewDto) {
    return this.prisma.performanceReview.create({
      data: {
        ...dto,
        reviewPeriodStart: new Date(dto.reviewPeriodStart),
        reviewPeriodEnd: new Date(dto.reviewPeriodEnd),
      },
    });
  }

  async listPerformanceReviews(filter: { employeeId?: string }) {
    return this.prisma.performanceReview.findMany({
      where: filter.employeeId ? { employeeId: filter.employeeId } : {},
      include: {
        employee: { include: { user: { select: USER_SELECT } } },
        reviewer: { include: { user: { select: USER_SELECT } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePerformanceReview(id: string, dto: UpdatePerformanceReviewDto) {
    await this.ensureExists(this.prisma.performanceReview, id, 'Performance review');

    return this.prisma.performanceReview.update({
      where: { id },
      data: {
        ...dto,
        reviewPeriodStart: dto.reviewPeriodStart ? new Date(dto.reviewPeriodStart) : undefined,
        reviewPeriodEnd: dto.reviewPeriodEnd ? new Date(dto.reviewPeriodEnd) : undefined,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  private startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private async ensureEmployeeExists(id: string): Promise<void> {
    const employee = await this.prisma.employee.findFirst({ where: { id, deletedAt: null } });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
  }

  private async ensureLeaveExists(id: string): Promise<void> {
    const leave = await this.prisma.leave.findUnique({ where: { id } });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }
  }

  private async ensureExists(
    delegate: { findUnique: (args: { where: { id: string } }) => Promise<unknown> },
    id: string,
    label: string,
  ): Promise<void> {
    const record = await delegate.findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException(`${label} not found`);
    }
  }
}
