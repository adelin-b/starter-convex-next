@admin @agencies
Feature: Agency Management
  As an admin
  I want to manage agencies
  So that I can control VroomMarket dealerships

  Background:
    Given I am authenticated with role "admin"
    And I navigate to "/admin/agencies"

  # ═══════════════════════════════════════════════════════════════════
  # VIEW AGENCIES
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: View agencies list
    Given the following agencies exist:
      | name         | email            |
      | Sales Pro    | sales@pro.com    |
      | Auto Dealers | info@dealers.com |
    Then I should see 2 items in the list
    And I should see "Sales Pro"
    And I should see "Auto Dealers"

  @critical
  Scenario: Empty state shows call to action
    Given no agencies exist
    Then I should see "No agencies found"
    And I should see "Add Agency" button

  # ═══════════════════════════════════════════════════════════════════
  # SEARCH
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Search agencies by name
    Given the following agencies exist:
      | name          |
      | Alpha Motors  |
      | Beta Cars     |
      | Gamma Auto    |
    When I search for "Alpha"
    Then I should see 1 item in the list
    And I should see "Alpha Motors"
    And I should not see "Beta Cars"

  Scenario: Clear search shows all agencies
    Given the following agencies exist:
      | name  |
      | Alpha |
      | Beta  |
    And I have searched for "Alpha"
    When I clear the search
    Then I should see 2 items in the list

  # ═══════════════════════════════════════════════════════════════════
  # CREATE AGENCY
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Create agency successfully
    When I click "Add Agency"
    And I fill in "name" with "New Agency"
    And I submit the form
    Then I should see a success message
    And I should see "New Agency" in the list

  Scenario: Create agency with all fields
    When I click "Add Agency"
    And I fill in the form:
      | field       | value                 |
      | name        | Premium Motors        |
      | description | Luxury car dealership |
      | email       | contact@premium.com   |
      | phone       | +33 1 98 76 54 32     |
    And I submit the form
    Then I should see "Premium Motors" in the list

  Scenario: Name is required for agency creation
    When I click "Add Agency"
    And I submit the form without filling required fields
    Then I should see a validation error for "name"
    And the dialog should remain open

  # ═══════════════════════════════════════════════════════════════════
  # DELETE AGENCY
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Delete agency with confirmation
    Given an agency "Agency To Delete" exists
    When I delete "Agency To Delete"
    Then I should see a confirmation dialog
    And the dialog should mention "Agency To Delete"

  @critical
  Scenario: Confirm deletion removes agency
    Given an agency "Agency To Delete" exists
    When I delete "Agency To Delete"
    And I confirm the deletion
    Then I should not see "Agency To Delete" in the list

  Scenario: Cancel deletion keeps agency
    Given an agency "Keep Me" exists
    When I delete "Keep Me"
    And I cancel the dialog
    Then I should see "Keep Me" in the list

  # ═══════════════════════════════════════════════════════════════════
  # NAVIGATION
  # ═══════════════════════════════════════════════════════════════════

  @critical
  Scenario: Navigate to agency members
    Given an agency "Test Agency" exists
    When I click "Members" for "Test Agency"
    Then the URL should contain "/members"
    And I should see "Test Agency" in the page title
