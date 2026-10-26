import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get summary KPI metrics' })
  async getKPIs(@CurrentUser() user: any, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getKPIs(user.tenantId, query);
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Get daily time-series metrics' })
  async getTimeseries(@CurrentUser() user: any, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getTimeseries(user.tenantId, query);
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Get conversion funnel metrics' })
  async getFunnel(@CurrentUser() user: any, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getFunnel(user.tenantId, query);
  }

  @Get('agents')
  @ApiOperation({ summary: 'Get agent performance breakdown' })
  async getAgentPerformance(@CurrentUser() user: any, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getAgentPerformance(user.tenantId, query);
  }

  @Get('payments/recent')
  @ApiOperation({ summary: 'Get recent payments (paginated)' })
  async getRecentPayments(@CurrentUser() user: any, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getRecentPayments(user.tenantId, query);
  }

  @Get('links/pending')
  @ApiOperation({ summary: 'Get pending payment links (paginated)' })
  async getPendingLinks(@CurrentUser() user: any, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getPendingLinks(user.tenantId, query);
  }

  @Get('reports/summary')
  @ApiOperation({ summary: 'Get executive reporting summary and analytics' })
  async getReportsSummary(@CurrentUser() user: any, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getReportsSummary(user.tenantId, query);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export payments or payment links as CSV' })
  @ApiQuery({ name: 'type', enum: ['payments', 'links'], required: true })
  async exportCsv(
    @CurrentUser() user: any,
    @Query('type') type: 'payments' | 'links',
    @Query() query: DashboardQueryDto,
    @Res() res: Response,
  ) {
    if (!type || !['payments', 'links'].includes(type)) {
      throw new BadRequestException('Type must be either "payments" or "links"');
    }

    const csvData = await this.dashboardService.exportCsv(user.tenantId, type, query);
    const filename = `${type}_export_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvData);
  }
}
