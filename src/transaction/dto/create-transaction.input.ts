import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsNumber, IsPositive, Min } from 'class-validator';

@InputType()
export class CreateTransactionInput {
  @Field()
  @IsUUID()
  accountExternalIdDebit: string;

  @Field()
  @IsUUID()
  accountExternalIdCredit: string;

  @Field()
  @IsNumber()
  @IsPositive()
  tranferTypeId: number;

  @Field()
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  value: number;
}
