# JREAL VISION — Platform Specification

**One platform. Three customer types. One central backend.**

This document combines three parts:

1. **Business Model & Website Structure** (B2C / B2B / NGO)
2. **Complete Website & Backend Logic** (for the developer)
3. **Client Dashboard & V1 Prototype Screens**

---

# Part 1 — Business Model & Website Structure

## 1.1 Overview

One website can serve three major customer types without becoming confusing. The key is to keep the homepage simple, then let customers choose the path that fits them.

**Tagline:** JREAL VISION — *Create • Print • Brand • Promote*

**Homepage question:** *What are you looking for?*

- **Personal Shopping**
- **Business Solutions**
- **NGO & Organization Solutions**

This is the most important part of the homepage.

## 1.2 The Three Customer Types

### 1. Personal / B2C

For individuals.

**Examples:** T-shirts, mugs, birthday banners, invitations, business cards, posters, photo printing, custom gifts.

**Customer journey:**

```
Shop → Choose product → Customize → Cart → Pay → Delivery
```

They don't need to see complicated business features.

### 2. Business / B2B

For companies, restaurants, shops, schools, hotels, etc.

**Dedicated page: BUSINESS SOLUTIONS**
*Everything your business needs to look professional and reach more customers.*

| Category | Services |
|---|---|
| **Branding** | Logo, brand identity, signage, office branding |
| **Printing** | Business cards, brochures, menus, banners, packaging, promotional materials |
| **Marketing** | Social media, advertising, content creation |
| **Media** | Product photography, promotional videos, reels |

**Business CTA:** `[ Start a Business Project ]`

The customer can select multiple services. For example, a restaurant wants: logo + menu + T-shirts + photography + video + social media. Instead of six separate orders, they create one project:

> **PROJECT: ABC RESTAURANT BRANDING**

### 3. NGO / Organization

NGOs get their own landing page.

**NGO & ORGANIZATION SOLUTIONS**
*Supporting organizations with creative, printing, media and campaign solutions.*

**Services:**

- Project reports
- Training manuals
- Brochures
- Posters
- Banners
- Campaign materials
- Event branding
- Photography
- Documentary videos
- Awareness campaigns
- Digital marketing
- Publications

**Most important CTA:** `REQUEST AN NGO QUOTE`

They can upload:

- Terms of Reference (TOR)
- RFQ
- BOQ
- Specifications
- Artwork
- Project requirements

JREAL then reviews everything and prepares a quotation/proposal.

## 1.3 One Website, Not Three

The website should **NOT** look like three separate websites. There is one JREAL VISION website, but internally:

```
                    JREAL VISION
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
         B2C            B2B            NGO
     Individuals     Businesses    Organizations
          │              │              │
         Shop         Projects        Projects
          │              │              │
       Checkout       Quotation         RFQ
          │              │              │
          └──────────────┴──────────────┘
                         ↓
                   JREAL ADMIN
```

Staff sees everything in **one admin dashboard**.

## 1.4 How Customers Enter the Website

Don't rely only on people typing the website address. Use different acquisition channels.

| Segment | Channels | Landing destination |
|---|---|---|
| **B2C** | Instagram, TikTok, Facebook, Google, WhatsApp, referrals | Shop |
| **B2B** | Google searches (e.g. "Printing company Kigali", "Branding company Rwanda", "Business cards Kigali", "T-shirt printing Rwanda", "Digital marketing Kigali"), LinkedIn, Instagram, direct sales, WhatsApp, referrals | Business Solutions |
| **NGO** | Google, LinkedIn, NGO networks, direct email outreach, procurement opportunities, referrals, partnerships | NGO & Organization Solutions |

## 1.5 A Very Powerful Feature: "REQUEST A QUOTE"

Put this button **everywhere**, because not every project can have a fixed price.

| Item | Action |
|---|---|
| Shop product | Add to Cart |
| 5,000 brochures | Request Quote |
| NGO campaign | Request Quote |
| Corporate video | Request Quote |
| Office branding | Request Quote |
| Monthly digital marketing | Request Quote |

## 1.6 Homepage Layout

