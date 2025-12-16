# VroomMarket Admin & Agency Management - Glossary

## User & Role Terminology

### Commercial
A sales representative who works within an agency. Commercials manage customer relationships, handle leads, and conduct sales activities. This is a role that can be assigned to agency members.

### Agency Owner
The person who owns and manages an agency. Agency owners have full permissions to manage their agency's settings, add or remove members, and assign roles. In the system, this is represented by the "owner" role.

### Agency Member
Any user who belongs to an agency. Members have one or more roles assigned to them (commercial, owner). A user can be a member of multiple agencies.

### User
An authenticated person in the system. Users can be members of agencies with specific roles. Users authenticate with email and password.

## Agency Terminology

### Agency
An organization or business entity within VroomMarket. Agencies have members with specific roles. Each agency has a name, optional description, contact information (email, phone), and address.

### Membership
The relationship between a user and an agency, including the roles the user has in that agency. Memberships track which users belong to which agencies and what they can do.

## Access Control Terminology

### Authentication
The process of verifying a user's identity through login credentials (email and password).

### Authorization
The process of determining what actions an authenticated user is allowed to perform based on their roles and memberships.

### Admin Access
Access to agency management features. In VroomMarket, admin access is granted to users who have the "owner" role in at least one agency. This allows them to manage agencies, members, and roles.

### Role Assignment
The act of granting specific roles to a user within an agency. Roles can be cumulated, meaning a user can have multiple roles simultaneously (e.g., both commercial and owner).

## Business Operations

### Create Agency
The process of setting up a new agency in the system with required information (name) and optional details (description, contact info, address).

### Manage Members
Adding users to agencies, assigning roles, updating role assignments, and removing users from agencies.

### Role Update
Changing the roles assigned to an agency member. Since roles can be cumulated, users can have multiple roles added or removed.

### Remove Member
The action of removing a user from an agency, which revokes their access to agency resources and removes all their roles in that agency.

### Delete Agency
Permanently removing an agency from the system, which also removes all its members and associated data. This action cannot be undone.

## Data Terminology

### Agency Profile
The information associated with an agency: name (required), description, email, phone, and address (all optional).

### Contact Information
The business contact details for an agency: email address and phone number.

### Duplicate Prevention
System protection that prevents creating multiple agencies with the same name or adding the same user to an agency twice.

## Status & State

### Active Membership
A user who is currently a member of an agency with assigned roles.

### Multiple Roles
The capability for a user to hold more than one role simultaneously within the same agency (e.g., both commercial and owner).

### Agency Existence
Whether an agency record is present in the system and available for operations.

### Member Count
The number of users who are members of a specific agency.
