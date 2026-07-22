import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import * as fs from 'fs';
import { CatalogController } from './catalog/catalog.controller';
import { CatalogService } from './catalog/catalog.service';

const staticPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
const serveStaticImports = fs.existsSync(staticPath)
  ? [
      ServeStaticModule.forRoot({
        rootPath: staticPath,
        exclude: ['/api/(.*)'],
      }),
    ]
  : [];

@Module({
  imports: [...serveStaticImports],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class AppModule {}
