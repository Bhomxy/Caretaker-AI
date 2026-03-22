# Caretaker AI — Property Manager Dashboard
## Product Requirements Document (Frontend)
### Version 3.0

---

## 1. What This Is

The Caretaker AI Property Manager Dashboard is a **React-only web application** for Nigerian property managers and landlords. It is the visual command centre where a manager monitors their portfolio, acts on AI-generated events, and manages their properties, tenants, complaints, vendors, and payments — all from one place.

This document covers the **frontend only.** The AI engine, WhatsApp integration, invoice automation, and backend logic are built by a separate developer. This dashboard reads data that the AI writes and writes data the manager creates.

---

## 2. Core Design Principle

> The AI does the work. The manager makes the calls.

The dashboard should always make it obvious what needs the manager's attention right now. Everything else is a log they can browse when they want to.

---

## 3. Who Uses It

**The Property Manager / Landlord**
- Manages 1–20 rental units in Nigeria
- Based primarily in Lagos
- Comfortable with WhatsApp but not necessarily tech-savvy
- Needs to see everything in one place without being overwhelmed

---

## 4. Technical Stack (Frontend Only)

| Layer | Technology |
|---|---|
| Framework | React 18 with Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Data | Supabase JS client (direct from React — no Express backend) |
| Auth | Supabase Auth |
| HTTP | Axios (for any third-party calls only) |
| Icons | Lucide React |
| Font | Outfit (Google Fonts) |
| PDF Viewing | react-pdf (view receipts and invoices the AI generated) |

**Important:** There is no Express server in this project. All data operations go through the Supabase JS client directly from React. The AI developer manages the backend separately.

---

## 5. Database Tables (Read/Write Reference)

The frontend interacts with these Supabase tables. Schemas are defined by the shared data contract agreed with the AI developer.

| Table | Frontend Role |
|---|---|
| `properties` | Read + Write (manager creates properties) |
| `tenants` | Read + Write (manager adds tenants) |
| `complaints` | Read + Partial Write (manager assigns vendor, updates status) |
| `invoices` | Read + Partial Write (manager approves payment) |
| `payments` | Read only (AI creates payment records) |
| `vendors` | Read + Write (manager adds vendors) |
| `broadcast_messages` | Write (manager sends broadcasts) |

**Always scope every Supabase query to the authenticated manager's ID.**

---

## 6. App Shell

### Layout
Persistent two-panel layout across all pages:

**Left Sidebar (244px, dark green `#0D3D36`)**
- Logo at top
- Portfolio switcher showing portfolio name and total unit count
- Navigation menu (see Section 7)
- User profile at bottom: avatar, name, role

**Main Area (fills remaining width)**
- Topbar (56px): page title, global search `⌘K`, notification bell, inbox shortcut, user avatar
- Content area: active page, scrollable, padding `22px 24px`

### Global Elements
- **Toast notifications** — bottom-right, dark green, 2.8s auto-dismiss, never use `alert()`
- **Floating action button** — bottom-right `+` for quick actions: Add Property, Add Tenant, Add Vendor
- **Loading skeletons** — every data-fetching view shows a skeleton, never a blank screen
- **Empty states** — every empty list shows an icon, title, and subtitle

---

## 7. Navigation

**Main**
- Dashboard
- Properties
- Tenants
- Complaints ← red badge with count of open complaints
- Payments ← amber badge if approvals are pending

**Communication**
- Inbox
- Broadcast

**Operations**
- Vendors
- AI Insights

**Account**
- Settings

Active nav item: gold left border + lighter background. Hover: subtle white tint.

---

## 8. Pages

---

### 8.1 Dashboard

**Purpose:** Real-time portfolio overview. The manager should know the state of their entire business in 10 seconds.

**Metric Cards (4 across, each clickable)**
- Total Units → navigates to Properties
- Active Tenants → navigates to Tenants
- Open Complaints → navigates to Complaints; turns red if over 5
- Charges Collected YTD → navigates to Payments

**Action Queue**
The most important section. Sits just below metric cards. Shows only what needs the manager's attention right now:
- "X payments awaiting your approval" → Payments › Approvals tab
- "X complaints unassigned for 48+ hours" → Complaints
- "X leases expiring within 60 days" → Tenants

If nothing is pending: green "You're all caught up" state.

