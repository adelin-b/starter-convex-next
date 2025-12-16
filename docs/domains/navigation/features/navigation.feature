@navigation
Feature: Navigation
	As a user
	I want to navigate the application
	So that I can access different sections

	Scenario: View homepage
		Given I am on the homepage
		When I look at the page title
		Then I should see "vroommarket" in the title

	Scenario: Navigate to vehicles page as authenticated user
		Given I am authenticated
		And I am on the homepage
		When I click on "Vehicles" in the sidebar
		Then I should be on the vehicles page
		And the URL should contain "/vehicles"

	Scenario: Unauthenticated user is redirected to login when accessing vehicles
		Given I am on the homepage
		When I click on "Vehicles" in the sidebar
		Then I should be redirected to login
