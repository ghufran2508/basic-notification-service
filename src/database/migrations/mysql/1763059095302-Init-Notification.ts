import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitNotification1763059095302 implements MigrationInterface {
    name = 'InitNotification1763059095302'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "notifications" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "title" varchar NOT NULL, "message" text NOT NULL, "type" varchar NOT NULL DEFAULT ('info'), "isRead" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "readAt" datetime)`
        )
        await queryRunner.query(`CREATE INDEX "IDX_692a909ee0fa9383e7859f9b40" ON "notifications" ("user_id") `)
        await queryRunner.query(`CREATE INDEX "IDX_5340fc241f57310d243e5ab20b" ON "notifications" ("user_id", "isRead") `)
        await queryRunner.query(`CREATE INDEX "IDX_21e65af2f4f242d4c85a92aff4" ON "notifications" ("user_id", "createdAt") `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_21e65af2f4f242d4c85a92aff4"`)
        await queryRunner.query(`DROP INDEX "IDX_5340fc241f57310d243e5ab20b"`)
        await queryRunner.query(`DROP INDEX "IDX_692a909ee0fa9383e7859f9b40"`)
        await queryRunner.query(`DROP TABLE "notifications"`)
    }
}
