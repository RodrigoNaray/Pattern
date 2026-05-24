import { Module } from "@nestjs/common";
import { ProductoController } from "./producto.controller";
import { AdminProductoController } from "./admin-producto.controller";
import { ProductoService } from "./producto.service";
import { ImagenService } from "./imagen.service";
import { AuthModule } from "@modules/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [ProductoController, AdminProductoController],
  providers: [ProductoService, ImagenService],
  exports: [ProductoService],
})
export class ProductoModule {}
