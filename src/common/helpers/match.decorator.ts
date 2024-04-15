import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator';
  
  @ValidatorConstraint({ name: 'match', async: false })
  export class MatchConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
      const [relatedPropertyName] = args.constraints;
      const relatedValue = (args.object as any)[relatedPropertyName];
      return value === relatedValue;
    }
  
    defaultMessage(args: ValidationArguments) {
      const [relatedPropertyName] = args.constraints;
      return `$property must match ${relatedPropertyName} exactly.`;
    }
  }
  
  export function Match(property: string, validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [property],
        validator: MatchConstraint,
      });
    };
  }
  