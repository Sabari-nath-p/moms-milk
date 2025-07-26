import { MigrationInterface, QueryRunner } from "typeorm";

export class AddZipCodesTable1753550680838 implements MigrationInterface {
    name = 'AddZipCodesTable1753550680838'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable PostGIS extension if not enabled
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

        // Create zip_codes table
        await queryRunner.query(`
            CREATE TABLE "zip_codes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "countryCode" character varying NOT NULL,
                "postalCode" character varying NOT NULL,
                "placeName" character varying NOT NULL,
                "latitude" decimal(10,6) NOT NULL,
                "longitude" decimal(10,6) NOT NULL,
                "location" geography(Point,4326),
                CONSTRAINT "zip_codes_pkey" PRIMARY KEY ("id")
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "idx_zip_codes_country_code" ON "zip_codes" ("countryCode")`);
        await queryRunner.query(`CREATE INDEX "idx_zip_codes_postal_code" ON "zip_codes" ("postalCode")`);
        await queryRunner.query(`CREATE INDEX "idx_zip_codes_location" ON "zip_codes" USING GIST ("location")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_zip_codes_location"`);
        await queryRunner.query(`DROP INDEX "idx_zip_codes_postal_code"`);
        await queryRunner.query(`DROP INDEX "idx_zip_codes_country_code"`);
        await queryRunner.query(`DROP TABLE "zip_codes"`);
    }
}