```
┌──────────────────────────────────────────────────────┐
│ JREAL VISION   Shop  Services  Portfolio  About      │
│                                   Login  Contact     │
├──────────────────────────────────────────────────────┤
│                                                      │
│   CREATE. PRINT. BRAND. PROMOTE.                     │
│   Design, printing, branding, media & marketing      │
│   solutions for individuals and organizations.       │
│                                                      │
│   [ SHOP NOW ]        [ REQUEST A QUOTE ]            │
│                                                      │
├──────────────────────────────────────────────────────┤
│   WHAT DO YOU NEED?                                  │
│                                                      │
│   Personal        Business        NGO                │
│   Shop products   Grow your       Projects,          │
│                   business        campaigns & events │
├──────────────────────────────────────────────────────┤
│   OUR SERVICES                                       │
│   Design | Printing | Branding | Marketing          │
│   Photography | Videography                          │
├──────────────────────────────────────────────────────┤
│   FEATURED PRODUCTS                                  │
│   [T-Shirt] [Business Card] [Banner] [Mug]           │
├──────────────────────────────────────────────────────┤
│   BUSINESS SOLUTIONS                                 │
│   Build your brand with JREAL VISION                 │
│   [ START BUSINESS PROJECT ]                         │
├──────────────────────────────────────────────────────┤
│   NGO & ORGANIZATIONS                                │
│   Printing • Campaigns • Media • Branding            │
│   [ REQUEST NGO QUOTE ]                              │
├──────────────────────────────────────────────────────┤
│   OUR WORK / PORTFOLIO                               │
│   [Photos] [Videos] [Projects]                       │
└──────────────────────────────────────────────────────┘
```

## 1.7 The Business Model

You aren't building just an e-commerce website. You're building a **digital sales platform** for JREAL VISION:

- **B2C** → products
- **B2B** → business projects
- **B2NGO** → organizational projects / RFQs

All three eventually enter the JREAL VISION CRM/order system, where staff manage quotations, negotiation, payments, production, delivery and customer communication.

---

# Part 2 — Complete Website & Backend Logic

The best way to explain this to the developer: a complete system logic document covering how a visitor enters from the homepage, becomes a customer, how orders/projects are created, and how everything reaches the admin/backend.

Think of the website as **one front door with different paths, but one central backend.**

## 2.1 The Whole System

```
                     ┌─────────────────────┐
                     │      HOME PAGE      │
                     │    JREAL VISION     │
                     └──────────┬──────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ↓                     ↓                     ↓
         B2C                   B2B                   B2NGO
      Individuals           Businesses           Organizations
          │                     │                     │
          ↓                     ↓                     ↓
         SHOP                SERVICES              NGO / RFQ
          │                     │                     │
          └──────────────┬──────┴─────────────────────┘
                         ↓
                 CUSTOMER ACCOUNT
                         │
                         ↓
                 CUSTOMER DASHBOARD
                         │
      ┌──────────┬───────┼───────┬──────────┐
      ↓          ↓       ↓       ↓          ↓
    Orders    Projects  Quotes  Payments   Files
      │          │       │       │          │
      └──────────┴───────┼───────┴──────────┘
                         ↓
                  CENTRAL BACKEND
                         │
                ┌────────┴────────┐
                ↓                 ↓
         ADMIN DASHBOARD        STAFF
                │
      ┌─────────┼──────────┐
      ↓         ↓          ↓
    Orders   Projects   Customers
      │         │          │
      ↓         ↓          ↓
  Production  Marketing  Support
      │         │          │
      └─────────┼──────────┘
                ↓
            DELIVERY
```

## 2.2 Homepage = The Traffic Controller

The homepage should not contain every feature. Its job is to ask: **"What do you need?"**

**Main buttons:**

- `[ SHOP PRODUCTS ]`
- `[ DESIGN & PRINT ]`
- `[ BUSINESS SOLUTIONS ]`
- `[ NGO & ORGANIZATION ]`
- `[ DIGITAL MARKETING ]`
- `[ PHOTOGRAPHY ]`
- `[ VIDEOGRAPHY ]`
- `[ REQUEST A QUOTE ]`

Each button sends the visitor into the correct workflow.

## 2.3 B2C Flow

Someone wants a T-shirt.

```
HOME
 ↓
SHOP
 ↓
T-SHIRTS
 ↓
SELECT PRODUCT
 ↓
SELECT SIZE / COLOR / QUANTITY
 ↓
UPLOAD DESIGN
 ↓
PRICE CALCULATED
 ↓
ADD TO CART
 ↓
CHECKOUT
 ↓
LOGIN / CREATE ACCOUNT / GUEST
 ↓
PAYMENT
 ↓
ORDER CREATED
 ↓
CUSTOMER DASHBOARD
 ↓
ORDER TRACKING
 ↓
DELIVERY
```

