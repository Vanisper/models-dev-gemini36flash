import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ModelQueryParams } from './catalog.types';

@Controller('api')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('summary')
  async getSummary() {
    return this.catalogService.getCatalogSummary();
  }

  @Get('models')
  async getModels(@Query() query: ModelQueryParams) {
    return this.catalogService.getModels(query);
  }

  // Use wildcard param to support model IDs containing slashes like "openai/gpt-4o"
  @Get('models/*')
  async getModelById(@Req() req: any) {
    const rawPath = req.params[0] || '';
    const model = await this.catalogService.getModelById(rawPath);
    if (!model) {
      throw new NotFoundException(`Model '${rawPath}' not found`);
    }
    return model;
  }

  @Get('labs')
  async getLabs() {
    return this.catalogService.getLabs();
  }

  @Get('labs/:id')
  async getLabById(@Param('id') id: string) {
    const lab = await this.catalogService.getLabById(id);
    if (!lab) {
      throw new NotFoundException(`Lab '${id}' not found`);
    }
    return lab;
  }

  @Get('benchmarks')
  async getBenchmarks() {
    return this.catalogService.getBenchmarks();
  }

  @Post('refresh')
  async refreshData() {
    return this.catalogService.refreshData();
  }
}