**Service Charge Collection Chart**
- Bar chart of monthly collections (Jan–Dec)
- Toggle: Monthly / Quarterly
- Summary row: Collected / Outstanding / Overdue

**Occupancy Widget (right column)**
- Donut chart: occupied vs vacant
- Per-property progress bar with occupancy percentage

**Recent Complaints (last 4)**
- Columns: ID, Tenant, Type, Property, Status, Age
- Each row clickable → Complaint Detail
- "View all →" link

**Live Activity Feed (right column)**
- Stream of recent events: WhatsApp messages, AI actions, payments, reminders
- Every item is clickable → navigates to the relevant record
- "● Live" label

**Page Actions:** Export button, Add Property button

---

### 8.2 Properties

**Purpose:** Browse and manage all properties.

**Filters:** Text search (name/location), Type dropdown (All / Residential / Mixed-Use / Commercial)

**Property Cards (3-column grid)**
Each card: colour accent bar, name, location, type badge, stats (units occupied, revenue, open complaints, manager), occupancy bar. Clicking → Property Detail subview.

**Add Property Modal**
Fields: Property Name*, Property Type, Location*, Number of Units*, Assigned Manager, Expected Monthly Revenue (₦)

**Property Detail Subview**
- Header: name, location, type badge, manager, accent colour
- Stats row: Total / Occupied / Vacant / Open complaints
- Tabs:
  - **Units** — grid of unit cards: unit number, tenant name if occupied, rent; teal = occupied, grey = vacant
  - **Tenants** — table of tenants in this property; rows → tenant detail
  - **Complaints** — open complaints for this property; rows → complaint detail
  - **Leases** — all leases with expiry dates and colour-coded status

---

### 8.3 Tenants

**Purpose:** Manage all tenants across the portfolio.

**Filters:** Search (name/unit), Property dropdown, Status dropdown (All / Paid / Pending / Overdue)

**Tenant Table**
Columns: Tenant (name + since date), Unit, Property, Service Charge, Status, Complaints, Phone, View.
- Status badge: Paid green / Pending grey / Overdue red
- Complaints count red if over 3
- Rows clickable → Tenant Detail

**Bulk Actions:** checkbox per row → "Send Broadcast" or "Export Selected"

**Page Actions:** Broadcast button, Add Tenant button

**Add Tenant Modal**
Fields: Full Name*, Phone* (+234 format), Property dropdown, Unit*, Annual Service Charge (₦), Caution Deposit (₦), Lease Start Date, Lease Expiry Date, Payment Status

**Tenant Detail Subview**
- Profile hero: avatar, name, unit, property, lease dates, status badge
- Info grid: Unit, Property, Charge, Deposit, Lease Expiry, Phone, Status, Complaints
- AI Summary: tenant risk level, payment behaviour, last AI interaction
- Complaint History: rows → complaint detail
- Payment History: all invoices and payments for this tenant
- "Open WhatsApp Thread" button → navigates to Inbox thread

---

### 8.4 Complaints

**Purpose:** Triage and resolve maintenance issues. The manager CANNOT create complaints — all complaints are created automatically by the AI when tenants message on WhatsApp.

**Filters:** Search (tenant/ID), Property dropdown, Status dropdown, Priority dropdown

**Summary Cards:** Total / Open / In Progress / Resolved counts

**Complaints Table**
Columns: ID (monospace teal), Tenant, Type, Property, Unit, Priority, Status, Age, Vendor.
- Rows clickable → Complaint Detail

**Bulk Actions:** Select multiple → bulk assign vendor, bulk mark resolved

**Complaint Detail Subview**
- Header: ID, priority badge, status badge, type, property, unit, tenant, date, age
- Action buttons: Mark In Progress / Mark Resolved / Reopen
- Issue Description: tenant's original WhatsApp message + parsed info grid
- Photo Attachments: images the tenant sent via WhatsApp
- Activity Timeline: full log of everything that happened on this complaint
- Right sidebar:
  - Tenant card: avatar, name, unit, "View Profile" link
  - Vendor Assignment: currently assigned vendor + dropdown to assign/reassign + button
  - Update Status: Open / In Progress / Resolved buttons

---

### 8.5 Payments

**Purpose:** Full financial picture of the portfolio. Who has paid, who is owing, who is due, and what the AI has already done about it.

**Summary Cards:** Total Expected / Collected / Outstanding / Due This Month

---

**Tab 1 — Rent Roll (default)**

