Feature: Homepage Navigation
	As a user
	I want to navigate the homepage
	So that I can access different sections of the application

	Scenario: View homepage
		Given I am on the homepage
		When I look at the page title
		Then I should see the app name in the title

	Scenario: Navigate to dashboard
		Given I am on the homepage
		When I click on "Dashboard" in the navigation
		Then I should be on the dashboard page
		And the URL should contain "/dashboard"