**Backend:** when they click *Place Order*, the backend creates:

```
Customer → Order → Order Items → Payment → Production → Delivery
```

## 2.4 B2B Flow

Suppose a restaurant wants: logo, menu, 50 T-shirts, 500 business cards, product photography, and social media management. Don't make them create six unrelated orders.

```
BUSINESS SOLUTIONS
 ↓
Create Business Project
 ↓
Select Services
   (Logo / Printing / Photography / Marketing)
 ↓
Describe Requirements
 ↓
Upload Files
 ↓
REQUEST QUOTE
 ↓
JREAL ADMIN
 ↓
Review Requirements
 ↓
Create Quotation
 ↓
Customer Dashboard
 ↓
Customer Reviews Quote
 ↓
Accept / Negotiate / Reject
 ↓
AGREED PRICE
 ↓
Deposit Payment
 ↓
PROJECT STARTED
```

## 2.5 B2NGO Flow

This is slightly different.

NGO visits **NGO & ORGANIZATION** and sees: *"Creative, Printing, Media & Marketing Solutions for Organizations."*

```
NGO PAGE
 ↓
REQUEST NGO QUOTE
 ↓
Organization Account
 ↓
Organization Information
 ↓
Project Information
 ↓
Upload RFQ / TOR / BOQ / Specifications
 ↓
Submit Request
 ↓
BACKEND
 ↓
ADMIN REVIEWS
 ↓
Quotation / Proposal
 ↓
Customer receives notification
 ↓
Review quotation
 ↓
Negotiate if necessary
 ↓
Approve
 ↓
Purchase Order / Agreement
 ↓
Deposit / Payment
 ↓
Production
 ↓
Quality Check
 ↓
Delivery
 ↓
Project Completed
```

## 2.6 One Account for Everything

**Very important for the developer:** do not create separate systems for B2C, B2B and NGO. Use one user model:

```
USER
 │
 ├── Personal Profile
 ├── Business Profile (optional)
 ├── Organization Profile (optional)
 │
 ├── Orders
 ├── Projects
 ├── Quotes
 ├── Payments
 ├── Files
 ├── Messages
 └── Bookings
```

A person can start as an individual and later create a business/organization profile.

## 2.7 Customer Dashboard (Structure)

The customer should see only what is relevant.

```
CUSTOMER DASHBOARD
 Overview
 │
 ├── My Orders
 ├── My Projects
 ├── My Quotes
 ├── My Payments
 ├── My Files
 ├── My Bookings
 ├── Messages
 ├── Notifications
 └── Profile
```

Don't expose complicated production functions to customers.

## 2.8 Quotation System

One of the most important backend features. There are two types.

**Fixed-price**

> Business Card — 500 pcs — 35,000 RWF
> Customer: Add to Cart → Checkout

**Custom quotation**

> NGO wants 5,000 training manuals.
> Customer: Request Quote

**Quote record** (e.g. `QUOTE #QT-1025`) contains:

- Customer
- Project
- Services
- Quantity
- Specifications
- Estimated price
- Discount
- Final price
- Validity date
- Terms
- Status

## 2.9 Negotiation Logic

Quote status flow:

```
DRAFT
 ↓
SENT TO CUSTOMER
 ↓
CUSTOMER ACTION
 ├── ACCEPT
 ├── REJECT
 └── NEGOTIATE
```

**Example negotiation:**

```
JREAL:     600,000
   ↓
Customer:  500,000
   ↓
JREAL:     550,000
   ↓
Customer:  ACCEPT
   ↓
FINAL PRICE = 550,000
```

Then the backend **locks the agreed price**. The customer must not be able to change it afterward.

## 2.10 Project Management

Every large service becomes a **Project**.

```
PROJECT #PRJ-001
ABC Restaurant Branding

Services:
 ✓ Logo
 ✓ Business Cards
 ✓ T-Shirts
 ✓ Photography
 ✓ Video
 ✓ Marketing
```

**Status pipeline:**

```
Quotation → Approved → Deposit Paid → Design → Production → Media → Marketing → Completed
```

This allows one customer to have a complete business project.

## 2.11 File Management

