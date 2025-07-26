import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ZipCodeService } from './zip-code.service';
import { CreateZipCodeDto, UpdateZipCodeDto, ZipCodeQueryDto, SearchNearbyDto } from './dto/zip-code.dto';
import { SearchNearbyResponseDto } from './dto/search-nearby-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('zip-codes')
@Controller('zip-codes')
export class ZipCodeController {
  constructor(private readonly zipCodeService: ZipCodeService) {}

  @Post('import')
  @ApiOperation({ 
    summary: 'Import zip codes from Excel file',
    description: 'Imports zip codes from a pre-configured Excel file in the assets directory. This operation should be run during initial setup.'
  })
  @ApiResponse({ status: 200, description: 'Zip codes imported successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error during import' })
  async importFromExcel() {
    return await this.zipCodeService.importFromExcel();
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create a new zip code',
    description: 'Creates a new zip code entry with geographic coordinates and location data.'
  })
  @ApiResponse({ status: 201, description: 'Zip code created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createZipCodeDto: CreateZipCodeDto) {
    return await this.zipCodeService.create(createZipCodeDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all zip codes with pagination',
    description: 'Retrieves a paginated list of zip codes. Can be filtered by search term.'
  })
  @ApiResponse({ status: 200, description: 'List of zip codes retrieved successfully' })
  async findAll(@Query() query: ZipCodeQueryDto) {
    return await this.zipCodeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a zip code by id',
    description: 'Retrieves detailed information about a specific zip code.'
  })
  @ApiResponse({ status: 200, description: 'Zip code found' })
  @ApiResponse({ status: 404, description: 'Zip code not found' })
  async findOne(@Param('id') id: string) {
    return await this.zipCodeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a zip code',
    description: 'Updates the information for an existing zip code.'
  })
  @ApiResponse({ status: 200, description: 'Zip code updated successfully' })
  @ApiResponse({ status: 404, description: 'Zip code not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(@Param('id') id: string, @Body() updateZipCodeDto: UpdateZipCodeDto) {
    return await this.zipCodeService.update(id, updateZipCodeDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a zip code',
    description: 'Removes a zip code from the database.'
  })
  @ApiResponse({ status: 200, description: 'Zip code deleted successfully' })
  @ApiResponse({ status: 404, description: 'Zip code not found' })
  async remove(@Param('id') id: string) {
    return await this.zipCodeService.remove(id);
  }

  @Get('search/nearby-donors')
  @ApiOperation({
    summary: 'Find nearby donors based on zip code',
    description: 'Search for available donors within a specified radius of a zip code. Includes donor details and health information.'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved nearby donors',
    type: SearchNearbyResponseDto
  })
  @ApiResponse({ status: 404, description: 'Zip code not found' })
  @ApiResponse({ status: 400, description: 'Invalid search parameters' })
  async findNearbyDonors(@Query() searchDto: SearchNearbyDto) {
    return await this.zipCodeService.findNearbyDonors(searchDto);
  }
}
