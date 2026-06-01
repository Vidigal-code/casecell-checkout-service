import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { inline, multiline } from '@shared/i18n/bilingual';
import { SWAGGER_DOCUMENTATION } from './swagger.i18n';

export const setupSwaggerDocs = (app: INestApplication): void => {
  const { version, locales } = SWAGGER_DOCUMENTATION;

  Object.entries(locales).forEach(([localeKey, localeConfig]) => {
    const builder = new DocumentBuilder()
      .setTitle(inline(localeConfig.title))
      .setDescription(multiline(localeConfig.description))
      .setVersion(version)
      .addServer({
        url: '/api/v1',
        description: inline({
          pt: 'Gateway interno (mesma origem do backend)',
          en: 'Internal gateway (same origin as backend)',
        }),
      })
      .addBearerAuth();

    const document = SwaggerModule.createDocument(app, builder.build());

    const options: SwaggerCustomOptions = {
      jsonDocumentUrl: localeConfig.jsonRoute,
      customSiteTitle: inline({
        pt: `Documentação (${localeKey.toUpperCase()})`,
        en: `Documentation (${localeKey.toUpperCase()})`,
      }),
    };

    SwaggerModule.setup(localeConfig.route, app, document, options);
  });
};
