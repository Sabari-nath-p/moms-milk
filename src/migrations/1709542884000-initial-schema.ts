import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1709542884000 implements MigrationInterface {
    name = 'InitialSchema1709542884000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM ('admin', 'donor', 'buyer')
        `);

        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fullName" character varying NOT NULL,
                "email" character varying NOT NULL UNIQUE,
                "fcmToken" character varying,
                "profilePicture" character varying,
                "isEmailVerified" boolean NOT NULL DEFAULT false,
                "deviceToken" character varying,
                "password" character varying NOT NULL,
                "phoneNumber" character varying NOT NULL,
                "role" "public"."user_role_enum" NOT NULL,
                "zipCode" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "users_pkey" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "donors" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "babyDeliveryDate" TIMESTAMP NOT NULL,
                "bloodGroup" character varying NOT NULL,
                "willingToShareTestResults" boolean NOT NULL,
                "healthConditions" text array NOT NULL,
                "isAvailable" boolean NOT NULL DEFAULT true,
                "userId" uuid,
                CONSTRAINT "donors_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "REL_donors_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "buyers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid,
                CONSTRAINT "buyers_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "REL_buyers_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "babies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "dateOfBirth" TIMESTAMP NOT NULL,
                "gender" character varying,
                "weight" numeric,
                "height" numeric,
                "bloodGroup" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "parentId" uuid,
                CONSTRAINT "babies_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "FK_babies_parent" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."feeding_type_enum" AS ENUM ('breast', 'bottle', 'solid')
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."breast_side_enum" AS ENUM ('left', 'right', 'both')
        `);

        await queryRunner.query(`
            CREATE TABLE "feeding_records" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "time" TIMESTAMP NOT NULL,
                "type" "public"."feeding_type_enum" NOT NULL,
                "duration" integer,
                "amount" numeric,
                "breastSide" "public"."breast_side_enum",
                "notes" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "babyId" uuid,
                CONSTRAINT "feeding_records_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "FK_feeding_records_baby" FOREIGN KEY ("babyId") REFERENCES "babies"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "diaper_records" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "time" TIMESTAMP NOT NULL,
                "wetDiaper" boolean NOT NULL,
                "dirtyDiaper" boolean NOT NULL,
                "color" character varying,
                "notes" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "babyId" uuid,
                CONSTRAINT "diaper_records_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "FK_diaper_records_baby" FOREIGN KEY ("babyId") REFERENCES "babies"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "sleep_records" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "startTime" TIMESTAMP NOT NULL,
                "endTime" TIMESTAMP,
                "duration" integer,
                "quality" character varying,
                "notes" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "babyId" uuid,
                CONSTRAINT "sleep_records_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "FK_sleep_records_baby" FOREIGN KEY ("babyId") REFERENCES "babies"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."request_status_enum" AS ENUM ('pending', 'accepted', 'rejected')
        `);

        await queryRunner.query(`
            CREATE TABLE "requests" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" "public"."request_status_enum" NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "donorId" uuid,
                "buyerId" uuid,
                CONSTRAINT "requests_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "FK_requests_donor" FOREIGN KEY ("donorId") REFERENCES "donors"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_requests_buyer" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "requests"`);
        await queryRunner.query(`DROP TYPE "public"."request_status_enum"`);
        await queryRunner.query(`DROP TABLE "sleep_records"`);
        await queryRunner.query(`DROP TABLE "diaper_records"`);
        await queryRunner.query(`DROP TABLE "feeding_records"`);
        await queryRunner.query(`DROP TYPE "public"."breast_side_enum"`);
        await queryRunner.query(`DROP TYPE "public"."feeding_type_enum"`);
        await queryRunner.query(`DROP TABLE "babies"`);
        await queryRunner.query(`DROP TABLE "buyers"`);
        await queryRunner.query(`DROP TABLE "donors"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }
}
