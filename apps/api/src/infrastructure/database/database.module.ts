import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/mysql2";
import * as mysql from "mysql2/promise";

export const DRIZZLE = Symbol("drizzle-connection");

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string>(
          "DATABASE_URL",
          "mysql://quant_user:quant_password@localhost:3306/quant_db",
        );
        const poolConnection = mysql.createPool(connectionString);
        return drizzle(poolConnection);
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
