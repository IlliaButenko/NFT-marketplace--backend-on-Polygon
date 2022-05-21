import { applyDecorators } from '@nestjs/common';
import { plugin } from '@typegoose/typegoose';

export const useMongoosePlugin = () => applyDecorators();
