import { pgTable, uuid, varchar, text, integer, decimal, timestamp, jsonb, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // QQCatalyst identifiers
  qq_contact_id: varchar("qq_contact_id", { length: 255 }).notNull().unique(),
  customer_id: varchar("customer_id", { length: 255 }),
  entity_id: varchar("entity_id", { length: 255 }),
  
  // Contact information
  contact_name: varchar("contact_name", { length: 500 }),
  first_name: varchar("first_name", { length: 255 }),
  last_name: varchar("last_name", { length: 255 }),
  name: varchar("name", { length: 500 }),
  business_name: varchar("business_name", { length: 500 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  
  // Address information
  address: text("address"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 50 }),
  zip: varchar("zip", { length: 20 }),
  zip_code: varchar("zip_code", { length: 20 }),
  
  // Policy aggregation data
  policy_count: integer("policy_count").default(0),
  total_premium: decimal("total_premium", { precision: 12, scale: 2 }).default("0"),
  renewal_date: timestamp("renewal_date"),
  
  // Status and metadata
  status: varchar("status", { length: 50 }).default("active"),
  json_raw: jsonb("json_raw"),
  
  // Timestamps
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const renewals = pgTable("renewals", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // QQCatalyst identifiers
  qq_policy_id: varchar("qq_policy_id", { length: 255 }).unique(),
  policy_number: varchar("policy_number", { length: 255 }),
  
  // Named insured and contact info
  named_insured: varchar("named_insured", { length: 500 }),
  contact_id: integer("contact_id"),
  
  // Policy details
  policy_type: varchar("policy_type", { length: 255 }),
  lob: varchar("lob", { length: 255 }),
  effective_date: timestamp("effective_date"),
  expiration_date: timestamp("expiration_date"),
  renewal_date: timestamp("renewal_date"),
  
  // Financial information
  premium: decimal("premium", { precision: 12, scale: 2 }),
  total_premium: decimal("total_premium", { precision: 12, scale: 2 }),
  
  // Carrier and agent info
  insurance_company: varchar("insurance_company", { length: 500 }),
  carrier: varchar("carrier", { length: 500 }),
  agent_name: varchar("agent_name", { length: 255 }),
  mga: varchar("mga", { length: 255 }),
  
  // Status and tracking
  status: varchar("status", { length: 50 }).default("pending"),
  archived: boolean("archived").default(false),
  
  // Additional data
  description: text("description"),
  notes: text("notes"),
  json_raw: jsonb("json_raw"),
  
  // Timestamps
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  tracking_number: varchar("tracking_number", { length: 255 }).unique(),
  
  // Client information
  client_name: varchar("client_name", { length: 500 }),
  client_id: integer("client_id"),
  contact_email: varchar("contact_email", { length: 255 }),
  contact_phone: varchar("contact_phone", { length: 50 }),
  
  // Application details
  policy_type: varchar("policy_type", { length: 255 }),
  effective_date: timestamp("effective_date"),
  expiration_date: timestamp("expiration_date"),
  
  // Financial
  requested_premium: decimal("requested_premium", { precision: 12, scale: 2 }),
  quoted_premium: decimal("quoted_premium", { precision: 12, scale: 2 }),
  premium_amount: varchar("premium_amount", { length: 255 }),
  
  // Status tracking
  status: varchar("status", { length: 50 }).default("pending"),
  priority: varchar("priority", { length: 20 }).default("normal"),
  
  // Agent and carrier
  assigned_agent: varchar("assigned_agent", { length: 255 }),
  carrier: varchar("carrier", { length: 500 }),
  
  // Received tracking
  date_received: varchar("date_received", { length: 50 }),
  time_received: varchar("time_received", { length: 50 }),
  
  // Additional information
  description: text("description"),
  notes: text("notes"),
  json_raw: jsonb("json_raw"),
  
  // Timestamps
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const inspections = pgTable("inspections", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  tracking_number: varchar("tracking_number", { length: 255 }).unique().notNull(),
  
  // Client and property information
  client_name: varchar("client_name", { length: 500 }),
  client_id: integer("client_id"),
  property_address: text("property_address"),
  
  // Inspection details
  inspection_type: varchar("inspection_type", { length: 255 }),
  scheduled_date: timestamp("scheduled_date"),
  completed_date: timestamp("completed_date"),
  
  // Inspector information
  inspector_name: varchar("inspector_name", { length: 255 }),
  inspector_company: varchar("inspector_company", { length: 500 }),
  
  // Status and results
  status: varchar("status", { length: 50 }).default("scheduled"),
  result: varchar("result", { length: 50 }),
  
  // Additional information
  notes: text("notes"),
  findings: text("findings"),
  json_raw: jsonb("json_raw"),
  
  // Timestamps
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const document_requests = pgTable("document_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  tracking_number: varchar("tracking_number", { length: 255 }).unique().notNull(),
  
  // Client information
  client_name: varchar("client_name", { length: 500 }),
  client_id: integer("client_id"),
  client_email: varchar("client_email", { length: 255 }),
  
  // Agent information
  agent_name: varchar("agent_name", { length: 255 }),
  agent_email: varchar("agent_email", { length: 255 }),
  
  // Request details
  document_type: varchar("document_type", { length: 255 }),
  description: text("description"),
  
  // Dates and deadlines
  requested_date: timestamp("requested_date").defaultNow(),
  due_date: timestamp("due_date"),
  received_date: timestamp("received_date"),
  
  // Status tracking
  status: varchar("status", { length: 50 }).default("pending"),
  priority: varchar("priority", { length: 20 }).default("normal"),
  
  // Additional information
  notes: text("notes"),
  json_raw: jsonb("json_raw"),
  
  // Timestamps
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const market_submissions = pgTable("market_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  tracking_number: varchar("tracking_number", { length: 255 }).unique(),
  
  // Link to original submission
  submission_id: uuid("submission_id"),
  submission_tracking: varchar("submission_tracking", { length: 255 }),
  
  // Client information
  client_name: varchar("client_name", { length: 500 }),
  policy_type: varchar("policy_type", { length: 255 }),
  
  // Market/Carrier information
  market_name: varchar("market_name", { length: 500 }),
  carrier_name: varchar("carrier_name", { length: 500 }),
  
  // Wholesaler information
  wholesaler_name: varchar("wholesaler_name", { length: 500 }),
  wholesaler_company: varchar("wholesaler_company", { length: 500 }),
  wholesaler_email: varchar("wholesaler_email", { length: 255 }),
  wholesaler_phone: varchar("wholesaler_phone", { length: 50 }),
  
  // Submission tracking
  submission_date: timestamp("submission_date"),
  response_date: timestamp("response_date"),
  
  // Quote information
  quote_status: varchar("quote_status", { length: 50 }).default("pending"), // pending, quoted, declined, bound, expired
  quote_amount: decimal("quote_amount", { precision: 12, scale: 2 }),
  premium_quoted: varchar("premium_quoted", { length: 255 }),
  
  // Additional details
  coverage_details: text("coverage_details"),
  notes: text("notes"),
  decline_reason: text("decline_reason"),
  
  // Status and priority
  status: varchar("status", { length: 50 }).default("active"),
  priority: varchar("priority", { length: 20 }).default("normal"),
  
  // Additional data
  json_raw: jsonb("json_raw"),
  
  // Timestamps
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const renewal_workflows = pgTable("renewal_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),

  renewal_id: uuid("renewal_id").notNull(),
  policy_number: varchar("policy_number", { length: 255 }),
  named_insured: varchar("named_insured", { length: 500 }),
  policy_type: varchar("policy_type", { length: 255 }),
  expiration_date: timestamp("expiration_date").notNull(),

  // Contact
  client_email: varchar("client_email", { length: 255 }),
  client_phone: varchar("client_phone", { length: 50 }),
  agent_name: varchar("agent_name", { length: 255 }),
  agent_email: varchar("agent_email", { length: 255 }),

  // Phase tracking: planning | execution | finalization | complete
  current_phase: varchar("current_phase", { length: 50 }).default("planning"),

  // Internal notes
  strategy_notes: text("strategy_notes"),
  market_notes: text("market_notes"),
  binding_notes: text("binding_notes"),

  // Financial tracking
  expiring_premium: decimal("expiring_premium", { precision: 12, scale: 2 }),
  quoted_premium: decimal("quoted_premium", { precision: 12, scale: 2 }),
  bound_premium: decimal("bound_premium", { precision: 12, scale: 2 }),

  // Status
  status: varchar("status", { length: 50 }).default("active"), // active | bound | lost | cancelled

  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const renewal_workflow_tasks = pgTable("renewal_workflow_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),

  workflow_id: uuid("workflow_id").notNull(),
  phase: varchar("phase", { length: 50 }).notNull(), // planning | execution | finalization | post_renewal
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),

  // Status
  status: varchar("status", { length: 50 }).default("pending"), // pending | in_progress | completed | skipped

  // Assignment
  assigned_to: varchar("assigned_to", { length: 255 }),
  assigned_role: varchar("assigned_role", { length: 50 }), // agent | account_manager | csr

  due_date: timestamp("due_date"),
  completed_at: timestamp("completed_at"),
  completed_by: varchar("completed_by", { length: 255 }),

  sort_order: integer("sort_order").default(0),
  is_default: boolean("is_default").default(true), // part of standard workflow vs custom

  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const renewal_workflow_notifications = pgTable("renewal_workflow_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),

  workflow_id: uuid("workflow_id").notNull(),

  // Type of notification
  notification_type: varchar("notification_type", { length: 100 }).notNull(),
  // kickoff_120 | phase2_90 | quotes_ready | proposal_30 | bound_confirmation | post_renewal_debrief

  recipient_email: varchar("recipient_email", { length: 255 }).notNull(),
  recipient_name: varchar("recipient_name", { length: 500 }),
  recipient_type: varchar("recipient_type", { length: 50 }), // client | agent | csr

  subject: varchar("subject", { length: 500 }),
  body_preview: text("body_preview"),

  status: varchar("status", { length: 50 }).default("sent"), // sent | failed
  resend_id: varchar("resend_id", { length: 255 }),
  error_message: text("error_message"),

  sent_at: timestamp("sent_at").defaultNow().notNull(),
})

export const policies = pgTable("policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // QQCatalyst identifiers
  qq_policy_id: varchar("qq_policy_id", { length: 255 }).unique(),
  policy_number: varchar("policy_number", { length: 255 }),
  
  // Client reference
  client_id: integer("client_id"),
  customer_id: varchar("customer_id", { length: 255 }),
  named_insured: varchar("named_insured", { length: 500 }),
  
  // Policy details
  policy_type: varchar("policy_type", { length: 255 }),
  lob: varchar("lob", { length: 255 }),
  effective_date: timestamp("effective_date"),
  expiration_date: timestamp("expiration_date"),
  
  // Financial information
  premium: decimal("premium", { precision: 12, scale: 2 }),
  total_premium: decimal("total_premium", { precision: 12, scale: 2 }),
  
  // Carrier and agent info
  insurance_company: varchar("insurance_company", { length: 500 }),
  carrier: varchar("carrier", { length: 500 }),
  writing_carrier: varchar("writing_carrier", { length: 500 }),
  agent_name: varchar("agent_name", { length: 255 }),
  mga: varchar("mga", { length: 255 }),
  
  // Status
  status: varchar("status", { length: 50 }).default("active"),
  
  // Additional data
  description: text("description"),
  json_raw: jsonb("json_raw"),
  
  // Timestamps
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})
