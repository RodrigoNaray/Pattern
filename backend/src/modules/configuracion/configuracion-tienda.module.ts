import { Module } from '@nestjs/common';
import { ConfiguracionTiendaController } from './configuracion-tienda.controller';
import { ConfiguracionPublicaController } from './configuracion-publica.controller';
import { ConfiguracionTiendaService } from './configuracion-tienda.service';

@Module({
  controllers: [ConfiguracionTiendaController, ConfiguracionPublicaController],
  providers: [ConfiguracionTiendaService],
  exports: [ConfiguracionTiendaService],
})
export class ConfiguracionTiendaModule {}