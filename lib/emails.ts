export type EmailLabel = "Urgent" | "Needs Reply" | "FYI" | "Ignore";

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  body: string;
  time: string;
  timestamp?: string;
  read: boolean;
  label: string;
  draft?: string;
}

export const sampleEmails: Email[] = [
  {
    id: "1",
    from: "Margaret Osei",
    fromEmail: "m.osei@homeowner.com",
    subject: "URGENT: Need to close my Fraction sale by Friday",
    body: `Hi Leif,

I'm reaching out because I've had an unexpected change in my financial situation and I need to liquidate my 30% stake in the Malibu property (123 Ocean View Drive) as soon as possible — ideally by end of week.

I purchased the fraction 18 months ago and understand the current platform valuation puts it at approximately $187,000. I'm willing to accept a slight discount to move quickly.

Can we get on a call today or tomorrow? I need someone to walk me through the off-market transfer process and whether there are any existing co-owners on the platform who might be interested.

Urgently yours,
Margaret Osei`,
    time: "9:14 AM",
    read: false,
    label: "Urgent",
  },
  {
    id: "2",
    from: "Daniel Reyes",
    fromEmail: "d.reyes@keystonerealty.com",
    subject: "Referral partnership inquiry — sending 3 clients your way",
    body: `Hi Leif,

I'm a broker at Keystone Realty here in Miami and I've been following Fraction for a while. I have three high-net-worth clients who are interested in co-ownership of vacation properties but aren't ready to buy outright.

I'd love to set up a formal referral arrangement — do you have a broker partnership program? I'd want to understand the commission structure and what the onboarding experience looks like for referred clients.

Let me know when you're free for a 20-minute call.

Best,
Daniel Reyes
Senior Broker, Keystone Realty`,
    time: "8:52 AM",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "3",
    from: "Sofia Marchetti",
    fromEmail: "sofia.marchetti@gmail.com",
    subject: "Question about co-owner responsibilities at Aspen property",
    body: `Hello,

I'm a fractional owner at the Aspen property (47 Snowmass Ridge). I have a 20% stake and I've been trying to understand my obligations regarding the upcoming roof replacement the property manager is proposing.

The estimate is $42,000 total, which means my share would be $8,400. I wasn't budgeting for this. Is this a mandatory expense? How does Fraction handle co-owner disagreements on capital improvements?

I'd appreciate a call or a detailed email explaining the process.

Thanks,
Sofia Marchetti`,
    time: "8:30 AM",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "4",
    from: "Alex Kim",
    fromEmail: "a.kim@fractionteam.com",
    subject: "New listing ready for review: 4BR Scottsdale, $1.2M",
    body: `Hey Leif,

The new Scottsdale listing is ready for your review before we go live on the platform. It's a 4BR/3BA property at 82 Desert Rose Ct, valued at $1.2M. We're offering 8 fractions at $150K each.

The property inspection came back clean, legal has signed off on the co-ownership agreement, and the photography is done. I just need your final sign-off to publish it.

Should be a strong one — similar Scottsdale listings sold out in under 3 weeks.

- Alex`,
    time: "Yesterday",
    read: false,
    label: "Urgent",
  },
  {
    id: "5",
    from: "James Whitfield",
    fromEmail: "j.whitfield@lpinvestors.com",
    subject: "LP update request: Q1 portfolio performance",
    body: `Hi Leif,

Hope you're well. On behalf of our investment committee, I'm reaching out to request the Q1 performance update for our LP position. We're specifically looking for:

1. Occupancy rates across the portfolio
2. Rental income distribution timeline
3. Any properties with deferred maintenance or value concerns
4. Pipeline of new listings for Q2

Our next committee meeting is March 5th so if you could have this to us by March 3rd that would be ideal.

Thank you,
James Whitfield
Managing Partner, LP Investors Group`,
    time: "Yesterday",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "6",
    from: "Priya Sharma",
    fromEmail: "p.sharma@fractionteam.com",
    subject: "Team offsite — please confirm attendance by EOW",
    body: `Hey team,

Quick reminder that our Q2 offsite is coming up — April 11-12 in Palm Springs. We'll be doing strategy sessions, a property tour, and team dinner Saturday night.

Please confirm your attendance by end of this week so I can finalize the hotel block and catering.

Reply with: Yes / No / Maybe + any dietary restrictions.

Thanks!
Priya`,
    time: "Yesterday",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "7",
    from: "Robert Chang",
    fromEmail: "r.chang@fractionowner.com",
    subject: "Rental income deposit — when does it hit?",
    body: `Hi,

I own a 15% stake in the Tulum beachfront property. The platform dashboard shows rental income of $3,240 for February but I haven't seen the deposit yet. It's now March 2nd.

Could you let me know when I should expect the transfer and what bank processing times look like? First time going through the payout cycle.

Thanks,
Robert Chang`,
    time: "Feb 24",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "8",
    from: "PropTech Insider Newsletter",
    fromEmail: "news@proptechinsider.com",
    subject: "This week: Co-ownership platforms hit $2.4B in transactions",
    body: `PROPTECH INSIDER — Weekly Briefing

TOP STORIES:
• Fractional real estate platforms collectively processed $2.4B in transactions in 2025, up 180% YoY
• New SEC guidance on co-ownership structures creates clarity for platforms
• Airbnb's new "co-host" program seen as competitive threat to fractional players
• Interview: Why Gen Z is choosing co-ownership over traditional mortgages

Read the full issue at proptechinsider.com

Manage preferences | Unsubscribe`,
    time: "Feb 23",
    read: true,
    label: "FYI",
  },
  {
    id: "9",
    from: "Rachel Torres",
    fromEmail: "r.torres@realsummit.com",
    subject: "Speaking invite: Future of Real Estate Ownership Summit",
    body: `Dear Leif,

We'd love to invite you to speak at the Future of Real Estate Ownership Summit in Miami, May 14–15, 2026. Given Fraction's leadership in the co-ownership space, you'd be a natural fit for our keynote panel: "Is Fractional the Future of Luxury Real Estate?"

We offer a $3,000 honorarium, cover travel and accommodation, and expect 800+ attendees including brokers, developers, and investors.

Please let me know if you're interested and I'll send over the full speaker brief.

Warm regards,
Rachel Torres
Summit Director`,
    time: "Feb 22",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "10",
    from: "Luxury Listings Pro",
    fromEmail: "offers@luxurylistingspro.com",
    subject: "🏠 Boost your listings! Special offer inside",
    body: `Hi there,

Are you in real estate? Get 3x more leads with Luxury Listings Pro!

✅ Premium placement on 50+ portals
✅ AI-powered lead scoring
✅ $0 setup fee this month only

Don't miss out — offer expires Sunday!

[CLAIM YOUR FREE TRIAL]

Unsubscribe | This is a promotional email`,
    time: "Feb 21",
    read: true,
    label: "Ignore",
  },
  {
    id: "11",
    from: "Nina Hartwell",
    fromEmail: "nina.hartwell@gmail.com",
    subject: "Interested in buying a fraction — first-time buyer questions",
    body: `Hi Leif,

I came across Fraction through a friend who owns a stake in the Palm Springs property. I'm a surgeon based in Chicago and I'm seriously considering purchasing a 25% share in a vacation property.

A few questions before I schedule a call:
- What's the minimum investment?
- How liquid is this? Can I sell my stake if I need to?
- Do owners get guaranteed usage weeks, or is it first-come?
- How is the co-ownership agreement structured legally?

I'm pre-approved for up to $250K and would ideally want somewhere warm — Florida, Arizona, or Caribbean.

Looking forward to hearing from you,
Nina Hartwell`,
    time: "9:02 AM",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "12",
    from: "Carlos Mendez",
    fromEmail: "c.mendez@keystonepm.com",
    subject: "Property manager report: Tulum — Feb maintenance issues",
    body: `Hi Leif,

Monthly update on the Tulum beachfront property:

COMPLETED:
- AC unit in master bedroom replaced ($1,840, within approved budget)
- Pool resurfacing complete — looks great
- New cleaning crew onboarded, rating up to 4.9★

PENDING:
- Ocean-facing deck boards showing salt damage — estimate incoming (~$3,200)
- Guest complained about WiFi speeds; upgrading router next week

Occupancy: 22/28 days in February (78%). March is fully booked.

Let me know if you have questions.
Carlos Mendez
Keystone Property Management`,
    time: "8:15 AM",
    read: false,
    label: "FYI",
  },
  {
    id: "13",
    from: "Laura Chen",
    fromEmail: "l.chen@fractionteam.com",
    subject: "Legal: Updated co-ownership agreement template — review needed",
    body: `Hi Leif,

Our legal team has updated the standard co-ownership agreement template to reflect the new SEC guidance issued last month. Key changes:

1. Clarified exit rights and forced sale provisions
2. Updated dispute resolution clause (arbitration, not litigation)
3. Added rental income waterfall schedule as an exhibit
4. New definitions section for "material decision" threshold

I need sign-off from Sales before we roll this out to new listings. Can you review by Thursday? I've attached the redline.

Thanks,
Laura Chen
Head of Legal, Fraction`,
    time: "Yesterday",
    read: false,
    label: "Urgent",
  },
  {
    id: "14",
    from: "Tom Bradley",
    fromEmail: "t.bradley@fortunemag.com",
    subject: "Fortune feature: Looking for a co-ownership success story",
    body: `Hi Leif,

I'm a staff writer at Fortune covering the rise of fractional real estate. I'm writing a feature on how co-ownership is democratizing access to luxury properties and I'd love to include a Fraction customer success story.

Ideally I'm looking for an owner who:
- Bought their first fraction in the last 12 months
- Has used the property and earned rental income
- Is willing to be quoted by name

Would Fraction be willing to connect me with a suitable client? Happy to share questions in advance and give approval rights over any quotes.

Deadline is March 10th.

Best,
Tom Bradley`,
    time: "Yesterday",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "15",
    from: "Wei Zhang",
    fromEmail: "w.zhang@pacificventures.com",
    subject: "Follow-up: Series B interest from Pacific Ventures",
    body: `Hi Leif,

Following up on our conversation at the Miami conference last month. Our fund is actively looking at PropTech opportunities and Fraction continues to stand out.

We'd like to schedule a formal intro call with your CEO and CFO. We typically move quickly — if the fit is right we can have a term sheet within 30 days.

Our check size for Series B is $8–15M. We've backed three other marketplace models that scaled to $100M+ ARR.

Are you able to make an intro to the right person on your leadership team?

Best,
Wei Zhang
Partner, Pacific Ventures`,
    time: "Yesterday",
    read: false,
    label: "Urgent",
  },
  {
    id: "16",
    from: "Gregory Walsh",
    fromEmail: "g.walsh@coowner.com",
    subject: "Noise complaint — other co-owners at Hamptons property",
    body: `Leif,

I need to escalate an issue at the Hamptons property (18 Dune Crest Rd). The other co-owners had a large party last weekend that resulted in a noise complaint from neighbors and minor damage to the back patio furniture.

I have photos and a copy of the neighbor's complaint letter. This is not the first time — there was a similar incident in September.

What recourse do I have as a co-owner? Is there a conduct policy in the agreement? I want this documented formally.

Gregory Walsh`,
    time: "Feb 24",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "17",
    from: "Fraction Website",
    fromEmail: "noreply@fraction.com",
    subject: "New lead: Aisha Patel — $200K budget, interested in Hawaii",
    body: `New inquiry submitted via fraction.com

Name: Aisha Patel
Email: aisha.patel@techcorp.com
Phone: (415) 882-0934
Budget: $150,000–$200,000
Location preference: Hawaii, Napa Valley
Timeline: Ready to invest within 60 days
Notes: "Looking for a property I can use for family vacations 2–3 times a year and earn rental income the rest of the time. Saw Fraction featured in TechCrunch."

This lead was auto-assigned to you based on the Hawaii property pipeline.

— Fraction CRM`,
    time: "Feb 23",
    read: false,
    label: "Urgent",
  },
  {
    id: "18",
    from: "Marcus Hill",
    fromEmail: "m.hill@pacaso.com",
    subject: "Reaching out — potential collaboration between Pacaso and Fraction",
    body: `Hi Leif,

Marcus here from the partnerships team at Pacaso. I know we're technically competitors but I've been thinking about whether there's a geography or asset class where collaboration makes more sense than competition.

Specifically, I'm curious whether Fraction would consider a white-label arrangement for our international markets where we don't have an operational footprint.

No hard pitch — just exploratory. Worth a 30-minute call?

Marcus Hill
VP Partnerships, Pacaso`,
    time: "Feb 23",
    read: true,
    label: "FYI",
  },
  {
    id: "19",
    from: "HR Team",
    fromEmail: "hr@fractionteam.com",
    subject: "Action required: Complete your Q1 performance self-review",
    body: `Hi Leif,

This is a reminder that Q1 performance self-reviews are due by March 7th. Please log in to Lattice and complete your self-assessment before the deadline.

The review covers:
- Goal progress (OKRs)
- Core competencies
- Manager feedback request
- Development goals for Q2

The process takes about 30–45 minutes. If you have questions, reach out to HR.

— Fraction People Team`,
    time: "Feb 22",
    read: true,
    label: "FYI",
  },
  {
    id: "20",
    from: "Samantha Briggs",
    fromEmail: "s.briggs@alphawealth.com",
    subject: "Client referral: 3 HNW investors ready to move fast",
    body: `Hi Leif,

We met briefly at the Wealth Management Symposium in NYC last week. I manage a book of about 140 HNW clients and three of them have specifically asked me about fractional real estate after reading about Fraction in Bloomberg.

All three have $300K–$500K to allocate and want diversified property exposure without full ownership headaches. They're ready to move within the quarter.

Do you have a referral fee structure? I want to make sure I'm doing this the right way before making introductions.

Samantha Briggs
Senior Wealth Advisor, Alpha Wealth Management`,
    time: "Feb 21",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "21",
    from: "David Park",
    fromEmail: "d.park@gmail.com",
    subject: "Interested in buying additional stake at Napa property",
    body: `Hi Leif,

I currently own 10% of the Napa Valley vineyard property and I love it. I've heard through the co-owner group chat that one of the other owners (I believe the 25% holder) is looking to sell their stake.

I'd like to exercise any right of first refusal I might have and potentially increase my ownership to 35%. Can you confirm:
1. Does my co-ownership agreement give me ROFR?
2. What is the current platform valuation for a 25% stake?
3. What's the process and timeline?

Happy to move quickly on this.

David Park`,
    time: "Feb 21",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "22",
    from: "Jennifer Lowe",
    fromEmail: "j.lowe@wellsfargo.com",
    subject: "Financing options for fractional real estate — bank partnership",
    body: `Dear Leif,

I'm reaching out from Wells Fargo's innovation lending group. We've been exploring financing products for fractional real estate buyers — a segment we currently have no product for.

We'd love to understand how your buyers typically fund purchases and whether there's appetite for a co-branded lending product (e.g., "Fraction + Wells Fargo Fractional Mortgage").

Would your team be open to a preliminary conversation? This would be at the product strategy level, not a sales call.

Jennifer Lowe
Director, Innovation Lending
Wells Fargo`,
    time: "Feb 20",
    read: false,
    label: "FYI",
  },
  {
    id: "23",
    from: "Oliver Grant",
    fromEmail: "o.grant@taxadvisors.com",
    subject: "Property tax assessment appeal — Malibu co-owners need to act",
    body: `Dear Fraction team,

I represent several co-owners at the Malibu property (123 Ocean View Drive). The county has issued a reassessment that would increase the annual property tax bill by 34% — from $18,200 to $24,400.

We believe there are strong grounds for appeal based on comparable sales data. However, the appeal deadline is March 15th and we need written authorization from all co-owners to file jointly.

Please advise on how to coordinate this with the full ownership group. Time is short.

Oliver Grant, CPA
Grant Tax Advisors`,
    time: "Feb 20",
    read: false,
    label: "Urgent",
  },
  {
    id: "24",
    from: "Emergency Maintenance",
    fromEmail: "alerts@keystonepm.com",
    subject: "⚠️ WATER LEAK — Scottsdale property, guest checking in tomorrow",
    body: `PRIORITY ALERT

Property: 82 Desert Rose Ct, Scottsdale
Issue: Burst pipe detected in guest bathroom (unit 2)
Status: Water shut off to unit. Plumber dispatched, ETA 2 hours.
Guest impact: Couple checking in tomorrow at 3pm for 5-night stay

Estimated repair: $800–$1,200
We need authorization to proceed and a decision on whether to relocate the guest or delay repair and adjust check-in.

Please call Carlos at (305) 441-8823 immediately.

— Keystone Emergency Line`,
    time: "7:43 AM",
    read: false,
    label: "Urgent",
  },
  {
    id: "25",
    from: "Isabella Fontaine",
    fromEmail: "i.fontaine@euroestates.com",
    subject: "Partnership proposal: Co-ownership listings in French Riviera",
    body: `Dear Leif,

I am the director of Euro Estates, a luxury property agency specialising in the French Riviera and Tuscany. We have several owners of exceptional properties who are interested in the co-ownership model but lack a platform to facilitate it.

Specifically, I have:
- A 6-bedroom villa in Cap Ferrat (est. €3.2M) — owner open to selling 60% in fractions
- A Tuscan farmhouse estate (€1.8M) — owner wants to retain 25%, sell the rest

Would Fraction consider international listings, or a white-label arrangement for European properties?

I look forward to your response.

Isabella Fontaine
Director, Euro Estates`,
    time: "Feb 19",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "26",
    from: "Tyler Brooks",
    fromEmail: "t.brooks@outlook.com",
    subject: "Following up — we spoke 3 weeks ago about Sedona property",
    body: `Hi Leif,

Just following up on our conversation in early February. You mentioned the Sedona listing was coming to market in late February.

Has it launched yet? I have $180K ready to invest and Sedona is my top pick. I'd hate to miss the window.

Let me know!
Tyler`,
    time: "Feb 19",
    read: false,
    label: "Needs Reply",
  },
  {
    id: "27",
    from: "Compliance Alert",
    fromEmail: "compliance@fractionteam.com",
    subject: "KYC incomplete: 2 new buyers blocked before funding",
    body: `Hi Leif,

Two buyers in your pipeline have incomplete KYC verification and are currently blocked from completing their purchases:

1. Aisha Patel — missing government ID (back side)
2. Kevin Morrow — address verification failed (3 attempts)

Both purchases total $285,000 and have been pending for 6+ business days. Per policy, funds will be released back to buyers after 10 days if KYC is not resolved.

Please reach out to both buyers to prompt action, or escalate to the compliance team if they're unresponsive.

— Fraction Compliance`,
    time: "Feb 18",
    read: false,
    label: "Urgent",
  },
  {
    id: "28",
    from: "Airbnb for Work",
    fromEmail: "business@airbnb.com",
    subject: "Your properties could earn more with Airbnb for Work",
    body: `Hi there,

Airbnb for Work connects your properties with corporate travelers — a high-value segment that books longer stays and treats properties with care.

Properties on our business travel program earn 22% more on average and see higher review scores.

Getting started takes 5 minutes. No extra fees.

[Learn more]

Unsubscribe | Airbnb Ireland UC, 8 Hanover Quay, Dublin`,
    time: "Feb 18",
    read: true,
    label: "Ignore",
  },
  {
    id: "29",
    from: "Kevin Morrow",
    fromEmail: "k.morrow@morrow-holdings.com",
    subject: "Re: My KYC verification — this is frustrating",
    body: `Leif,

I've tried to verify my address three times now and keep getting rejected. My passport, utility bill, and bank statement are all in order. This is a $150,000 purchase and I'm being treated like a suspicious character.

I spoke with your compliance team and they were unhelpful. I have a board meeting on Friday and I need this resolved before then or I'm walking.

Can you personally intervene here? I need a human to look at my documents, not an algorithm.

Kevin Morrow
Morrow Holdings`,
    time: "Feb 18",
    read: false,
    label: "Urgent",
  },
  {
    id: "30",
    from: "Real Estate Weekly",
    fromEmail: "digest@reweeekly.io",
    subject: "📊 Market digest: Luxury vacation home prices up 8% in Q4",
    body: `REAL ESTATE WEEKLY — Market Digest

KEY DATA THIS WEEK:
• Luxury vacation home prices rose 8.2% in Q4 2025 vs Q4 2024
• Palm Springs leads appreciation at +14% YoY
• Miami Beach fractional inventory down 40% — supply crunch continues
• Mortgage rates stable at 6.7% — refinance activity picking up

FEATURED REPORT: "The Case for Co-Ownership in a High-Rate Environment" — download free at reweeekly.io

Unsubscribe | Real Estate Weekly, 200 Park Ave, New York NY`,
    time: "Feb 17",
    read: true,
    label: "FYI",
  },
];
