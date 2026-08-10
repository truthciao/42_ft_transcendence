# ValidationPipe

## Purpose

ValidationPipe is enabled globally in NestJS.

Location:

apps/api/src/main.ts

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

---

## What does it do?

Every HTTP request will be validated before entering the controller.

```
Request
    ↓
ValidationPipe
    ↓
DTO
    ↓
Controller
    ↓
Service
```

---

## Configuration

### whitelist

Only properties defined in DTO are accepted.

Example:

Request

```json
{
  "email": "a@test.com",
  "username": "alice",
  "role": "ADMIN"
}
```

DTO

```ts
class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;
}
```

Result

```
role
```

is rejected.

---

### forbidNonWhitelisted

Extra properties cause HTTP 400.

Response

```json
{
  "statusCode": 400,
  "message": ["property role should not exist"]
}
```

---

### transform

Converts request payload into DTO instance.

Also converts route/query parameters to expected types when applicable.

---

## How to test

### Valid request

```bash
curl -X POST http://localhost:3000/users/test-validation \
-H "Content-Type: application/json" \
-d '{
"email":"test@example.com",
"username":"alice"
}'
```

Expected

```
200 OK
```

---

### Invalid email

```bash
curl ...
```

Expected

```
400 Bad Request
```

---

### Extra property

```json
{
  "role": "ADMIN"
}
```

Expected

```
400 Bad Request
```

---

## Notes

Validation is performed before controller execution.

Business logic should not perform input validation already handled by DTO.
