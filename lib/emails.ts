export type EmailLabel = "Urgent" | "Needs Reply" | "FYI" | "Ignore";

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  body: string;
  time: string;
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
];
