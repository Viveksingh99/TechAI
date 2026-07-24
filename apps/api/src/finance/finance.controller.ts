import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvoiceStatus, RoleName } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { FinanceService } from './finance.service';

const FINANCE_ROLES = [RoleName.SUPER_ADMIN, RoleName.ADMIN];

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...FINANCE_ROLES)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // --- Invoices --------------------------------------------------------------

  @Post('invoices')
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(dto);
  }

  @Get('invoices')
  findAllInvoices(
    @Query() pagination: PaginationDto,
    @Query('clientId') clientId?: string,
    @Query('status') status?: InvoiceStatus,
  ) {
    return this.financeService.findAllInvoices(pagination, { clientId, status });
  }

  @Get('invoices/:id')
  findInvoice(@Param('id') id: string) {
    return this.financeService.findInvoice(id);
  }

  @Patch('invoices/:id')
  updateInvoice(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.financeService.updateInvoice(id, dto);
  }

  @Patch('invoices/:id/mark-paid')
  markInvoicePaid(@Param('id') id: string) {
    return this.financeService.markInvoicePaid(id);
  }

  @Delete('invoices/:id')
  removeInvoice(@Param('id') id: string) {
    return this.financeService.removeInvoice(id);
  }

  // --- Quotations ------------------------------------------------------------

  @Post('quotations')
  createQuotation(@Body() dto: CreateQuotationDto) {
    return this.financeService.createQuotation(dto);
  }

  @Get('quotations')
  findAllQuotations(@Query() pagination: PaginationDto) {
    return this.financeService.findAllQuotations(pagination);
  }

  @Patch('quotations/:id')
  updateQuotation(@Param('id') id: string, @Body() dto: UpdateQuotationDto) {
    return this.financeService.updateQuotation(id, dto);
  }

  @Delete('quotations/:id')
  removeQuotation(@Param('id') id: string) {
    return this.financeService.removeQuotation(id);
  }

  // --- Expenses --------------------------------------------------------------

  @Post('expenses')
  createExpense(@Body() dto: CreateExpenseDto, @CurrentUser('id') userId: string) {
    return this.financeService.createExpense(dto, userId);
  }

  @Get('expenses')
  findAllExpenses(
    @Query() pagination: PaginationDto,
    @Query('projectId') projectId?: string,
    @Query('isApproved') isApproved?: string,
  ) {
    return this.financeService.findAllExpenses(pagination, {
      projectId,
      isApproved: isApproved === undefined ? undefined : isApproved === 'true',
    });
  }

  @Patch('expenses/:id')
  updateExpense(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.financeService.updateExpense(id, dto);
  }

  @Patch('expenses/:id/approve')
  approveExpense(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.financeService.approveExpense(id, userId);
  }

  @Delete('expenses/:id')
  removeExpense(@Param('id') id: string) {
    return this.financeService.removeExpense(id);
  }

  // --- Subscriptions -----------------------------------------------------------

  @Post('subscriptions')
  createSubscription(@Body() dto: CreateSubscriptionDto) {
    return this.financeService.createSubscription(dto);
  }

  @Get('subscriptions')
  findAllSubscriptions(@Query() pagination: PaginationDto) {
    return this.financeService.findAllSubscriptions(pagination);
  }

  @Patch('subscriptions/:id/cancel')
  cancelSubscription(@Param('id') id: string) {
    return this.financeService.cancelSubscription(id);
  }

  // --- Payments ----------------------------------------------------------------

  @Post('payments')
  recordPayment(@Body() dto: CreatePaymentDto) {
    return this.financeService.recordPayment(dto);
  }

  @Get('payments/invoice/:invoiceId')
  listPaymentsForInvoice(@Param('invoiceId') invoiceId: string) {
    return this.financeService.listPaymentsForInvoice(invoiceId);
  }

  // --- Contracts ------------------------------------------------------------------

  @Post('contracts')
  createContract(@Body() dto: CreateContractDto) {
    return this.financeService.createContract(dto);
  }

  @Get('contracts')
  findAllContracts(@Query() pagination: PaginationDto) {
    return this.financeService.findAllContracts(pagination);
  }

  @Patch('contracts/:id')
  updateContract(@Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.financeService.updateContract(id, dto);
  }

  // --- Dashboards ------------------------------------------------------------------

  @Get('dashboard/revenue')
  revenueDashboard() {
    return this.financeService.revenueDashboard();
  }

  @Get('dashboard/profit-loss')
  profitLossSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.financeService.profitLossSummary(from, to);
  }
}