Every uploaded file must belong to something:

```
FILE → CUSTOMER → PROJECT → SERVICE
```

Example:

```
logo.png → ABC Restaurant → Branding Project → Logo Design
```

Don't put all customer files into one public folder. The backend must control who can access each file.

## 2.12 Payment Logic

Payment connects to **Order OR Quote/Project**.

```
QUOTE: 600,000 RWF
 ↓
Customer accepts
 ↓
Deposit required: 300,000 RWF
 ↓
Payment
 ↓
PAYMENT CONFIRMED
 ↓
PROJECT ACTIVE
```

Then track:

| Total | Paid | Balance |
|---|---|---|
| 600,000 | 300,000 | 300,000 |

## 2.13 Admin Backend

Build a **completely separate Admin Dashboard**.

```
ADMIN DASHBOARD
 Overview
 │
 ├── Customers
 ├── Orders
 ├── Projects
 ├── Quotations
 ├── Negotiations
 ├── Payments
 ├── Products
 ├── Services
 ├── Files
 ├── Bookings
 ├── Marketing Campaigns
 ├── Production
 ├── Delivery
 ├── Messages
 ├── Reviews
 └── Reports
```

## 2.14 Admin Order Flow

When someone orders a banner:

```
CUSTOMER
 ↓
ORDER CREATED
 ↓
PAYMENT CHECK
 ↓
ARTWORK CHECK
 ↓
PRODUCTION
 ↓
QUALITY CONTROL
 ↓
READY
 ↓
DELIVERY / PICKUP
 ↓
DELIVERED
 ↓
REVIEW
```

**Each status change should automatically notify the customer.**

## 2.15 Digital Marketing Backend

A separate module connected to the customer/project.

```
CLIENT
 ↓
MARKETING PROJECT
 ↓
CAMPAIGN
 ↓
CONTENT PLAN
 ↓
CONTENT CREATION
 ↓
CLIENT APPROVAL
 ↓
PUBLISH
 ↓
CAMPAIGN RESULTS
 ↓
MONTHLY REPORT
```

**Customer dashboard view — "Your September Marketing Campaign":**

- 20 posts
- 8 reels
- 4 campaigns
- Content calendar
- Results/report

## 2.16 Photography / Videography

These use a **booking system**.

```
SERVICE
 ↓
BOOKING REQUEST
 ↓
DATE / TIME / LOCATION
 ↓
ADMIN CONFIRMATION
 ↓
QUOTE
 ↓
PAYMENT
 ↓
BOOKING CONFIRMED
 ↓
SESSION
 ↓
FILES DELIVERED
 ↓
COMPLETED
```

## 2.17 Database Structure

A starting schema for the developer.

**USERS**
- user_id
- name
- email
- phone
- password_hash
- role

**PROFILES**
- profile_id
- user_id
- type
- information

**ORGANIZATIONS**
- organization_id
- owner_id
- name
- organization_type

**PRODUCTS**
- product_id
- name
- category
- price
- pricing_type
- stock

**ORDERS**
- order_id
- customer_id
- total
- status
- payment_status

**ORDER_ITEMS**
- order_item_id
- order_id
- product_id
- quantity
- price

**PROJECTS**
- project_id
- customer_id
- project_type
- status
- total

**QUOTES**
- quote_id
- project_id
- amount
- discount
- final_price
- status
- valid_until

**NEGOTIATIONS**
- negotiation_id
- quote_id
- user_id
- offer_amount
- message
- status

**PAYMENTS**
- payment_id
- customer_id
- order_id
- quote_id
- amount
- method
- status

**FILES**
- file_id
- customer_id
- project_id
- filename
- secure_url

**MESSAGES**
- message_id
- project_id
- sender_id
- message
- timestamp

**BOOKINGS**
- booking_id
- customer_id
- service_id
- date
- location
- status

**NOTIFICATIONS**
- notification_id
- customer_id
- title
- message
- read_status

## 2.18 The Most Important Backend Principle

> **Everything must have an ID and a relationship.**

```
Customer
 │
 └── Project #PRJ001
      │
      ├── Quote #QT001
      │    └── Negotiation
      │
      ├── Files
      ├── Messages
      ├── Payments
      │
      └── Services
           ├── Design
           ├── Printing
           ├── Photography
           └── Marketing
```

This prevents the system from becoming messy later.

