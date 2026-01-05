import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { polar } from "./polar";

const http = httpRouter();

// Better-Auth routes
authComponent.registerRoutes(http, createAuth);

// Polar webhook routes - handles subscription events
polar.registerRoutes(http);

export default http;
