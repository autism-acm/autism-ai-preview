# AUtism GOLD - AI-Powered Web3 dApp

## Overview
AUtism GOLD is a Web3 decentralized application (dApp) that integrates AI-powered chat functionality with Solana blockchain. It features a tiered token system where users interact with an AI assistant, powered by Google's Gemini API, with service tiers determined by their token holdings. The project aims to provide an innovative AI chat experience within a Web3 ecosystem, leveraging blockchain for user authentication and token-based access.

## Recent Changes
- **November 18, 2025**: Updated AI personality names ✅
  - **GENI-Autist** renamed to **Level 1 ASD**
  - **Superautist** renamed to **Savantist**
  - Updated across all components (WelcomePopup, ChatInterface) and documentation
- **November 18, 2025**: Fixed Upgrade modal alignment and close button styling ✅
  - **Modal Centering**: Removed custom close button that was interfering with modal positioning - Upgrade screen now centers properly on all devices
  - **Close Button Redesign**: Styled default X close icon with dark background (#202020), semi-transparent white icon (#ffffff64), and subtle inset shadow (inset 0 1px 2px #00000025)
  - **Hover State**: Added smooth hover effect with slightly lighter background (#2a2a2a)
- **November 18, 2025**: GitHub import to Replit - Environment setup completed ✅
  - **Fresh Import**: Successfully imported project from GitHub repository
  - **Dependencies**: Installed all 564 npm packages
  - **Database**: Connected to Replit PostgreSQL database and pushed schema with Drizzle ORM
  - **Workflow**: Configured "Start application" workflow on port 5000 (unified frontend + backend)
  - **Deployment**: Set up Autoscale deployment with build and production commands
  - **Environment**: Configured GEMINI_API_KEY for AI functionality
  - **Git Configuration**: Created .gitignore for Node.js project
  - **Verification**: Application tested and confirmed working - welcome popup displays, AI chat ready
- **November 17, 2025**: Three new features added - Upgrade modal close button, typewriter placeholder, and welcome popup ✅
  - **Upgrade Modal Close Button**: Added custom close button with white background (#ffffff) and black ChevronDown icon (#000000) in top-right corner. Fixed selector to specifically target Radix default button with `[&>button[data-radix-dialog-close]]:hidden` to avoid hiding custom button.
  - **Typewriter Effect for Placeholder**: Implemented dynamic typewriter effect for chatbox placeholder text with 6 rotating phrases:
    - "explain meme coins like im sped"
    - "do my homework 4 me, heres screnshot"
    - "i lost all my moni in memcoin pls be frends with me now, my mommy is mad at me"
    - "write me post for my memcoin heres a pictur"
    - "is this ca gud? no rug? check rugscan pls"
    - "Ask AUlon anything..." (final phrase with 5-second pause before cycling)
    - Progressive deletion speed: starts slow, gets progressively faster as it deletes
  - **New User Welcome Popup**: Created welcome modal that appears on first visit, explaining AUtism AI features:
    - AI Chat Assistant with multiple personas
    - Token-Based Tiers ($AU holdings unlock features)
    - Multiple AI Personalities (AUtistic AI, Level 1 ASD, Savantist)
    - Web3 Integration (Solana wallet connection)
    - Uses localStorage to show only once per browser
    - Gold-bordered design with feature grid and "Let's Go!" button
- **November 17, 2025**: Personality Selection popover glitch FIXED and button sizing normalized ✅
  - **FIXED Personality Selection popover glitch on ALL DEVICES**: Changed from CSS hiding (`hidden`/`md:hidden`) to conditional rendering (`{!isMobile && ...}` / `{isMobile && ...}`). Root cause: both desktop and mobile popovers were mounted simultaneously, sharing the same `personaMenuOpen` state, causing the hidden popover to immediately close the visible one. Now only ONE popover instance exists at a time.
  - **All icon buttons now perfectly square**: Added `size="icon"` prop and enforced exact dimensions `!h-8 !w-8 !min-w-[32px] !min-h-[32px]` on Personality Selection, File Upload, Microphone, and Send buttons
  - **Send button padding normalized**: Added `size="icon"` to send button to match Personality Selection button padding
  - **Removed icon buttons from mobile chatbox**: Personality Selector, File Upload, and Microphone buttons hidden from chatbox on mobile (available below chatbox)
  - **Desktop keeps all buttons**: Icon buttons remain visible in chatbox on desktop/tablet (md breakpoint and above)
  - **Max-width constraints**: Added `max-w-[calc(100vw-180px)]` to mobile carousel container to prevent viewport overflow
  - **Flex shrinking fix**: Added `min-w-0` to textarea and `max-w-full` to containers for proper responsive behavior
- **November 17, 2025**: Fresh GitHub import - Replit environment setup completed ✅
  - **GitHub Import**: Successfully cloned and configured project from GitHub
  - **Dependencies**: Installed all npm packages (564 packages from package.json)
  - **Database**: Connected to existing PostgreSQL database and pushed schema successfully with Drizzle ORM
  - **Workflow**: Configured development workflow running on port 5000 (unified frontend + backend)
  - **Deployment**: Configured Replit Autoscale deployment with `npm run build` and `npm start` commands
  - **Git Configuration**: Created comprehensive .gitignore for Node.js project
  - **Vite Configuration**: Verified proper host settings (0.0.0.0:5000 with allowedHosts: true) for Replit proxy
  - **Server Configuration**: Confirmed Express server running on port 5000 with Vite dev server integration
  - **Verification**: Application tested and confirmed working - AI chat interface loads successfully
- **November 17, 2025**: Major UI improvements - Grok-inspired chatbox, URL detection fix, sidebar swap, and button hover enhancements ✅
  - **Chatbox Grok-style redesign**: Increased border radius from 4px to 24px for a more modern, rounded appearance matching Grok.com
  - **Smaller, refined buttons**: Reduced all chatbox button heights from 40px (h-10) to 32px (h-8) with smaller icons (14px instead of 16px)
  - **Button hover enhancement**: Added 32px border radius on hover/click for chatbox buttons (attachment, microphone, send)
  - **Reduced pulse effect**: Decreased microphone recording pulse animation from 10px to 6px for a more subtle effect
  - **URL detection fix**: Fixed glitch where typing "Replit.com" would show embedded URLs for "Replit.c", "Replit.co" - now only detects complete URLs after user types space or newline
  - **Complete sidebar swap and overlay redesign**:
    - **Swapped positions**: InfoSidebar (Autism Capital Markets branding, token balance, upgrade info) now on LEFT side; chat history sidebar now on RIGHT side
    - **Both sidebars as overlays**: Fixed positioning with 8px margins (InfoSidebar: left/top/bottom margins; chat sidebar: right/top/bottom margins)
    - **InfoSidebar styling**: 2px border radius, removed overflow scrollbar with `overflow: hidden`
    - **Toggle button positions**: InfoSidebar toggle on left center, chat sidebar toggle on bottom right
    - **Fixed collapse behavior**: Zero width and no pointer events when hidden to prevent interaction blocking
    - **Toggle icons**: Face correct directions (ChevronRight for left sidebar when collapsed, ChevronLeft for right sidebar when collapsed)
  - All changes tested and verified working correctly
- **November 17, 2025**: Mobile enhancements and button interaction improvements ✅
  - **Mobile carousel for suggested prompts**: Implemented swipeable carousel using Embla for suggested prompt buttons on mobile devices
  - **Mobile settings enhancements**: Added DiGen button (128px border radius) and Token Address display (B1oE...pump, fully copyable) to mobile settings dropdown, positioned above Memory Bank
  - **Button radius persistence**: Implemented state-driven button styling where chatbox buttons retain 32px border radius when active:
    - File upload button: Retains 32px radius while uploading or when attachments are present
    - Microphone button: Retains 32px radius while recording is active
    - Send button: Retains 32px radius while message is pending
    - Personality selector: Always maintains 32px radius
    - Modified Button component: Removed conflicting `rounded-md` from ghost variant to enable custom radius classes
  - **Square send button**: Fixed send button to be perfectly square (32px×32px) using `!h-8 !w-8 !min-h-[32px]` override
  - **Compact chatbox layout**: Repositioned placeholder text after microphone button to reduce chatbox height when input is empty
- **November 17, 2025**: Chatbox UX improvements and mobile overflow fixes ✅
  - **Uniform padding**: Fixed chatbox padding to be equal on all sides (12px) for consistent spacing around buttons and input
  - **Mobile layout optimization**: Repositioned Personality Selection, file upload, and microphone buttons LEFT of suggested prompts carousel on mobile to prevent overflow
  - **Textarea glitch fix**: Eliminated dual-layout system that caused input box switching; implemented single growing textarea with smooth focus transitions
  - **Focus-based button sizing**: Personality selector now shrinks to icon-only (32x32px) when user clicks the input field, providing more typing space
  - **Square icon buttons**: All icon buttons (file upload, microphone, send) are now perfectly square (32x32px) with consistent sizing
  - **Enhanced UX**: Users can now type continuously without layout shifts or interruptions, with textarea growing smoothly as needed
- **November 17, 2025**: Complete viewport overflow elimination ✅
  - **Box-border width calculations**: Applied `box-border` throughout all container levels (outer wrapper, chatbox, mobile prompt section) to ensure padding is included in width calculations
  - **Carousel CSS override**: Set `--slide-gap: 0px` inline style to neutralize Embla carousel's built-in gap spacing
  - **Carousel margin elimination**: Changed `CarouselContent` from `-ml-2` to `ml-0` and added controlled `gap-2` for consistent spacing
  - **Carousel item padding removal**: Changed `CarouselItem` from `pl-2` to `pl-0` to remove all inherited padding
  - **Proper scrolling**: Changed carousel wrapper from `overflow-hidden` to `overflow-x-auto` for proper horizontal scrolling without viewport overflow
  - **Mobile button alignment**: Icon buttons (Personality, File Upload, Microphone) positioned horizontally (`flex items-center gap-1`) left of carousel with `shrink-0` to prevent wrapping
  - **Verified at ≤320px**: All elements confirmed to stay within viewport at narrowest mobile widths with no horizontal scroll on the page itself

## User Preferences
- None specified yet

## System Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL (via Neon serverless) with Drizzle ORM
- **AI Integration**: Google Gemini API
- **Blockchain**: Solana Web3.js
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Session Management**: Express sessions with fingerprinting

### Project Structure
- `client/`: React frontend (components, hooks, utilities, pages, static assets)
- `server/`: Express backend (middleware, utilities, entry point, API routes)
- `shared/`: Shared TypeScript types and Drizzle database schema
- `attached_assets/`: Project assets and documentation

### Database Schema
The PostgreSQL database includes tables for:
- **users**: Admin accounts
- **sessions**: User sessions, wallet addresses, and tier information
- **conversations**: Chat threads
- **messages**: Individual chat messages
- **audioCache**: TTS audio file cache
- **rateLimits**: Usage tracking per tier
- **webhookLogs**: Integration logging

### Key Features
1.  **Tiered Token System**: Access levels (Free Trial, Electrum, Pro, Gold) based on $AU token holdings.
2.  **AI Chat Interface**: Conversation history powered by Google Gemini.
3.  **Solana Wallet Integration**: Connects to verify token holdings.
4.  **Rate Limiting**: Per-session usage tracking with automatic resets based on tier.
5.  **Admin Dashboard**: For user management and system monitoring.
6.  **UI/UX**: Features a custom font (Be Vietnam Pro), collapsible sidebars with hover-expansion, dynamic chat input adjustments, and a refined aesthetic with specific color schemes and border treatments.
7.  **Routing**: Application accessible at both `/` and `/ai` routes.

### Deployment and Development
-   The application runs on a single port (5000) for both frontend and backend within the Replit environment.
-   Vite's development server is proxied through Express.
-   HMR client port is configured for Replit compatibility.
-   Deployment uses Replit Autoscale with `npm run build` and `npm start` commands.

## External Dependencies
-   **Google Gemini API**: For AI chat functionality.
-   **Solana Blockchain**: Integrated via Solana Web3.js for wallet connection and token verification.
-   **PostgreSQL (Neon serverless)**: Database solution.
-   **ElevenLabs API**: (Optional) For text-to-speech functionality.