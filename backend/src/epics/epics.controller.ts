import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EpicsService } from './epics.service';
import { CreateEpicDto } from './dto/create-epic.dto';
import { UpdateEpicDto } from './dto/update-epic.dto';

@Controller('epics')
export class EpicsController {
  constructor(private readonly epicsService: EpicsService) {}

  @Get()
  findAll(@Query('teamId') teamId?: string) {
    return this.epicsService.findAll(teamId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.epicsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEpicDto) {
    return this.epicsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEpicDto) {
    return this.epicsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.epicsService.remove(id);
  }
}
