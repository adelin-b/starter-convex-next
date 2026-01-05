Feature: User Authentication
	As a user
	I want to authenticate with the application
	So that I can access protected features

	Background:
		# Authentication steps are loaded from auth.steps.ts

	Scenario: Access dashboard as authenticated user
		Given I am logged in as "testuser"
		When I go to "/dashboard"
		Then I should be logged in

	Scenario: Manual sign in flow
		Given I am on the homepage
		When I sign in with email "test@example.com" and password "password123"
		Then I should be logged in
		And the URL should be "/dashboard"
