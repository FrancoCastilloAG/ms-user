import {ConfigModule} from '@nestjs/config';
import { DataSource,DataSourceOptions } from 'typeorm';
import { User } from '../entities/user.entity';

ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
});

export const databaseConfig: DataSourceOptions = {
    type: process.env.TYPEORM_CONNECTION as any,
    host: process.env.TYPEORM_HOST,
    port:parseInt(process.env.TYPEORM_PORT,10),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [User],
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'false',
    logging: process.env.TYPEORM_LOGGING === 'true',
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
};

export const AppReserveConfig = new DataSource(databaseConfig);