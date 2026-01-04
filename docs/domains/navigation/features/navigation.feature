@navigation
Feature: Navigation
	As a user
	I want to navigate the application
	So that I can access different sections

	Scenario: View homepage
		Given I am on the homepage
		When I look at the page title
		Then I should see "starter" in the title

	Scenario: Navigate to todos as authenticated user
		Given I am authenticated
		And I am on the homepage
		When I click on "Todos" in the sidebar
		Then I should be on the todos page
		And the URL should contain "/todos"

	Scenario: Unauthenticated user sees login option
		Given I am on the login page
		Then I should see the sign in option
