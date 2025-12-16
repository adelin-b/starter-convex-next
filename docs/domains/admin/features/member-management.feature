@admin @members
Feature: Agency Member Management
  As an admin
  I want to manage agency members
  So that I can control who has access to agency resources

  # ═══════════════════════════════════════════════════════════════════
  # ROLES:
  # - commercial: Add vehicles, update vehicle status
  # - agency-manager: Modify agency settings, manage agency members
  # ═══════════════════════════════════════════════════════════════════

  Background:
    Given I am authenticated with role "admin"
    And an agency "Test Agency" exists
    And I navigate to the members page for "Test Agency"

  # ═══════════════════════════════════════════════════════════════════
  # VIEW MEMBERS
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: View members list
    Given "Test Agency" has the following members:
      | email              | roles                      |
      | john@example.com   | commercial                 |
      | jane@example.com   | agency-manager             |
      | both@example.com   | commercial, agency-manager |
    Then I should see 3 items in the list
    And I should see "john@example.com"
    And I should see role badge "Commercial"

  @critical
  Scenario: Empty members state
    Given "Test Agency" has no members
    Then I should see "No members found"
    And I should see "Add Member" button

  # ═══════════════════════════════════════════════════════════════════
  # SEARCH
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Search members by email
    Given "Test Agency" has the following members:
      | email              |
      | john@example.com   |
      | jane@example.com   |
      | bob@other.com      |
    When I search for "example.com"
    Then I should see 2 items in the list
    And I should not see "bob@other.com"

  # ═══════════════════════════════════════════════════════════════════
  # ADD MEMBER
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Add member with role
    When I click "Add Member"
    And I fill in "email" with "new@example.com"
    And I select role "Commercial"
    And I submit the form
    Then I should see a success message
    And I should see "new@example.com" in the list

  Scenario: Add member with multiple roles
    When I click "Add Member"
    And I fill in "email" with "multi@example.com"
    And I select role "Commercial"
    And I select role "Agency Manager"
    And I submit the form
    Then I should see "multi@example.com" in the list

  Scenario: At least one role is required
    When I click "Add Member"
    And I fill in "email" with "new@example.com"
    And I submit the form
    Then I should see a validation error for "roles"

  # ═══════════════════════════════════════════════════════════════════
  # TOGGLE ROLES
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Add role to existing member
    Given "Test Agency" has member "user@example.com" with role "commercial"
    When I toggle role "Agency Manager" for "user@example.com"
    Then "user@example.com" should have roles "Commercial" and "Agency Manager"

  Scenario: Remove role from member with multiple roles
    Given "Test Agency" has member "user@example.com" with roles "commercial, agency-manager"
    When I toggle role "Commercial" for "user@example.com"
    Then "user@example.com" should only have role "Agency Manager"

  @critical
  Scenario: Cannot remove last role
    Given "Test Agency" has member "single@example.com" with role "commercial"
    Then the "Commercial" toggle for "single@example.com" should be disabled

  # ═══════════════════════════════════════════════════════════════════
  # REMOVE MEMBER
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Remove member with confirmation
    Given "Test Agency" has member "remove@example.com" with role "commercial"
    When I remove "remove@example.com"
    Then I should see a confirmation dialog

  @critical
  Scenario: Confirm removal removes member
    Given "Test Agency" has member "remove@example.com" with role "commercial"
    When I remove "remove@example.com"
    And I confirm the deletion
    Then I should not see "remove@example.com" in the list

  # ═══════════════════════════════════════════════════════════════════
  # NAVIGATION
  # ═══════════════════════════════════════════════════════════════════

  Scenario: Breadcrumb navigation back to agencies
    Then I should see breadcrumb "Agencies"
    When I click breadcrumb "Agencies"
    Then I should be on "/admin/agencies"
