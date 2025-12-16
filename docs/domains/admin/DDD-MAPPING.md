# Starter SaaS Admin & Agency Management - DDD Mapping

## Domain Model

This document maps the business domain concepts to their relationships and behaviors, focusing on business logic rather than technical implementation.

## Bounded Context: Agency Management

### Core Entities

#### Agency (Aggregate Root)
**Business Identity:** Unique agency name
**Attributes:**
- Name (required, unique)
- Description (optional)
- Email (optional)
- Phone (optional)
- Address (optional)
- Creation timestamp
- Last update timestamp

**Invariants:**
- Agency name must be unique across the system
- Cannot delete an agency without removing all members first (cascade deletion)
- Agency must have a valid name at all times

**Business Rules:**
- Agency name cannot be duplicated
- Only agency owners can modify agency details
- Deleting an agency removes all memberships

#### User
**Business Identity:** Authentication ID (from auth system)
**Attributes:**
- User ID (from authentication provider)
- Name
- Email
- Password (managed by auth system)

**Invariants:**
- User must be authenticated to interact with agencies
- User ID is immutable

**Business Rules:**
- Users can belong to multiple agencies
- Users can have different roles in different agencies
- Users can accumulate multiple roles within the same agency

#### Agency Membership (Entity)
**Business Identity:** Combination of User ID + Agency ID
**Attributes:**
- User ID
- Agency ID
- Roles (array: commercial, owner)
- Creation timestamp
- Last update timestamp

**Invariants:**
- A user can only have one membership record per agency
- Membership must have at least one role assigned
- Both user and agency must exist for a valid membership

**Business Rules:**
- Users cannot join the same agency twice
- Roles can be cumulated (multiple roles per membership)
- At least one role must always be assigned
- Removing all roles effectively removes the membership

### Value Objects

#### Role
**Values:** "commercial" | "owner"
**Business Meaning:**
- **Commercial:** Sales representative responsible for customer relationships
- **Owner:** Agency owner with full management permissions

**Characteristics:**
- Immutable set of predefined values
- Multiple roles can be assigned to a single membership
- Each role grants specific permissions and capabilities

#### Contact Information
**Attributes:**
- Email address
- Phone number
- Physical address

**Validation Rules:**
- Email must be valid format if provided
- All fields are optional but recommended for business operations

## Aggregates

### Agency Aggregate
**Aggregate Root:** Agency
**Entities:** Agency Membership
**Value Objects:** Role, Contact Information

**Consistency Boundary:**
- All operations on agency members go through the agency aggregate
- Agency controls the lifecycle of all its memberships
- Deleting an agency cascades to delete all memberships

**Operations:**
- Create agency
- Update agency details
- Delete agency (with cascade)
- Add member to agency
- Remove member from agency
- Update member roles
- Query agency members
- Check user's role in agency

## Domain Behaviors

### Agency Lifecycle

```
[New Agency Request]
    → Validate name uniqueness
    → Verify user has owner role (authorization)
    → Create agency
    → Agency becomes active

[Agency Update Request]
    → Verify user has owner role
    → Validate name uniqueness (if name changed)
    → Update agency details
    → Record update timestamp

[Agency Deletion Request]
    → Verify user has owner role
    → Remove all memberships
    → Delete agency
    → Agency ceases to exist
```

### Membership Lifecycle

```
[Add Member Request]
    → Verify user has owner role
    → Verify agency exists
    → Check member not already in agency
    → Assign at least one role
    → Create membership
    → Member becomes active in agency

[Update Member Roles Request]
    → Verify user has owner role
    → Verify membership exists
    → Validate at least one role assigned
    → Update roles
    → Record update timestamp

[Remove Member Request]
    → Verify user has owner role
    → Verify membership exists
    → Delete membership
    → Member loses agency access
```

### Authorization Flow

```
[Admin Page Access]
    → Check user authenticated
    → Check user has owner role in any agency
    → Grant/deny access

[Agency Operation]
    → Check user authenticated
    → Check user has owner role
    → Verify target resource exists
    → Execute operation or deny
```

## Domain Events

### Agency Events
- **AgencyCreated:** When a new agency is registered
- **AgencyUpdated:** When agency details are modified
- **AgencyDeleted:** When an agency is removed from system

### Membership Events
- **MemberAdded:** When a user joins an agency
- **MemberRolesUpdated:** When a member's roles change
- **MemberRemoved:** When a user leaves an agency

## Business Invariants

### System-Wide Invariants
1. Agency names must be globally unique
2. Only authenticated users can perform operations
3. Only agency owners can access admin features
4. Users cannot be added to the same agency twice

### Agency Invariants
1. Agency must always have a non-empty name
2. Agency name uniqueness is maintained at all times
3. Deleting an agency removes all associated memberships

### Membership Invariants
1. Membership must have at least one role
2. User-Agency combination is unique (one membership per user per agency)
3. Both user and agency must exist for valid membership
4. Roles are cumulative (can have multiple roles)

## Relationships

```
User ----< Membership >---- Agency
         (many-to-many)

User:
  - Can belong to multiple agencies
  - Has different roles in different agencies
  - Can accumulate multiple roles in same agency

Agency:
  - Has multiple members
  - Controls member access and roles
  - Owns the membership lifecycle

Membership:
  - Links one user to one agency
  - Contains role assignments
  - Enforces business rules
```

## Repository Patterns

### Agency Repository
**Queries:**
- Get all agencies
- Get agency by ID
- Find agency by name
- Check agency existence
- Count agencies

**Commands:**
- Create agency
- Update agency
- Delete agency

### Membership Repository
**Queries:**
- Get members by agency
- Get memberships by user
- Get specific membership
- Check user's roles in agency
- Check if user has specific role

**Commands:**
- Add member to agency
- Update member roles
- Remove member from agency

## Authorization Policies

### AdminAccessPolicy
**Rule:** User must have "owner" role in at least one agency
**Applies to:** All admin page access, agency management operations

### AgencyOperationPolicy
**Rule:** User must be authenticated and have "owner" role
**Applies to:** Create/update/delete agency, manage members

### MembershipOperationPolicy
**Rule:** User must be authenticated and have "owner" role
**Applies to:** Add/update/remove agency members

## Business Processes

### Agency Registration Process
1. User (with owner role) initiates agency creation
2. System validates agency name uniqueness
3. System creates agency with provided details
4. System confirms agency creation
5. Agency becomes available for member management

### Member Management Process
1. Agency owner navigates to member management
2. Owner adds user by providing user ID
3. Owner assigns one or more roles
4. System validates user not already member
5. System creates membership with roles
6. Member gains access to agency resources

### Role Assignment Process
1. Agency owner selects existing member
2. Owner modifies role assignments (add/remove roles)
3. System validates at least one role remains
4. System updates membership roles
5. Member's permissions are updated immediately

### Agency Deletion Process
1. Agency owner initiates deletion
2. System confirms deletion intent
3. System removes all agency memberships
4. System deletes agency
5. All associated data is removed (irreversible)
