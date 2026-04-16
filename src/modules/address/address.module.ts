import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthJwtModule } from '../../common/auth-jwt.module';
import { AddressDocument, AddressSchema } from './infrastructure/persistence/address.orm-entity';
import { AddressRepositoryImpl } from './infrastructure/persistence/address.repository.impl';
import { ADDRESS_REPOSITORY } from './application/address-repository.token';
import { AddressController } from './presentation/controllers/address.controller';
import { CreateAddressHandler } from './application/commands/create-address/create-address.handler';
import { UpdateAddressHandler } from './application/commands/update-address/update-address.handler';
import { DeleteAddressHandler } from './application/commands/delete-address/delete-address.handler';
import { ListMyAddressesHandler } from './application/queries/list-my-addresses/list-my-addresses.handler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AddressDocument.name, schema: AddressSchema },
    ]),
    AuthJwtModule,
  ],
  controllers: [AddressController],
  providers: [
    AddressRepositoryImpl,
    {
      provide: ADDRESS_REPOSITORY,
      useExisting: AddressRepositoryImpl,
    },
    CreateAddressHandler,
    UpdateAddressHandler,
    DeleteAddressHandler,
    ListMyAddressesHandler,
  ],
  exports: [MongooseModule, ADDRESS_REPOSITORY],
})
export class AddressModule {}
