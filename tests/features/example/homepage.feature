Feature: Homepage Navigation
	As a user
	I want to navigate the homepage
	So that I can access different sections of the application

	Scenario: View homepage
		Given I am on the homepage
		When I look at the page title
		Then I should see "vroommarket" in the title

	Scenario: Navigate to vehicles page
		Given I am on the homepage
		When I click on "Vehicles" in the navigation
		Then I should be on the vehicles page
		And the URL should contain "/vehicles"