# Auth Domain - DDD Mapping

## Bounded Context: Authentication

### Entities

#### User (External - from Better-Auth)
- **Identity:** Email address
- **Attributes:** email, name, password (hashed)
- **Managed by:** Better-Auth

#### Session
- **Identity:** Session token
- **Attributes:** userId, expiresAt
- **Invariants:** Session must reference valid user

### Domain Events
- **UserSignedUp** - New account created
- **UserSignedIn** - Successful authentication
- **UserSignedOut** - Session ended
- **SessionExpired** - Automatic logout

### Authorization Flow
```
[Sign In Request]
    → Validate credentials
    → Create session
    → Return auth token
    → User gains access
```