## 2.19 Final Architecture

```
                 JREAL VISION WEBSITE
                          │
                    ┌─────┴─────┐
                    │ HOME PAGE │
                    └─────┬─────┘
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
         B2C             B2B            B2NGO
          │               │               │
         SHOP          PROJECT           RFQ
          │               │               │
          └───────────────┼───────────────┘
                          ↓
                     USER ACCOUNT
                          ↓
                  CUSTOMER DASHBOARD
                          ↓
                    API / BACKEND
                          ↓
                       DATABASE
                          ↓
                 ┌────────┴────────┐
                 ↓                 ↓
            ADMIN PANEL       STAFF PANEL
                                   │
                          ┌────────┼─────────┐
                          ↓        ↓         ↓
                        SALES  PRODUCTION  SERVICES
                          │        │         │
                          └────────┼─────────┘
                                   ↓
                               CUSTOMER
                                   ↓
                               DELIVERY
                                   ↓
                                REVIEW
```

This is the architecture to give the developer before coding. It keeps B2C, B2B and B2NGO under one platform while allowing each customer type to have a different buying/request process.

---

# Part 3 — Client Dashboard

## 3.1 Dashboard Overview Screen

```
┌─────────────────────────────────────────────────────────────────────┐
│ JREAL VISION DESIGN                                     Jerome ▼    │
├───────────────┬─────────────────────────────────────────────────────┤
│               │                                                     │
│ Overview      │ Welcome back, Jerome                                │
│               │ Manage your orders, projects and services.          │
│ My Orders     │                                                     │
│               │ ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│ Projects      │ │Active      │ │Completed   │ │Pending     │        │
│               │ │Orders      │ │Orders      │ │Payments    │        │
│ Marketing     │ │    3       │ │    12      │ │150,000 RWF │        │
│               │ └────────────┘ └────────────┘ └────────────┘        │
│ Photography   │                                                     │
│               │ QUICK ACTIONS                                       │
│ Videography   │ [ + New Order ]  [ Request Design ]                 │
│               │ [ Book Photography ] [ Request Quote ]              │
│ My Files      │                                                     │
│               │ RECENT ORDERS                                       │
│ Payments      │ ┌──────────────────────────────────────────────┐    │
│               │ │ #JV1025  Business Cards 500 pcs              │    │
│ Messages      │ │ 35,000 RWF   Processing          View →      │    │
│               │ ├──────────────────────────────────────────────┤    │
│ Notifications │ │ #JV1021  Logo Design                         │    │
│               │ │ 50,000 RWF   Awaiting Approval   View →      │    │
│ Wishlist      │ └──────────────────────────────────────────────┘    │
│               │                                                     │
│ Profile       │ ACTIVE PROJECTS                                     │
│ Support       │ Logo Design  ████████░░ 80%   Review →              │
│               │ Marketing    ██████░░░░ 60%   View →                │
│ Logout        │                                                     │
└───────────────┴─────────────────────────────────────────────────────┘
```

## 3.2 Key Screen: Quotation & Negotiation

The dashboard should also have a dedicated quotation/negotiation interface.

```
┌──────────────────────────────────────────────┐
│ QUOTATION #QT-1025                           │
│ Complete Business Branding                   │
├──────────────────────────────────────────────┤
│ JREAL Initial Price                          │
│ 600,000 RWF                                  │
│                                              │
│ Your Offer                                   │
│ [ 500,000 RWF ]                              │
│                                              │
│ Message                                      │
│ [ I would like a better price for this       │
│   package because I am ordering several      │
│   services. ]                                │
│                                              │
│ [ Send Offer ]                               │
├──────────────────────────────────────────────┤
│ NEGOTIATION HISTORY                          │
│                                              │
│ JREAL   600,000 RWF                          │
│ You     500,000 RWF                          │
│ JREAL   575,000 RWF                          │
│ You     525,000 RWF                          │
│                                              │
│ Waiting for JREAL                            │
└──────────────────────────────────────────────┘
```

## 3.3 V1 Prototype: 12 Screens to Build

1. Login / Register
2. Dashboard Overview
3. My Orders
4. Order Details + Tracking
5. My Projects
6. Design Project + Revisions
7. Quotation + Negotiation
8. Shop + Cart
9. My Files
10. Payments + Invoices
11. Bookings / Marketing
12. Messages + Notifications + Profile