Every tenant's payment status for the current period. The manager opens this and knows in 10 seconds where their money is.

Columns: Tenant, Unit, Property, Charge Amount, Due Date, Status, Last AI Action, Days Overdue / Days Until Due

Status values:
- ✅ Paid — approved, receipt sent
- 🕐 Awaiting Approval — manager action needed (highlighted at top)
- Invoice Sent — AI sent it, awaiting payment
- 🔔 Due Soon — due within 7 days
- ⚠️ Overdue — past due date, AI is chasing
- Upcoming — due in more than 7 days

Filters: by property, status, due date range

---

**Tab 2 — Approvals**

Only payments waiting for the manager's action. This is where the manager's one job in the payment flow happens.

Each item shows:
- Tenant name, unit, property
- Invoice amount
- Tenant's exact WhatsApp confirmation message
- Timestamp of confirmation

Actions:
- **Approve** → marks paid, AI sends receipt immediately
- **Query** → flags as disputed, AI sends follow-up to tenant

Bulk approve supported.

---

**Tab 3 — Invoices**

Full log of every invoice the AI generated and sent.
Columns: Invoice ID, Tenant, Unit, Property, Amount, Issue Date, Due Date, Status.
Actions: View PDF, Download.
Manager cannot create invoices — AI only.

---

**Tab 4 — Receipts**

Full log of all receipts sent after manager approval.
Columns: Receipt ID, Tenant, Unit, Amount, Payment Date, Sent Date.
Actions: View PDF, Download, Resend to Tenant.

---

### 8.6 Inbox

**Purpose:** View and optionally take over WhatsApp conversations the AI is managing.

**Left Panel — Thread List**
- Thread: tenant avatar, name, last message preview, timestamp
- Unread count badge (teal)
- AI status per thread: "AI Active" (gold pill) or "Manager Active" (teal pill)

**Right Panel — Chat View**
- Header: tenant avatar, name, unit, property
- AI Active / Manager Active toggle — pauses AI auto-responses for this thread
- Outgoing messages: teal, right-aligned
- Incoming messages: white, left-aligned
- AI messages labelled "✦ AI" in gold
- Thread status: Open / Resolved / Flagged
- Text input for manager to type manually
- "Hand back to AI" button

---

### 8.7 Broadcast

**Purpose:** Send templated WhatsApp messages to groups of tenants.

**Step 1 — Template**
Options: Service Charge Reminder, Lease Renewal Notice, Maintenance Notice, General Announcement, Custom Message.

**Step 2 — Compose**
Text area pre-filled with template. Manager can edit freely.

**Step 3 — Audience**
Choose a group first: All Tenants / Overdue Tenants / Due This Month / By Property / By Unit.
After choosing, a **full checklist of matched tenants appears — all pre-ticked.** Manager can uncheck individuals. Live counter: "Sending to 7 of 9 tenants."

**Step 4 — Schedule & Send**
Date and time pickers. Confirmation summary. Save Draft or Send Now.

**Broadcast History:** table of past broadcasts — date, template, count, status.

---

### 8.8 Vendors

**Purpose:** Manage the directory of maintenance vendors.

**Filters:** Search by name, Trade type dropdown

**Vendor Cards (grid)**
Each: name, trade badge, phone, status (Available / Busy / Inactive), jobs done, star rating. Clicking → Vendor Detail.

**Add Vendor Modal**
Fields: Name/Company*, Trade (Plumber / Electrician / AC Technician / Pest Control / Security / Painter / Carpenter / General), Phone*, Email, Notes, Assigned Properties (multi-checkbox)

**Vendor Detail Subview**
- Profile: name, trade, status, jobs done, rating, contacts
- Assigned properties
- Active Jobs: complaints currently assigned to this vendor
- Completed Jobs: past jobs with cost and notes
- Total Spend: cumulative maintenance cost
- AI Last Contact: most recent message AI sent to this vendor
- Job Cost field: manager logs cost when a job is resolved

---

### 8.9 AI Insights

**Purpose:** AI-generated portfolio health analysis.

**Health Score Banner:** score out of 100, AI narrative, circular score visualisation.

**Top Maintenance Issues:** bar chart of most frequent complaint types.

**High-Complaint Properties:** ranked by open complaint count.

**High-Risk Tenants:** tenants flagged for churn risk — overdue or 3+ complaints.

