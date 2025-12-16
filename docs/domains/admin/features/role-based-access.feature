@admin @rbac
Feature: Role-Based Access Control
  As the VroomMarket platform
  I want to enforce role-based access control
  So that users can only access features they're authorized for

  # ═══════════════════════════════════════════════════════════════════
  # ROLES:
  # SYSTEM: admin (full platform access)
  # AGENCY: agency-manager, commercial
  # ═══════════════════════════════════════════════════════════════════

  # ═══════════════════════════════════════════════════════════════════
  # AUTHENTICATION REQUIRED
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Unauthenticated user redirected to login from vehicles
    Given I am not authenticated
    When I navigate to "/vehicles"
    Then I should be redirected to "/login"

  @critical
  Scenario: Unauthenticated user redirected to login from admin
    Given I am not authenticated
    When I navigate to "/admin"
    Then I should be redirected to "/login"

  # ═══════════════════════════════════════════════════════════════════
  # ADMIN ACCESS
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Admin can access admin pages
    Given I am authenticated with role "admin"
    When I navigate to "/admin/agencies"
    Then I should see the agencies page
    And I should not see "No Permission"

  @critical
  Scenario: Non-admin cannot access admin agencies
    Given I am authenticated with role "commercial"
    When I navigate to "/admin/agencies"
    Then I should see the no permission page

  @critical
  Scenario: Non-admin cannot access admin members
    Given I am authenticated with role "commercial"
    When I navigate to "/admin/members"
    Then I should see the no permission page

  # ═══════════════════════════════════════════════════════════════════
  # SIDEBAR NAVIGATION
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Admin sees Administration section in sidebar
    Given I am authenticated with role "admin"
    When I navigate to "/vehicles"
    Then I should see "Administration" in sidebar
    And I should see "Agencies" link in sidebar

  @critical
  Scenario: Non-admin does not see Administration section
    Given I am authenticated with role "commercial"
    When I navigate to "/vehicles"
    Then I should not see "Administration" in sidebar

  Scenario: Admin navigation link works
    Given I am authenticated with role "admin"
    And I am on "/vehicles"
    When I click "Agencies" in sidebar
    Then I should be on "/admin/agencies"

  # ═══════════════════════════════════════════════════════════════════
  # VEHICLE ACCESS
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Commercial user can access vehicles page
    Given I am authenticated with role "commercial"
    When I navigate to "/vehicles"
    Then I should see the vehicles page

  # ═══════════════════════════════════════════════════════════════════
  # DEFAULT LANDING
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Authenticated user lands on vehicles page
    Given I am authenticated with role "commercial"
    When I navigate to "/"
    Then I should be redirected to "/vehicles"

  # ═══════════════════════════════════════════════════════════════════
  # NO PERMISSION PAGE
  # ═══════════════════════════════════════════════════════════════════

  Scenario: No permission page shows helpful message
    Given I am authenticated with role "commercial"
    When I navigate to "/admin"
    Then I should see "No Permission" heading
    And I should see a link to go back
