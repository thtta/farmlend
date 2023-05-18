import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReferencedOrdersMigration1684333837510
  implements MigrationInterface
{
  name = 'ReferencedOrdersMigration1684333837510';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "referenced_orders" ("orders_id_1" integer NOT NULL, "ordersId" integer NOT NULL, CONSTRAINT "PK_c71c3fc5e32973edde120903083" PRIMARY KEY ("orders_id_1", "ordersId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_892ffecb95026bb757db835ea4" ON "referenced_orders" ("orders_id_1") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_82e96877db09bb79a1977def50" ON "referenced_orders" ("ordersId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "referenced_orders" ADD CONSTRAINT "FK_892ffecb95026bb757db835ea4b" FOREIGN KEY ("orders_id_1") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "referenced_orders" ADD CONSTRAINT "FK_82e96877db09bb79a1977def50e" FOREIGN KEY ("ordersId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "referenced_orders" DROP CONSTRAINT "FK_82e96877db09bb79a1977def50e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "referenced_orders" DROP CONSTRAINT "FK_892ffecb95026bb757db835ea4b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_82e96877db09bb79a1977def50"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_892ffecb95026bb757db835ea4"`,
    );
    await queryRunner.query(`DROP TABLE "referenced_orders"`);
  }
}
