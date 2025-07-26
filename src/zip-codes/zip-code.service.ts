import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZipCode } from './entities/zip-code.entity';
import { CreateZipCodeDto, UpdateZipCodeDto, ZipCodeQueryDto, SearchNearbyDto } from './dto/zip-code.dto';
import { read as readXLSX, utils as XLSXUtils } from 'xlsx';
import { join } from 'path';

@Injectable()
export class ZipCodeService {
  constructor(
    @InjectRepository(ZipCode)
    private readonly zipCodeRepository: Repository<ZipCode>,
  ) {}

  async importFromExcel() {
    // Check if we already have zip codes in the database
    const existingCount = await this.zipCodeRepository.count();
    if (existingCount > 0) {
      console.log(`Skipping zip code import - ${existingCount} records already exist`);
      return { message: `Skipping import - ${existingCount} zip codes already exist` };
    }

    const filePath = join(__dirname, '..', 'config', 'assets', 'geonames-postal-code@public.xlsx');
    const workbook = readXLSX(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSXUtils.sheet_to_json(worksheet);

    const zipCodes = data.map(row => {
      const zipCode = new ZipCode();
      zipCode.countryCode = row['A']; // Country Code
      zipCode.postalCode = row['B']; // Postal Code
      zipCode.placeName = row['C']; // Place Name
      zipCode.latitude = parseFloat(row['J']); // Latitude
      zipCode.longitude = parseFloat(row['K']); // Longitude
      zipCode.location = {
        type: 'Point',
        coordinates: [parseFloat(row['K']), parseFloat(row['J'])]
      };
      return zipCode;
    });

    await this.zipCodeRepository.save(zipCodes);
    return { message: `Imported ${zipCodes.length} zip codes successfully` };
  }

  async create(createZipCodeDto: CreateZipCodeDto) {
    const zipCode = this.zipCodeRepository.create({
      ...createZipCodeDto,
      location: {
        type: 'Point',
        coordinates: [createZipCodeDto.longitude, createZipCodeDto.latitude]
      }
    });
    return await this.zipCodeRepository.save(zipCode);
  }

  async findAll(query: ZipCodeQueryDto) {
    const { search, page = 1, limit = 10 } = query;
    const queryBuilder = this.zipCodeRepository.createQueryBuilder('zipCode');

    if (search) {
      queryBuilder.where(
        'zipCode.postalCode ILIKE :search OR zipCode.placeName ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string) {
    const zipCode = await this.zipCodeRepository.findOne({ where: { id } });
    if (!zipCode) {
      throw new NotFoundException(`Zip code with ID ${id} not found`);
    }
    return zipCode;
  }

  async update(id: string, updateZipCodeDto: UpdateZipCodeDto) {
    const zipCode = await this.findOne(id);
    Object.assign(zipCode, {
      ...updateZipCodeDto,
      location: {
        type: 'Point',
        coordinates: [updateZipCodeDto.longitude, updateZipCodeDto.latitude]
      }
    });
    return await this.zipCodeRepository.save(zipCode);
  }

  async remove(id: string) {
    const zipCode = await this.findOne(id);
    await this.zipCodeRepository.remove(zipCode);
    return { message: 'Zip code deleted successfully' };
  }

  async findNearbyDonors(searchDto: SearchNearbyDto) {
    const { 
      zipCode: searchZipCode, 
      radius = 50, 
      page = 1, 
      limit = 10,
      babyDeliveryDateStart,
      babyDeliveryDateEnd,
      willingToShareTestResults
    } = searchDto;

    // First find the coordinates of the search zip code
    const originZipCode = await this.zipCodeRepository.findOne({
      where: { postalCode: searchZipCode }
    });

    if (!originZipCode) {
      throw new NotFoundException(`Zip code ${searchZipCode} not found`);
    }

    // Build the WHERE clause for additional filters
    const additionalFilters = [];
    const params: any[] = [originZipCode.longitude, originZipCode.latitude, radius];
    let paramCounter = 4;

    if (babyDeliveryDateStart && babyDeliveryDateEnd) {
      additionalFilters.push(`d.baby_delivery_date BETWEEN ($${paramCounter}::timestamp) AND ($${paramCounter + 1}::timestamp)`);
      params.push(babyDeliveryDateStart, babyDeliveryDateEnd);
      paramCounter += 2;
    } else if (babyDeliveryDateStart) {
      additionalFilters.push(`d.baby_delivery_date >= ($${paramCounter}::timestamp)`);
      params.push(babyDeliveryDateStart);
      paramCounter += 1;
    } else if (babyDeliveryDateEnd) {
      additionalFilters.push(`d.baby_delivery_date <= ($${paramCounter}::timestamp)`);
      params.push(babyDeliveryDateEnd);
      paramCounter += 1;
    }

    if (willingToShareTestResults !== undefined) {
      additionalFilters.push(`d.willing_to_share_test_results = ($${paramCounter}::boolean)`);
      params.push(willingToShareTestResults.toString());
      paramCounter += 1;
    }

    // Add pagination parameters
    params.push(limit, (page - 1) * limit);

    // Query to find donors within radius, ordered by distance
    const query = `
      WITH donors_with_distance AS (
        SELECT 
          d.*,
          u.full_name,
          u.email,
          z.postal_code,
          z.place_name,
          d.health_conditions,
          d.willing_to_share_test_results,
          d.blood_group,
          d.baby_delivery_date,
          ST_Distance(
            z.location::geography,
            ST_MakePoint($1, $2)::geography
          ) / 1000 as distance_km
        FROM donors d
        INNER JOIN users u ON d.user_id = u.id
        INNER JOIN zip_codes z ON u.zip_code = z.postal_code
        WHERE 
          d.is_available = true AND
          ST_DWithin(
            z.location::geography,
            ST_MakePoint($1, $2)::geography,
            $3 * 1000
          )
          ${additionalFilters.length ? 'AND ' + additionalFilters.join(' AND ') : ''}
      )
      SELECT *
      FROM donors_with_distance
      ORDER BY distance_km ASC
      LIMIT $${paramCounter}
      OFFSET $${paramCounter + 1};
    `;

    const donorsWithDistance = await this.zipCodeRepository.query(query, params);

    // Count total donors within radius for pagination
    const countQuery = `
      SELECT COUNT(*)
      FROM donors d
      INNER JOIN users u ON d.user_id = u.id
      INNER JOIN zip_codes z ON u.zip_code = z.postal_code
      WHERE 
        d.is_available = true AND
        ST_DWithin(
          z.location::geography,
          ST_MakePoint($1, $2)::geography,
          $3 * 1000
        )
        ${additionalFilters.length ? 'AND ' + additionalFilters.join(' AND ') : ''};
    `;

    const [{ count }] = await this.zipCodeRepository.query(
      countQuery,
      params.slice(0, -2) // Remove limit and offset from params
    );

    return {
      items: donorsWithDistance.map(donor => ({
        ...donor,
        distance_km: parseFloat(donor.distance_km).toFixed(2),
        // Parse the health_conditions from simple-array format
        health_conditions: donor.health_conditions ? donor.health_conditions.split(',') : [],
        // Format dates
        baby_delivery_date: donor.baby_delivery_date ? new Date(donor.baby_delivery_date).toISOString() : null
      })),
      total: parseInt(count),
      page,
      pages: Math.ceil(count / limit)
    };
  }
}
