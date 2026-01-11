@billing
Feature: Subscription and Billing
	As a user
	I want to manage my subscription
	So that I can access premium features

	# ─────────────────────────────────────────────────────────────────
	# Pricing Page Scenarios
	# ─────────────────────────────────────────────────────────────────

	Scenario: View pricing page as unauthenticated user
		Given I am on the pricing page
		Then I should see the pricing table
		And I should see "Free", "Pro" and "Team" plans

	Scenario: View pricing page as authenticated user
		Given I am logged in
		When I navigate to the pricing page
		Then I should see the pricing table
		And I should see my current plan highlighted

	Scenario: Toggle between monthly and yearly billing
		Given I am on the pricing page
		When I toggle to yearly billing
		Then I should see yearly prices displayed
		When I toggle to monthly billing
		Then I should see monthly prices displayed

	# ─────────────────────────────────────────────────────────────────
	# Subscription Status Scenarios
	# ─────────────────────────────────────────────────────────────────

	Scenario: Free user sees upgrade prompt in settings
		Given I am logged in
		When I navigate to settings
		Then I should see "Free" as my current plan
		And I should see "View Plans" button

	@requires-polar-sandbox
	Scenario: Subscribed user sees subscription details
		Given I am logged in with a "Pro" subscription
		When I navigate to settings
		Then I should see "Pro" as my current plan
		And I should see "Manage Subscription" button
		And I should see the next billing date

	# ─────────────────────────────────────────────────────────────────
	# Checkout Flow Scenarios (Polar Sandbox)
	# ─────────────────────────────────────────────────────────────────

	@requires-polar-sandbox
	Scenario: Initiate Pro subscription checkout
		Given I am logged in
		And I am on the pricing page
		When I click on the "Pro" plan card
		Then I should be redirected to Polar checkout
		And the checkout should show "Pro" plan details

	@requires-polar-sandbox
	Scenario: Complete Pro subscription with test card
		Given I am logged in
		And I am on the pricing page
		When I click on the "Pro" plan card
		And I complete checkout with test card "4242424242424242"
		Then I should be redirected back to the app
		And I should see "Pro" as my current plan

	@requires-polar-sandbox
	Scenario: Checkout with declined card shows error
		Given I am logged in
		And I am on the pricing page
		When I click on the "Pro" plan card
		And I complete checkout with test card "4000000000000002"
		Then I should see a payment declined error

	# ─────────────────────────────────────────────────────────────────
	# Subscription Management Scenarios
	# ─────────────────────────────────────────────────────────────────

	@requires-polar-sandbox
	Scenario: Access customer portal from settings
		Given I am logged in with a "Pro" subscription
		When I navigate to settings
		And I click "Manage Subscription"
		Then I should be redirected to Polar customer portal

	@requires-polar-sandbox
	Scenario: Cancel subscription from customer portal
		Given I am logged in with a "Pro" subscription
		When I navigate to settings
		And I click "Manage Subscription"
		And I cancel my subscription in the portal
		Then I should see "subscription will end" message

	@requires-polar-sandbox
	Scenario: Change plan from Pro to Team
		Given I am logged in with a "Pro" subscription
		When I navigate to the pricing page
		And I click on the "Team" plan card
		And I confirm the plan change
		Then I should see "Team" as my current plan
