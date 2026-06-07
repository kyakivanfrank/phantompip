# GhostAI Trading Platform - Frontend

A production-ready, high-end Forex/AI trading platform frontend built with modern web technologies.

## 🚀 Features

- **Professional Trading Dashboard**: Real-time market data visualization and comprehensive analytics
- **Advanced Trading Terminal**: Multi-column layout with live candlestick charts, open positions, and execution controls
- **Responsive Design**: Fully responsive from mobile to desktop with optimized layouts
- **Dark Mode**: Premium dark-mode aesthetic with custom color scheme designed for trading platforms
- **Real-time Charts**: Powered by Recharts for smooth, performant data visualization
- **Smooth Animations**: Framer Motion animations for polished UI transitions
- **Modern Architecture**: Built with Next.js App Router and TypeScript for type safety

## 📊 Pages & Sections

### Public Pages
- **Landing Page** (`/`): Hero section, feature grid, pricing tiers, live performance stats, and CTA
- **Login** (`/login`): Professional login form with OAuth options
- **Sign Up** (`/signup`): Registration form with password requirements

### Dashboard Pages (Protected)
- **Dashboard Home** (`/dashboard`): Account overview, key metrics, balance history, asset allocation, performance charts
- **Trading Terminal** (`/terminal`): Live trading interface with chart, open positions, order execution panel, and order history
- **Analytics** (`/analytics`): Comprehensive performance analytics, trade history with filters, and trading statistics

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom dark theme
- **Charts**: [Recharts](https://recharts.org/) for data visualization
- **Icons**: [Lucide React](https://lucide.dev/) for consistent iconography
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth transitions
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives / shadcn/ui patterns

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Setup

1. **Clone the repository** (if applicable):
```bash
git clone <repository-url>
cd ghostai-trading-platform
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Configure environment variables**:
```bash
# Copy and edit .env.local
cp .env.local.example .env.local
```

4. **Run development server**:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Project Structure

```
ghostai-trading-platform/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── globals.css                # Global styles
│   ├── (auth)/                    # Authentication route group
│   │   ├── layout.tsx             # Auth layout
│   │   ├── login/page.tsx         # Login page
│   │   └── signup/page.tsx        # Sign-up page
│   ├── dashboard/                 # Dashboard route group
│   │   ├── layout.tsx             # Dashboard layout (sidebar, header)
│   │   └── page.tsx               # Dashboard home
│   ├── terminal/                  # Trading terminal
│   │   └── page.tsx               # Trading terminal page
│   └── analytics/                 # Analytics section
│       └── page.tsx               # Analytics & history page
├── components/                    # Reusable components (expandable)
├── lib/                          # Utility functions (expandable)
├── public/                       # Static assets
├── package.json                  # Project dependencies
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── next.config.js               # Next.js configuration
├── postcss.config.js            # PostCSS configuration
└── .env.local                   # Environment variables

```

## 🎨 Styling & Theme

The project uses **Tailwind CSS** with a custom dark theme configuration:

### Color Palette
- **Primary**: Slate grays (`#0a0e27` to `#f3f4f6`)
- **Accents**: 
  - Green: `#10b981` (profits)
  - Red: `#ef4444` (losses)
  - Blue: `#3b82f6` (primary action)
  - Purple: `#a855f7` (highlights)
  - Cyan: `#06b6d4` (glows)

### Tailwind Components
Predefined components in `globals.css`:
- `.card` - Standard card styling
- `.card-hover` - Interactive card with hover effects
- `.input` - Form input styling
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.badge-success` / `.badge-danger` - Status badges
- `.text-glow` - Glowing text effect

## 🚀 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Key Features & Component Patterns

1. **Page Animations**: All pages use Framer Motion for enter/exit animations
2. **Responsive Grid Layouts**: Mobile-first responsive design with grid system
3. **Data Visualization**: Recharts components for performance tracking
4. **Form Handling**: Controlled inputs with basic state management
5. **Navigation**: Next.js Link component for client-side routing

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Security Considerations

For production deployment:
1. Implement proper authentication (JWT, OAuth)
2. Add rate limiting on API endpoints
3. Use HTTPS only
4. Implement CSRF protection
5. Sanitize user inputs
6. Use secure headers (CSP, X-Frame-Options, etc.)
7. Implement proper error handling
8. Add request validation

## 🚢 Deployment

### Recommended Platforms
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS (Amplify, CloudFront)**
- **Digital Ocean**
- **Heroku**

### Deployment Checklist
- [ ] Set production environment variables
- [ ] Run `npm run build` and verify no errors
- [ ] Test all pages in production mode
- [ ] Set up proper logging
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and analytics
- [ ] Test on multiple devices/browsers

## 📈 Performance Optimization

The project includes several optimizations:
- Next.js Image optimization (when used)
- CSS minification via Tailwind
- Tree-shaking for unused imports
- Code splitting per route
- Optimized animations with Framer Motion

## 🔄 State Management

Currently uses React hooks (`useState`, `useCallback`, etc.). For larger state needs, consider:
- Zustand (recommended)
- Redux Toolkit
- Jotai
- Recoil

## 🔗 API Integration

Replace mock data with real API calls. Example pattern:
```typescript
// In components
const [data, setData] = useState(null);

useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`)
    .then(res => res.json())
    .then(data => setData(data));
}, []);
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/en-US/api)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Contributing

For contributions, follow these guidelines:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - Feel free to use for your projects

## ⚠️ Disclaimer

This is a frontend trading platform template. For any real trading functionality:
- Ensure proper licensing and regulatory compliance
- Implement secure backend authentication
- Use established trading APIs (Alpaca, Interactive Brokers, etc.)
- Never commit real API keys to version control
- Test thoroughly in sandbox environments first

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Module not found errors
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Tailwind styles not applied
```bash
npm run build
```

## 📧 Support

For issues or questions, please refer to the documentation or create an issue in the repository.

---

**Happy Trading! 🚀**
