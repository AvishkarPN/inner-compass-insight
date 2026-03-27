import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

// #28: Use theme tokens instead of hard-coded bg-gray-100/text-blue-500
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="text-7xl font-bold text-muted-foreground/40 select-none" aria-hidden="true">404</div>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground max-w-xs mx-auto">
          The page <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{location.pathname}</code> doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-2"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
