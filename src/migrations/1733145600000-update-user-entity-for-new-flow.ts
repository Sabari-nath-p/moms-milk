import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntityForNewFlow1733145600000 implements MigrationInterface {
    name = 'UpdateUserEntityForNewFlow1733145600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add status column with enum
        await queryRunner.query(`
            CREATE TYPE "public"."user_status_enum" AS ENUM(
                'email_verification_pending', 
                'profile_incomplete', 
                'role_selection_pending', 
                'completed'
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD "status" "public"."user_status_enum" NOT NULL DEFAULT 'email_verification_pending'
        `);

        // Make existing required fields nullable for the new flow
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "fullName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phoneNumber" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "zipCode" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL`);

        // Add description column
        await queryRunner.query(`ALTER TABLE "users" ADD "description" text`);

        // Update existing users to have completed status if they have all required fields
        await queryRunner.query(`
            UPDATE "users" 
            SET "status" = 'completed' 
            WHERE "fullName" IS NOT NULL 
            AND "phoneNumber" IS NOT NULL 
            AND "zipCode" IS NOT NULL 
            AND "role" IS NOT NULL
            AND "isEmailVerified" = true
        `);

        // Set profile_incomplete for users with verified email but missing profile data
        await queryRunner.query(`
            UPDATE "users" 
            SET "status" = 'profile_incomplete' 
            WHERE "isEmailVerified" = true 
            AND ("fullName" IS NULL OR "phoneNumber" IS NULL OR "zipCode" IS NULL)
        `);

        // Set role_selection_pending for users with profile but no role
        await queryRunner.query(`
            UPDATE "users" 
            SET "status" = 'role_selection_pending' 
            WHERE "isEmailVerified" = true 
            AND "fullName" IS NOT NULL 
            AND "phoneNumber" IS NOT NULL 
            AND "zipCode" IS NOT NULL 
            AND "role" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove description column
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "description"`);

        // Make fields required again (this might fail if there are null values)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "zipCode" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "fullName" SET NOT NULL`);

        // Remove status column
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
    }
}
