@homepage
Feature: Homepage
	As a user
	I want to see the homepage
	So that I can understand what the application does

	Background:
		Given I am authenticated
		When I visit the homepage

	# ─────────────────────────────────────────────────────────────────
	# Page Load
	# ─────────────────────────────────────────────────────────────────

	Scenario: Load the homepage as authenticated user
		Then the URL should be "/"

	Scenario: Display title banner
		Then I should see the title banner

	# ─────────────────────────────────────────────────────────────────
	# API Status
	# ─────────────────────────────────────────────────────────────────

	Scenario: Display API status section
		Then I should see the API status section

	Scenario: Connect to Convex API
		When I wait for the API to connect
		Then the API status should be "Connected"

	# ─────────────────────────────────────────────────────────────────
	# Accessibility
	# ─────────────────────────────────────────────────────────────────

	Scenario: Have proper heading structure
		Then I should see the "API Status" heading

	Scenario: Be keyboard navigable
		When I press the Tab key
		Then an element should have focus
