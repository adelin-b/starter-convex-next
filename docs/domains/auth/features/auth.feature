@auth
Feature: User Authentication
	As a user
	I want to authenticate with the application
	So that I can access protected features

	# ─────────────────────────────────────────────────────────────────
	# Sign Up Scenarios
	# ─────────────────────────────────────────────────────────────────

	Scenario: Create a new account
		When I sign up with name "Test User", email "newuser@example.com" and password "SecurePass123"
		Then I should be logged in

	Scenario: View sign up form on dashboard
		Given I am on the dashboard page
		Then I should see the sign up form

	Scenario: Sign up with existing email
		Given I have an account with email "duplicate@example.com" and password "Pass1234"
		And I am on the dashboard page
		When I try to sign up with the existing email and password "DifferentPass123"
		Then I should see an authentication error

	# ─────────────────────────────────────────────────────────────────
	# Sign In Scenarios
	# ─────────────────────────────────────────────────────────────────

	Scenario: View sign in form on dashboard
		Given I am on the dashboard page
		Then I should see the sign in option

	Scenario: Sign in with valid credentials
		Given I have an account with email "existing@example.com" and password "ValidPass123"
		When I am on the dashboard page
		And I sign in with email "existing@example.com" and password "ValidPass123"
		Then I should be logged in

	Scenario: Sign in with invalid password
		Given I have an account with email "test@example.com" and password "CorrectPassword"
		When I am on the dashboard page
		And I sign in with email "test@example.com" and password "WrongPassword"
		Then I should see an authentication error

	Scenario: Sign in with non-existent email
		Given I am on the dashboard page
		When I sign in with email "nonexistent@example.com" and password "SomePassword"
		Then I should see an authentication error

	# ─────────────────────────────────────────────────────────────────
	# Sign Out Scenarios
	# ─────────────────────────────────────────────────────────────────

	Scenario: Sign out from dashboard
		Given I have an account with email "signout@example.com" and password "SignOutPass123"
		And I am on the dashboard page
		When I sign in with email "signout@example.com" and password "SignOutPass123"
		And I log out
		Then I should be logged out

	# ─────────────────────────────────────────────────────────────────
	# Session & Access Control
	# ─────────────────────────────────────────────────────────────────

	Scenario: Access dashboard as authenticated user
		When I sign up with name "Dashboard User", email "dashboard@example.com" and password "DashPass123"
		Then I should be logged in

	Scenario: Redirect unauthenticated user to sign in
		Given I am on the dashboard page
		Then I should see the sign in option
		And I should not see the user menu

	# ─────────────────────────────────────────────────────────────────
	# Form Validation Scenarios
	# ─────────────────────────────────────────────────────────────────

	Scenario Outline: Sign up form validation - <validation_type>
		Given I am on the dashboard page
		When I sign up with name "<name>", email "<email>" and password "<password>"
		Then I should see validation error "<error>"

		Examples:
			| validation_type | name      | email            | password      | error                                  |
			| invalid email   | Test User | invalid-email    | SecurePass123 | Invalid email address                  |
			| short password  | Test User | test@example.com | short         | Password must be at least 8 characters |
			| short name      | X         | test@example.com | SecurePass123 | Name must be at least 2 characters     |

	# ─────────────────────────────────────────────────────────────────
	# Form Switching Scenarios
	# ─────────────────────────────────────────────────────────────────

	Scenario: Switch from sign up to sign in form
		Given I am on the dashboard page
		When I switch to sign in form
		Then I should see the sign in form
