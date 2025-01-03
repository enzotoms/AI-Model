import { Link, Outlet } from "react-router-dom"
import "./rootLayout.css";
import { ClerkProvider, SignedIn, UserButton } from '@clerk/clerk-react';
import { QueryClient,QueryClientProvider} from '@tanstack/react-query'


// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk publishable key to the .env.local file');
}



// Create a client
const queryClient = new QueryClient();

const RootLayout = () => {
  return (
    // Add the ClerkProvider component to your layout
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <QueryClientProvider client={queryClient}>
          <div className="rootLayout">
        <header>
            <Link to= "/" className="logo">
                <img src="/pngwing.com.png" alt="" />
                <span>QuantumMind</span>
            </Link>

            <div className="user">
            <SignedIn>
                <UserButton />
            </SignedIn>
            </div>
        </header>

        <main>
            <Outlet />
        </main>
    </div>
    </QueryClientProvider>
    </ClerkProvider>
  );
};

export default RootLayout;