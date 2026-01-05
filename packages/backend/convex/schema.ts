import { defineSchema } from "convex/server";
import { z } from "zod";
import { zid, zodTable } from "zodvex";

const FIELDS_CONSTANTS = {
  MAX_LENGTH_SMALL: 255,
} as const;

// Reusable nullable organizationId type
const nullableOrganizationId = z.union([zid("organizations"), z.null()]);

// =============================================================================
// TODOS (Example Domain)
// =============================================================================

export const todoStatuses = ["pending", "in_progress", "completed"] as const;
export type TodoStatus = (typeof todoStatuses)[number];

export const todoPriorities = ["low", "medium", "high"] as const;
export type TodoPriority = (typeof todoPriorities)[number];

export const Todos = zodTable("todos", {
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(todoStatuses),
  priority: z.enum(todoPriorities).optional(),
  dueDate: z.number().int().positive().optional(),
  userId: z.string().min(1),
  organizationId: zid("organizations").optional(), // Optionally scoped to org
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  completedAt: z.number().int().positive().optional(),
});

const TodosTable = Todos.table
  .index("by_user", ["userId"])
  .index("by_status", ["status"])
  .index("by_user_status", ["userId", "status"])
  .index("by_organization", ["organizationId"]);

// =============================================================================
// ORGANIZATIONS (Multi-tenant support)
// =============================================================================

