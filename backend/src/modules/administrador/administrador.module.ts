import { Module } from "@nestjs/common";
import { AdministradorController } from "./administrador.controller";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "@common/config/database/database.module";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [AdministradorController],
  providers: [],
})
export class AdministradorModule {}