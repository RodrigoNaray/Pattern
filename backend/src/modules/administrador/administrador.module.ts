import { Module } from "@nestjs/common";
import { AdministradorController } from "./administrador.controller";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "@common/config/database/prisma.service";

@Module({
  imports: [],
  controllers: [AdministradorController],
  providers: [AuthService, PrismaService],
})
export class AdministradorModule {}