**WhatsApp AI Activity Stats:** messages processed, complaints logged, invoices sent, receipts sent, reminders sent, avg response time.

**Maintenance Spend Report:** spend by property, top vendors by spend.

**Lease Expiry Tracker:** all leases colour-coded — green 6+ months / amber 60–90 days / red under 60 days. "Send Renewal Notice" button per row.

**AI Recommendations (3 cards):** specific actions colour-coded by urgency. Each has a "Take Action" button.

**Refresh button** at top right.

---

### 8.10 Settings

**Left nav + content panel layout.**

**Profile:** name, email, phone, portfolio name, profile photo.

**Notifications:** toggles — rent due reminders, new complaint alerts, payment received, payment awaiting approval, lease expiry warnings.

**AI Agent:** toggles — AI auto-respond, AI auto-log complaints, AI auto-send reminders; tone selector (Formal / Friendly / Pidgin); AI working hours.

**WhatsApp:** connected number, webhook status, test connection.

**Team:** member list with roles; invite button.

**Billing:** plan name, usage, upgrade.

---

## 9. Modals (Global)

| Modal | Fields |
|---|---|
| Add Property | Name*, Type, Location*, Units*, Manager, Revenue |
| Add Tenant | Name*, Phone*, Property, Unit*, Charge, Deposit, Lease Start, Lease Expiry, Status |
| Add Vendor | Name*, Trade, Phone*, Email, Notes, Assigned Properties |

All modals: sticky title bar, ✕ close button, form body, sticky footer with Cancel + primary action. Inline field validation. Closes on overlay click.

---

## 10. Status & Badge System

| Status | Colour | Used In |
|---|---|---|
| Paid | Green | Payments, Tenants |
| Awaiting Approval | Amber | Payments |
| Invoice Sent | Blue | Payments |
| Due Soon | Purple | Payments |
| Overdue | Red | Payments, Tenants |
| Pending | Grey | Tenants |
| Open | Amber | Complaints |
| In Progress | Blue | Complaints |
| Resolved | Green | Complaints |
| Critical | Red | Complaints |
| High | Amber | Complaints |
| Medium | Grey | Complaints |
| Low | Green | Complaints |
| Available | Green | Vendors |
| Busy | Blue | Vendors |
| Inactive | Grey | Vendors |
| Sent | Green | Broadcast |
| Scheduled | Purple | Broadcast |
| Draft | Grey | Broadcast |

---

## 11. Design System

**Colours**
```
Teal Primary:     #2BB8A3
Teal Dark:        #1A9E8A
Teal Darker:      #0D7A6A
Teal Pale:        #E6F7F5
Gold:             #F0A520
Gold Dark:        #D4870A
Gold Pale:        #FEF3C7
Sidebar:          #0D3D36
Page BG:          #F4FAF9
Card BG:          #FFFFFF
Border:           #E0ECEB
Text Primary:     #0D1F1C
Text Secondary:   #476B66
Text Muted:       #8FADA9
Red:              #DC2626
Green:            #059669
Blue:             #2563EB
Purple:           #7C3AED
```

**Typography:** Outfit (Google Fonts) — 400 body / 600 labels / 700 headings / 800 metrics

**Components**
- Cards: white, 1px border, 10px radius, shadow-sm
- Buttons: Primary teal / Amber / Green / Red / Outline / Ghost
- Badges: pill shape, coloured dot indicator
- Tables: uppercase headers, teal-pale row hover
- Modals: blur overlay, centered, slide-in animation
- Toasts: bottom-right, dark green, 2.8s auto-dismiss

---

## 12. What the Manager Can and Cannot Do

| Action | Who |
|---|---|
| Create a complaint | ❌ AI only |
| Create an invoice | ❌ AI only |
| Send invoice to tenant | ❌ AI only |
| Send rent reminders | ❌ AI only |
| Send receipt after payment | ❌ AI only |
| Approve a payment | ✅ Manager only |
| Query a payment | ✅ Manager only |
| Assign vendor to complaint | ✅ Manager only |
| Update complaint status | ✅ Manager only |
| Add property | ✅ Manager only |
| Add tenant | ✅ Manager only |
| Add vendor | ✅ Manager only |
| Send broadcast | ✅ Manager only |
| Take over inbox thread | ✅ Manager only |
| Log job cost | ✅ Manager only |

---

*Version 3.0 — March 2026*
*Owner: BOMA — Founder, Caretaker AI*