export const organizationRoles = ["member", "admin", "owner"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

export const organizationStatuses = ["active", "inactive"] as const;
export type OrganizationStatus = (typeof organizationStatuses)[number];

export const roleLabels: Record<OrganizationRole, string> = {
  member: "Member",
  admin: "Admin",
  owner: "Owner",
};

export const roleColors: Record<OrganizationRole, "default" | "secondary"> = {
  member: "secondary",
  admin: "default",
  owner: "default",
};

export const Organizations = zodTable("organizations", {
  name: z.string().min(1).max(FIELDS_CONSTANTS.MAX_LENGTH_SMALL),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  plan: z.string().optional(), // Subscription plan
  status: z.enum(organizationStatuses).optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  deletedAt: z.number().int().positive().optional(),
});

const OrganizationsTable = Organizations.table
  .index("by_name", ["name"])
  .index("by_status", ["status"]);

// =============================================================================
// ORGANIZATION MEMBERS (Junction table for user-org membership)
// =============================================================================

export const OrganizationMembers = zodTable("organizationMembers", {
  userId: z.string().min(1),
  organizationId: zid("organizations"),
  roles: z.array(z.enum(organizationRoles)).min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

const OrganizationMembersTable = OrganizationMembers.table
  .index("by_user", ["userId"])
  .index("by_organization", ["organizationId"])
  .index("by_user_organization", ["userId", "organizationId"]);

// =============================================================================
// ORGANIZATION INVITATIONS (Email-based invites)
// =============================================================================

export const invitationStatuses = ["pending", "accepted", "revoked", "expired"] as const;
export type InvitationStatus = (typeof invitationStatuses)[number];

export const OrganizationInvitations = zodTable("organizationInvitations", {
  email: z.string().email(),
  organizationId: zid("organizations"),
  roles: z.array(z.enum(organizationRoles)).min(1),
  token: z.string().min(32),
  status: z.enum(invitationStatuses),
  invitedBy: z.string().min(1),
  expiresAt: z.number().int().positive(),
  acceptedAt: z.number().int().positive().optional(),
  acceptedBy: z.string().optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

const OrganizationInvitationsTable = OrganizationInvitations.table
  .index("by_token", ["token"])
  .index("by_email", ["email"])
  .index("by_organization", ["organizationId"])
  .index("by_email_organization", ["email", "organizationId"])
  .index("by_status", ["status"]);

// =============================================================================
// ADMINS (System-level admins, separate from org owners)
// =============================================================================

export const Admins = zodTable("admins", {
  userId: z.string().min(1),
  createdAt: z.number().int().positive(),
});

const AdminsTable = Admins.table.index("by_user", ["userId"]);

// =============================================================================
// API KEYS
// =============================================================================

export const ApiKeys = zodTable("apiKeys", {
  organizationId: zid("organizations"),
  userId: z.string(),
  name: z.string(),
  keyPrefix: z.string(),
  hashedKey: z.string(),
  lastUsed: z.number().optional(),
  usageCount: z.number(),
  isActive: z.boolean(),
  createdAt: z.number(),
});

const ApiKeysTable = ApiKeys.table
  .index("by_user", ["userId"])
  .index("by_keyPrefix", ["keyPrefix"]);

// =============================================================================
// USAGE & ANALYTICS
// =============================================================================

export const UsageEvents = zodTable("usageEvents", {
  organizationId: zid("organizations"),
  apiKeyId: zid("apiKeys").optional(),
  userId: z.string(),
  eventType: z.string(),
  metadata: z.any().optional(),
  timestamp: z.number(),
});

const UsageEventsTable = UsageEvents.table
  .index("by_user", ["userId"])
  .index("by_timestamp", ["timestamp"])
  .index("by_eventType", ["eventType"]);

export const DailyUsage = zodTable("dailyUsage", {
  organizationId: zid("organizations"),
  date: z.string(),
  apiCalls: z.number(),
  featuresUsed: z.number(),
  totalEvents: z.number(),
});

const DailyUsageTable = DailyUsage.table
  .index("by_date", ["date"])
  .index("by_org_date", ["organizationId", "date"]);

export const OrganizationUsage = zodTable("organizationUsage", {
  organizationId: zid("organizations"),
  month: z.string(),
  apiCalls: z.number(),
  lastUpdated: z.number(),
});

const OrganizationUsageTable = OrganizationUsage.table
  .index("by_month", ["month"])
  .index("by_org_month", ["organizationId", "month"]);

// =============================================================================
// AUDIT & API LOGS
// =============================================================================

export const AuditLogs = zodTable("auditLogs", {
  organizationId: zid("organizations"),
  userId: z.string(),
  action: z.string(),
  resource: z.string().optional(),
  metadata: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.number(),
});

const AuditLogsTable = AuditLogs.table
  .index("by_user", ["userId"])
  .index("by_action", ["action"])
  .index("by_timestamp", ["timestamp"])
  .index("by_org_timestamp", ["organizationId", "timestamp"]);

export const ApiLogs = zodTable("apiLogs", {
  organizationId: zid("organizations"),
  endpoint: z.string(),
  method: z.string(),
  statusCode: z.number(),
  responseTime: z.number().optional(),
  timestamp: z.number(),
});

const ApiLogsTable = ApiLogs.table.index("by_timestamp", ["timestamp"]);

// =============================================================================
// SUBSCRIPTIONS
// =============================================================================

export const Subscriptions = zodTable("subscriptions", {
  organizationId: z.string(),
  plan: z.string(),
  status: z.string(),
  currentPeriodEnd: z.number().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const SubscriptionsTable = Subscriptions.table
  .index("by_organization", ["organizationId"])
  .index("by_status", ["status"]);

// =============================================================================
// FILES
// =============================================================================

export const fileCategories = [
  "profile_image",
  "kyc_document",
  "proof_of_address",
  "proof_of_identity",
  "general",
  "other",
] as const;
export type FileCategory = (typeof fileCategories)[number];

export const Files = zodTable("files", {
  userId: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  storageId: zid("_storage"),
  organizationId: nullableOrganizationId,
  category: z.enum(fileCategories).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  uploadedAt: z.number(),
  expiresAt: z.number().optional(),
  isPublic: z.boolean().optional(),
});

const FilesTable = Files.table
  .index("by_userId", ["userId"])
  .index("by_userId_and_category", ["userId", "category"])
  .index("by_storageId", ["storageId"])
  .index("by_category", ["category"]);

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export const notificationTypes = [
  "info",
  "success",
  "warning",
  "error",
  "kyc_update",
  "admin_message",
] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const Notifications = zodTable("notifications", {
  userId: z.string(),
  organizationId: nullableOrganizationId,
  title: z.string(),
  message: z.string(),
  type: z.enum(notificationTypes),
  read: z.boolean(),
  readAt: z.number().optional(),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
  createdAt: z.number(),
  expiresAt: z.number().optional(),
});

const NotificationsTable = Notifications.table
  .index("by_userId", ["userId"])
  .index("by_userId_and_read", ["userId", "read"])
  .index("by_createdAt", ["createdAt"]);

export const NotificationPreferences = zodTable("notificationPreferences", {
  userId: z.string(),
  organizationId: nullableOrganizationId,
  emailNotifications: z.boolean(),
  emailKYCUpdates: z.boolean(),
  emailAdminMessages: z.boolean(),
  inAppNotifications: z.boolean(),
  inAppKYCUpdates: z.boolean(),
  inAppAdminMessages: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const NotificationPreferencesTable = NotificationPreferences.table.index("by_userId", ["userId"]);

// =============================================================================
// AGENT SCHEMA DEFINITIONS
// =============================================================================

const dataSchemaFieldSchema = z.object({
  name: z.string(),
  type: z.enum(["text", "number", "boolean", "select", "date"]),
  label: z.string(),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
});

const scoringConfigSchema = z.object({
  passingScore: z.number(),
  fieldWeights: z.any(),
});

const workflowStepSchema = z.object({
  step: z.enum(["collect_data", "score", "schedule_action", "send_notification"]),
  config: z.any(),
});

export const dataSchemaSchema = z.object({
  fields: z.array(dataSchemaFieldSchema),
  scoringConfig: scoringConfigSchema.optional(),
  workflowSteps: z.array(workflowStepSchema),
});

export const agentConfigSchema = z.object({
  sttProvider: z.string(),
  llmModel: z.string(),
  ttsVoice: z.string(),
  personality: z.string(),
  greeting: z.string(),
  objective: z.string(),
});

export const integrationsSchema = z
  .object({
    calendar: z
      .object({
        provider: z.enum(["simple", "calcom"]),
        settings: z.any(),
      })
      .optional(),
    crm: z
      .object({
        provider: z.enum(["hubspot", "salesforce"]),
        settings: z.any(),
      })
      .optional(),
  })
  .optional();

// =============================================================================
// AGENTS (Unified AI Agents - supports chat and voice)
// =============================================================================

export const agentTypes = ["chat", "voice"] as const;
export type AgentType = (typeof agentTypes)[number];

export const sttProviders = [
  "deepgram",
  "assemblyai",
  "openai",
  "speechmatics",
  "gladia",
  "soniox",
] as const;
export type SttProvider = (typeof sttProviders)[number];

export const llmProviders = ["openai", "anthropic", "google", "groq"] as const;
export type LlmProvider = (typeof llmProviders)[number];

export const ttsProviders = ["openai", "elevenlabs", "cartesia", "deepgram", "inworld"] as const;
export type TtsProvider = (typeof ttsProviders)[number];

export const turnDetectionModes = ["stt", "vad", "multilingual"] as const;
export type TurnDetectionMode = (typeof turnDetectionModes)[number];

export const Agents = zodTable("agents", {
  // Common fields
  userId: z.string(),
  organizationId: nullableOrganizationId.optional(),
  type: z.enum(agentTypes).optional(), // defaults to "chat"
  name: z.string(),
  description: z.string().optional(),
  isActive: z.boolean().optional(), // defaults to true

  // Chat-specific fields
  templateId: zid("agentTemplates").optional(),
  folderId: zid("agentFolders").optional(),
  order: z.number().optional(),
  dataSchema: dataSchemaSchema.optional(),
  config: agentConfigSchema.optional(),
  integrations: integrationsSchema.optional(),

  // Voice-specific fields
  instructions: z.string().optional(),
  greetingMessage: z.string().optional(),
  sttProvider: z.enum(sttProviders).optional(),
  sttModel: z.string().optional(),
  sttLanguage: z.string().optional(),
  llmProvider: z.enum(llmProviders).optional(),
  llmModel: z.string().optional(),
  llmTemperature: z.number().optional(),
  llmMaxTokens: z.number().optional(),
  ttsProvider: z.enum(ttsProviders).optional(),
  ttsVoice: z.string().optional(),
  ttsModel: z.string().optional(),
  ttsSpeakingRate: z.number().optional(),
  vadEnabled: z.boolean().optional(),
  vadProvider: z.string().optional(),
  allowInterruptions: z.boolean().optional(),
  minInterruptionDuration: z.number().optional(),
  minEndpointingDelay: z.number().optional(),
  maxEndpointingDelay: z.number().optional(),
  turnDetection: z.enum(turnDetectionModes).optional(),
  preemptiveGeneration: z.boolean().optional(),
  transcriptionEnabled: z.boolean().optional(),
  maxToolSteps: z.number().optional(),

  // Timestamps
  createdAt: z.number().optional(),
  updatedAt: z.number(),
});

const AgentsTable = Agents.table
  .index("by_userId", ["userId"])
  .index("by_type", ["type"])
  .index("by_isActive", ["isActive"])
  .index("by_userId_and_type", ["userId", "type"])
  .index("by_userId_and_isActive", ["userId", "isActive"])
  .index("folderId", ["folderId"]);

// =============================================================================
// AGENT FOLDERS
// =============================================================================

export const AgentFolders = zodTable("agentFolders", {
  userId: z.string(),
  organizationId: z.union([z.string(), z.null()]).optional(),
  parentId: zid("agentFolders").optional(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  order: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const AgentFoldersTable = AgentFolders.table
  .index("by_userId", ["userId"])
  .index("by_parentId", ["parentId"])
  .index("by_userId_and_order", ["userId", "order"]);

// =============================================================================
// AGENT TEMPLATES
// =============================================================================

export const AgentTemplates = zodTable("agentTemplates", {
  userId: z.string().optional(),
  organizationId: nullableOrganizationId,
  name: z.string(),
  description: z.string(),
  category: z.string(),
  dataSchema: dataSchemaSchema,
  baseConfig: agentConfigSchema,
  isPublic: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const AgentTemplatesTable = AgentTemplates.table
  .index("by_userId", ["userId"])
  .index("by_category", ["category"])
  .index("by_isPublic", ["isPublic"]);

// =============================================================================
// AGENT TOOLS
// =============================================================================

export const agentToolTypes = ["api_call", "database_query", "custom"] as const;
export type AgentToolType = (typeof agentToolTypes)[number];

export const AgentTools = zodTable("agentTools", {
  userId: z.string(),
  organizationId: nullableOrganizationId,
  agentId: zid("agents"),
  name: z.string(),
  description: z.string(),
  parameters: z.any(),
  returnType: z.string().optional(),
  type: z.enum(agentToolTypes),
  config: z.any(),
  isActive: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const AgentToolsTable = AgentTools.table
  .index("by_userId", ["userId"])
  .index("by_isActive", ["isActive"]);

// =============================================================================
// AGENT DATA
// =============================================================================

export const agentDataStatuses = ["draft", "complete", "archived"] as const;
export type AgentDataStatus = (typeof agentDataStatuses)[number];

const computedSchema = z.object({
  score: z.number().optional(),
  isQualified: z.boolean().optional(),
  reason: z.string().optional(),
  nextAction: z.string().optional(),
});

export const AgentData = zodTable("agentData", {
  organizationId: nullableOrganizationId,
  agentId: zid("agents"),
  callId: zid("calls").optional(),
  prospectId: zid("prospects").optional(),
  data: z.any(),
  computed: computedSchema.optional(),
  collectedAt: z.number(),
  status: z.enum(agentDataStatuses),
});

const AgentDataTable = AgentData.table.index("by_agentId_status", ["agentId", "status"]);

// =============================================================================
// AGENT ACTIONS
// =============================================================================

export const agentActionStatuses = ["pending", "completed", "failed", "cancelled"] as const;
export type AgentActionStatus = (typeof agentActionStatuses)[number];

export const AgentActions = zodTable("agentActions", {
  organizationId: nullableOrganizationId,
  agentId: zid("agents"),
  dataId: zid("agentData"),
  actionType: z.string(),
  actionConfig: z.any(),
  scheduledFor: z.number().optional(),
  status: z.enum(agentActionStatuses),
  result: z.any().optional(),
  createdAt: z.number(),
  completedAt: z.number().optional(),
});

const AgentActionsTable = AgentActions.table
  .index("by_status", ["status"])
  .index("by_scheduledFor", ["scheduledFor"]);

// =============================================================================
// SCRIPTS
// =============================================================================

export const scriptCategories = ["sales", "support", "survey", "appointment", "general"] as const;
export type ScriptCategory = (typeof scriptCategories)[number];

export const Scripts = zodTable("scripts", {
  userId: z.string(),
  organizationId: nullableOrganizationId,
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(scriptCategories).optional(),
  greetingPrompt: z.string(),
  mainPrompt: z.string(),
  objectionHandling: z.string().optional(),
  closingPrompt: z.string().optional(),
  variables: z.array(z.string()).optional(),
  exampleConversation: z.string().optional(),
  isPublic: z.boolean(),
  usageCount: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const ScriptsTable = Scripts.table
  .index("by_userId", ["userId"])
  .index("by_category", ["category"])
  .index("by_isPublic", ["isPublic"]);

// =============================================================================
// PROSPECTS
// =============================================================================

export const prospectStatuses = [
  "new",
  "contacted",
  "interested",
  "meeting_scheduled",
  "callback_scheduled",
  "not_interested",
  "invalid_contact",
  "do_not_call",
] as const;
export type ProspectStatus = (typeof prospectStatuses)[number];

export const Prospects = zodTable("prospects", {
  userId: z.string(),
  organizationId: nullableOrganizationId,
  campaignId: zid("campaigns").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string(),
  email: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  status: z.enum(prospectStatuses),
  customFields: z.any().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  totalCallAttempts: z.number(),
  lastContactedAt: z.number().optional(),
  lastCallResult: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const ProspectsTable = Prospects.table
  .index("by_userId", ["userId"])
  .index("by_phoneNumber", ["phoneNumber"])
  .index("by_status", ["status"])
  .index("by_userId_and_status", ["userId", "status"]);

// =============================================================================
// CAMPAIGNS
// =============================================================================

export const campaignStatuses = ["draft", "active", "paused", "completed", "archived"] as const;
export type CampaignStatus = (typeof campaignStatuses)[number];

const campaignScheduleSchema = z.object({
  daysOfWeek: z.array(z.number()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().optional(),
});

export const Campaigns = zodTable("campaigns", {
  userId: z.string(),
  organizationId: nullableOrganizationId,
  agentId: zid("agents"),
  scriptId: zid("scripts").optional(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(campaignStatuses),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  schedule: campaignScheduleSchema.optional(),
  totalProspects: z.number(),
  callsCompleted: z.number(),
  callsInProgress: z.number(),
  callsFailed: z.number(),
  meetingsBooked: z.number(),
  callbacksScheduled: z.number(),
  maxConcurrentCalls: z.number().optional(),
  retryFailedCalls: z.boolean().optional(),
  maxRetryAttempts: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const CampaignsTable = Campaigns.table
  .index("by_userId", ["userId"])
  .index("by_status", ["status"])
  .index("by_userId_and_status", ["userId", "status"]);

// =============================================================================
// CALLS
// =============================================================================

export const callDirections = ["outbound", "inbound"] as const;
export type CallDirection = (typeof callDirections)[number];

export const callStatuses = [
  "initiated",
  "ringing",
  "answered",
  "in_progress",
  "voicemail",
  "completed",
  "failed",
  "no_answer",
  "busy",
] as const;
export type CallStatus = (typeof callStatuses)[number];

export const callOutcomes = [
  "meeting_booked",
  "callback_scheduled",
  "interested",
  "not_interested",
  "voicemail_left",
  "wrong_number",
  "other",
] as const;
export type CallOutcome = (typeof callOutcomes)[number];

export const callSentiments = ["positive", "neutral", "negative"] as const;
export type CallSentiment = (typeof callSentiments)[number];

export const Calls = zodTable("calls", {
  userId: z.string(),
  organizationId: nullableOrganizationId,
  campaignId: zid("campaigns").optional(),
  prospectId: zid("prospects"),
  agentId: zid("agents"),
  scriptId: zid("scripts").optional(),
  phoneNumber: z.string(),
  direction: z.enum(callDirections),
  status: z.enum(callStatuses),
  outcome: z.enum(callOutcomes).optional(),
  roomName: z.string().optional(),
  livekitRoomId: z.string().optional(),
  sipParticipantId: z.string().optional(),
  startedAt: z.number().optional(),
  answeredAt: z.number().optional(),
  endedAt: z.number().optional(),
  duration: z.number().optional(),
  recordingUrl: z.string().optional(),
  recordingStorageId: z.string().optional(),
  transcriptStorageId: z.string().optional(),
  fullTranscript: z.string().optional(),
  sentiment: z.enum(callSentiments).optional(),
  keyPoints: z.array(z.string()).optional(),
  actionItems: z.array(z.string()).optional(),
  errorMessage: z.string().optional(),
  sipStatusCode: z.string().optional(),
  metadata: z.any().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const CallsTable = Calls.table
  .index("by_userId", ["userId"])
  .index("by_status", ["status"])
  .index("by_outcome", ["outcome"])
  .index("by_roomName", ["roomName"])
  .index("by_createdAt", ["createdAt"])
  .index("by_userId_and_status", ["userId", "status"]);

// =============================================================================
// CALL TRANSCRIPTS
// =============================================================================

export const transcriptSpeakers = ["user", "agent", "system"] as const;
export type TranscriptSpeaker = (typeof transcriptSpeakers)[number];

export const CallTranscripts = zodTable("callTranscripts", {
  organizationId: nullableOrganizationId,
  callId: zid("calls"),
  speaker: z.enum(transcriptSpeakers),
  message: z.string(),
  timestamp: z.number(),
  confidence: z.number().optional(),
  duration: z.number().optional(),
  isFinal: z.boolean().optional(),
  createdAt: z.number(),
});

const CallTranscriptsTable = CallTranscripts.table.index("by_callId_and_timestamp", [
  "callId",
  "timestamp",
]);

// =============================================================================
// SCHEDULED CALLBACKS
// =============================================================================

export const callbackStatuses = ["pending", "completed", "cancelled", "rescheduled"] as const;
export type CallbackStatus = (typeof callbackStatuses)[number];

export const ScheduledCallbacks = zodTable("scheduledCallbacks", {
  userId: z.string(),
  organizationId: nullableOrganizationId,
  prospectId: zid("prospects"),
  originalCallId: zid("calls").optional(),
  campaignId: zid("campaigns").optional(),
  resultCallId: zid("calls").optional(),
  scheduledTime: z.number(),
  timezone: z.string().optional(),
  status: z.enum(callbackStatuses),
  notes: z.string().optional(),
  reason: z.string().optional(),
  completedAt: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const ScheduledCallbacksTable = ScheduledCallbacks.table
  .index("by_userId", ["userId"])
  .index("by_status", ["status"])
  .index("by_scheduledTime", ["scheduledTime"])
  .index("by_userId_and_status", ["userId", "status"]);

// =============================================================================
// SDR COPILOT TABLES
// =============================================================================

// Vehicle Knowledge Base for SDR insights
export const insightCategories = [
  "best_sellers",
  "mileage_tips",
  "parts_info",
  "objection_handlers",
  "pricing_tips",
] as const;
export type InsightCategory = (typeof insightCategories)[number];

export const insightStatuses = ["draft", "pending_review", "approved", "rejected"] as const;
export type InsightStatus = (typeof insightStatuses)[number];

export const priceRanges = ["budget", "mid", "premium"] as const;
export type PriceRange = (typeof priceRanges)[number];

export const VehicleInsights = zodTable("vehicleInsights", {
  organizationId: nullableOrganizationId,
  category: z.enum(insightCategories),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  vehicleTypes: z.array(z.string()).optional(), // ["SUV", "Sedan", "Truck"]
  priceRange: z.enum(priceRanges).optional(),
  // Approval workflow
  status: z.enum(insightStatuses),
  submittedBy: z.string(), // User ID who created
  reviewedBy: z.string().optional(), // Admin who approved/rejected
  reviewedAt: z.number().optional(),
  rejectionReason: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const VehicleInsightsTable = VehicleInsights.table
  .index("by_category", ["category"])
  .index("by_status", ["status"])
  .index("by_isActive", ["isActive"])
  .index("by_submittedBy", ["submittedBy"])
  .index("by_category_isActive", ["category", "isActive"])
  .index("by_isActive_status", ["isActive", "status"]);

// SDR Call Prep Notes (saved briefs)
export const callPhases = ["opening", "discovery", "presentation", "objection", "closing"] as const;
export type CallPhase = (typeof callPhases)[number];

export const SdrCallPreps = zodTable("sdrCallPreps", {
  organizationId: nullableOrganizationId,
  prospectId: zid("prospects"),
  userId: z.string(),
  briefSummary: z.string(),
  talkingPoints: z.array(z.string()),
  suggestedArguments: z.array(z.string()),
  vehicleInterests: z.array(z.string()).optional(),
  // Script state tracking
  scriptId: zid("scripts").optional(),
  currentPhase: z.enum(callPhases).optional(),
  completedPhases: z.array(z.string()).optional(),
  detectedObjections: z.array(z.string()).optional(),
  extractedInfo: z.any().optional(), // { vehicleType, budget, tradeIn, etc. }
  createdAt: z.number(),
  updatedAt: z.number(),
});

const SdrCallPrepsTable = SdrCallPreps.table
  .index("by_prospectId", ["prospectId"])
  .index("by_userId", ["userId"])
  .index("by_userId_prospectId", ["userId", "prospectId"]);

// SDR Insight Usage tracking (which insights drive success)
export const insightOutcomes = ["success", "neutral", "failed"] as const;
export type InsightOutcome = (typeof insightOutcomes)[number];

export const SdrInsightUsage = zodTable("sdrInsightUsage", {
  organizationId: nullableOrganizationId,
  insightId: zid("vehicleInsights"),
  callId: zid("calls").optional(),
  userId: z.string(),
  usedAt: z.number(),
  outcome: z.enum(insightOutcomes).optional(),
  notes: z.string().optional(),
});

const SdrInsightUsageTable = SdrInsightUsage.table
  .index("by_insightId", ["insightId"])
  .index("by_callId", ["callId"])
  .index("by_userId", ["userId"]);

// Sales Techniques Knowledge Base
export const SalesTechniques = zodTable("salesTechniques", {
  organizationId: nullableOrganizationId,
  name: z.string(),
  category: z.enum(callPhases),
  description: z.string(),
  instructions: z.array(z.string()), // Step-by-step guide
  psychologicalBasis: z.string(), // Why it works
  examplePhrases: z.array(z.string()), // Context-specific examples
  effectivenessRating: z.number(), // 1-10 scale
  tags: z.array(z.string()).optional(), // Keywords for matching
  isActive: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const SalesTechniquesTable = SalesTechniques.table
  .index("by_category", ["category"])
  .index("by_isActive", ["isActive"])
  .index("by_category_active", ["category", "isActive"]);

// AI Generated Call Scripts
export const generatedByOptions = ["ollama", "openai", "manual"] as const;
export type GeneratedBy = (typeof generatedByOptions)[number];

export const effectivenessOptions = ["effective", "neutral", "ineffective"] as const;
export type Effectiveness = (typeof effectivenessOptions)[number];

export const AiGeneratedScripts = zodTable("aiGeneratedScripts", {
  organizationId: nullableOrganizationId,
  prospectId: zid("prospects"),
  userId: z.string(),
  // Structured script phases
  opening: z.string(),
  discovery: z.string(),
  presentation: z.string(),
  objectionHandling: z.string(),
  closing: z.string(),
  // Context used for generation
  prospectContext: z.any().optional(), // Prospect data snapshot
  previousCallsContext: z.any().optional(), // Previous call outcomes
  vehicleInterests: z.array(z.string()).optional(),
  // Metadata
  generatedBy: z.enum(generatedByOptions),
  modelUsed: z.string().optional(), // e.g., "qwen3:8b"
  generationTime: z.number().optional(), // ms taken to generate
  wasUsed: z.boolean().optional(), // Track if SDR actually used it
  effectiveness: z.enum(effectivenessOptions).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const AiGeneratedScriptsTable = AiGeneratedScripts.table
  .index("by_prospectId", ["prospectId"])
  .index("by_userId", ["userId"])
  .index("by_prospectId_userId", ["prospectId", "userId"])
  .index("by_createdAt", ["createdAt"]);

// SDR Live Suggestions (real-time call suggestions)
export const suggestionTypes = [
  "objection_handler",
  "talking_point",
  "phase_guidance",
  "info_extract",
] as const;
export type SuggestionType = (typeof suggestionTypes)[number];

export const suggestionStatuses = ["pending", "used", "dismissed"] as const;
export type SuggestionStatus = (typeof suggestionStatuses)[number];

export const SdrLiveSuggestions = zodTable("sdrLiveSuggestions", {
  organizationId: nullableOrganizationId,
  callId: zid("calls"),
  prepId: zid("sdrCallPreps").optional(),
  insightId: zid("vehicleInsights").optional(),
  suggestionType: z.enum(suggestionTypes),
  title: z.string(),
  content: z.string(),
  priority: z.number(), // 1-10, higher = more urgent
  triggerPhase: z.enum(callPhases).optional(),
  objectionType: z.string().optional(),
  status: z.enum(suggestionStatuses),
  wasHelpful: z.boolean().optional(),
  usedAt: z.number().optional(),
  createdAt: z.number(),
});

const SdrLiveSuggestionsTable = SdrLiveSuggestions.table
  .index("by_callId", ["callId"])
  .index("by_callId_status", ["callId", "status"])
  .index("by_prepId", ["prepId"]);

// =============================================================================
// SCHEMA EXPORT
// =============================================================================

export default defineSchema({
  // Starter template tables
  todos: TodosTable,
  organizations: OrganizationsTable,
  organizationMembers: OrganizationMembersTable,
  organizationInvitations: OrganizationInvitationsTable,
  admins: AdminsTable,

  // API & Usage tables
  apiKeys: ApiKeysTable,
  usageEvents: UsageEventsTable,
  dailyUsage: DailyUsageTable,
  organizationUsage: OrganizationUsageTable,
  auditLogs: AuditLogsTable,
  apiLogs: ApiLogsTable,
  subscriptions: SubscriptionsTable,

  // Files & Notifications
  files: FilesTable,
  notifications: NotificationsTable,
  notificationPreferences: NotificationPreferencesTable,

  // Agents & Tools
  agents: AgentsTable,
  agentFolders: AgentFoldersTable,
  agentTemplates: AgentTemplatesTable,
  agentTools: AgentToolsTable,
  agentData: AgentDataTable,
  agentActions: AgentActionsTable,

  // Scripts & Prospects
  scripts: ScriptsTable,
  prospects: ProspectsTable,
  campaigns: CampaignsTable,

  // Calls
  calls: CallsTable,
  callTranscripts: CallTranscriptsTable,
  scheduledCallbacks: ScheduledCallbacksTable,

  // SDR Copilot
  vehicleInsights: VehicleInsightsTable,
  sdrCallPreps: SdrCallPrepsTable,
  sdrInsightUsage: SdrInsightUsageTable,
  salesTechniques: SalesTechniquesTable,
  aiGeneratedScripts: AiGeneratedScriptsTable,
  sdrLiveSuggestions: SdrLiveSuggestionsTable,
});
