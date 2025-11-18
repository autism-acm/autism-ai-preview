# AUtism GOLD - Design Guidelines

## Design Approach: User-Specified Exact Implementation

**Critical**: The user has provided precise UI designs via embedded files. Implementation MUST match the provided designs exactly. File names indicate section purposes - refer to them for accurate implementation.

## Typography System

**Primary Font**: Be Vietnam Pro (LOCALLY HOSTED - no CDN)

**Letter Spacing Formula**:
- Base: -2.4px at 4rem (64px)
- Scaling: Proportional to font size
  - 4rem (64px): -2.4px
  - 2rem (32px): -1.2px
  - 1rem (16px): -0.6px
  - 3rem (48px): -1.8px

## Layout Architecture

**Responsive Strategy**: Use inline-flex CSS patterns throughout for maximum responsiveness
- Prioritize flexbox for all layout compositions
- Ensure seamless adaptation across all device sizes
- Maintain visual hierarchy at every breakpoint

## Key Application Sections

Based on provided UI files:
1. **Main Chat Interface**: AI interaction area with message input
2. **Wallet Connection**: Solana wallet integration (Phantom, Solflare)
3. **Tier Display**: Visual representation of Free Trial, Electrum, Pro, and Gold tiers
4. **Token Balance Indicator**: Real-time $AU holdings display
5. **Rate Limit Status**: Visual feedback on remaining messages/voice time
6. **Admin Dashboard** (/admin): Analytics, conversation logs, audio URL management

## Tier Presentation

**Free Trial**: 5 messages + 1 voice message every 4 hours
**Electrum**: 100k $AU - 20 msg/hr, 1hr voice/day - 14 days
**Pro**: 200k $AU - 40 msg/hr, 2hr voice/day
**Gold**: 300k $AU - 50 msg/hr, 4hr voice/day

Include prominent note: "Prices may increase"

## Critical Implementation Notes

- Match provided UI designs EXACTLY - do not deviate
- All cookies must use best security practices
- Responsive behavior is paramount
- Admin panel: cookie-based auth, no 2FA
- Voice/audio features must have clear visual indicators