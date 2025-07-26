import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import type { Point } from 'geojson';

@Entity('zip_codes')
export class ZipCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  countryCode: string;

  @Column()
  @Index()
  postalCode: string;

  @Column()
  placeName: string;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  // Adding a spatial index for faster distance calculations
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  location: Point;
}
