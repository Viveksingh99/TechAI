import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeaveStatus, RoleName } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
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
import { HrService } from './hr.service';

const HR_ROLES = [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.HR];

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // --- Employees -----------------------------------------------------------

  @Get('employees')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES)
  findAllEmployees(@Query() pagination: PaginationDto) {
    return this.hrService.findAllEmployees(pagination);
  }

  @Get('employees/:id')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES)
  findEmployee(@Param('id') id: string) {
    return this.hrService.findEmployee(id);
  }

  @Patch('employees/:id')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES)
  updateEmployee(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.hrService.updateEmployee(id, dto);
  }

  // --- Attendance ------------------------------------------------------------

  @Post('attendance/:employeeId/check-in')
  checkIn(@Param('employeeId') employeeId: string, @Body() dto: CheckInDto) {
    return this.hrService.checkIn(employeeId, dto);
  }

  @Post('attendance/:employeeId/check-out')
  checkOut(@Param('employeeId') employeeId: string) {
    return this.hrService.checkOut(employeeId);
  }

  @Get('attendance')
  listAttendance(
    @Query() pagination: PaginationDto,
    @Query('employeeId') employeeId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.hrService.listAttendance(pagination, { employeeId, from, to });
  }

  // --- Leave types -------------------------------------------------------------

  @Post('leave-types')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES)
  createLeaveType(@Body() dto: CreateLeaveTypeDto) {
    return this.hrService.createLeaveType(dto);
  }

  @Get('leave-types')
  listLeaveTypes() {
    return this.hrService.listLeaveTypes();
  }

  // --- Leave requests ------------------------------------------------------------

  @Post('leaves/:employeeId')
  requestLeave(@Param('employeeId') employeeId: string, @Body() dto: CreateLeaveDto) {
    return this.hrService.requestLeave(employeeId, dto);
  }

  @Get('leaves')
  listLeaves(
    @Query() pagination: PaginationDto,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: LeaveStatus,
  ) {
    return this.hrService.listLeaves(pagination, { employeeId, status });
  }

  @Patch('leaves/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES)
  approveLeave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.hrService.approveLeave(id, userId);
  }

  @Patch('leaves/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES)
  rejectLeave(
    @Param('id') id: string,
    @Body() dto: RejectLeaveDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.hrService.rejectLeave(id, userId, dto);
  }

  // --- Holidays ------------------------------------------------------------------

  @Post('holidays')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES)
  createHoliday(@Body() dto: CreateHolidayDto) {
    return this.hrService.createHoliday(dto);
  }

  @Get('holidays')
  listHolidays(@Query('year') year?: string) {
    return this.hrService.listHolidays(year ? Number(year) : undefined);
  }

  @Patch('holidays/:id')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES)
  updateHoliday(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.hrService.updateHoliday(id, dto);
  }

  // --- Salary slips ------------------------------------------------------------

  @Post('salary-slips')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES)
  createSalarySlip(@Body() dto: CreateSalarySlipDto) {
    return this.hrService.createSalarySlip(dto);
  }

  @Get('salary-slips')
  listSalarySlips(
    @Query() pagination: PaginationDto,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.hrService.listSalarySlips(pagination, { employeeId });
  }

  @Patch('salary-slips/:id/mark-paid')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES)
  markSalarySlipPaid(@Param('id') id: string) {
    return this.hrService.markSalarySlipPaid(id);
  }

  // --- Performance reviews ------------------------------------------------------

  @Post('performance-reviews')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES, RoleName.PROJECT_MANAGER)
  createPerformanceReview(@Body() dto: CreatePerformanceReviewDto) {
    return this.hrService.createPerformanceReview(dto);
  }

  @Get('performance-reviews')
  listPerformanceReviews(@Query('employeeId') employeeId?: string) {
    return this.hrService.listPerformanceReviews({ employeeId });
  }

  @Patch('performance-reviews/:id')
  @UseGuards(RolesGuard)
  @Roles(...HR_ROLES, RoleName.PROJECT_MANAGER)
  updatePerformanceReview(
    @Param('id') id: string,
    @Body() dto: UpdatePerformanceReviewDto,
  ) {
    return this.hrService.updatePerformanceReview(id, dto);
  }
}
