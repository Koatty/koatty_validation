# koatty_validation
Validation Util for Koatty. Based on class-validator, extended parameter type checking and restricted attribute functions.


# User Decorators

* @IsDefined
* @IsCnName
* @IsIdNumber
* @IsZipCode
* @IsMobile
* @IsPlateNumber
* @IsEmail
* @IsIP
* @IsPhoneNumber
* @IsUrl
* @IsHash
* @IsNotEmpty
* @Equals
* @NotEquals
* @Contains
* @IsIn
* @IsNotIn
* @IsDate
* @Gt
* @Gte
* @Lt
* @Lte
  
* @Valid
* @Validated



```js

export class Controller {

    Test(@Valid("IsNotEmpty", "can not be empty!!") id: number){
        //todo
    }

    @Validated() // use dto validation
    TestDto(user: UserDTO) {

    }
}

export class UserDTO {
    @IsNotEmpty({ message: "can not be empty!!" })
    phoneNum: string;

    @IsCnName({ message: "must be cn name"})
    userName: string;
}

```

# Validator for manual

## FunctionValidator

* IsCnName
* IsIdNumber
* IsZipCode
* IsMobile
* IsPlateNumber
* IsEmail
* IsIP
* IsPhoneNumber
* IsUrl
* IsHash
* IsNotEmpty
* Equals
* NotEquals
* Contains
* IsIn
* IsNotIn
* IsDate
* Gt
* Gte
* Lt
* Lte

exp:

```js
const str = "";
// throw Error
FunctionValidator.IsNotEmpty(str, "cannot be empty");
FunctionValidator.Contains(str, {message: "must contain s", value: "s"});
```

## ClassValidator

exp:

```js
class SchemaClass {
    @IsDefined
    id: number;
    
    @IsNotEmpty
    name: string;
}


ClassValidator.valid(SchemaClass, {name: ''}).catch(err => {
    console.log(err);
})
```

