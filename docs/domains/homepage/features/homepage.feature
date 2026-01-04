@homepage
Feature: Homepage
	As a visitor
	I want to see the landing page
	So that I can understand what the application offers

	# ─────────────────────────────────────────────────────────────────
	# Page Load
	# ─────────────────────────────────────────────────────────────────

	Scenario: View landing page
		Given I am on the homepage
		Then I should see the hero section
		And I should see "Get Started" button

	Scenario: Navigate to login from landing page
		Given I am on the homepage
		When I click on "Sign In" button
		Then I should be on the login page
