import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';

// Lazy load pages for code splitting
const Customers = lazy(() => import('./pages/customers/Customers'));
const Orders = lazy(() => import('./pages/orders/Orders'));
const Quotations = lazy(() => import('./pages/quotations/Quotations'));
const Planning = lazy(() => import('./pages/planning/Planning'));
const Production = lazy(() => import('./pages/production/Production'));
const Inventory = lazy(() => import('./pages/inventory/Inventory'));
const Invoices = lazy(() => import('./pages/invoices/Invoices'));
const Users = lazy(() => import('./pages/users/Users'));
const Costing = lazy(() => import('./pages/costing/Costing'));
const ShopFloor = lazy(() => import('./pages/shop-floor/ShopFloor'));
const JobDetails = lazy(() => import('./pages/shop-floor/JobDetails'));
const StartStage = lazy(() => import('./pages/shop-floor/StartStage'));
const CompleteStage = lazy(() => import('./pages/shop-floor/CompleteStage'));
const IssueMaterial = lazy(() => import('./pages/shop-floor/IssueMaterial'));
const Quality = lazy(() => import('./pages/quality/Quality'));
const Dispatch = lazy(() => import('./pages/dispatch/Dispatch'));
const WastageAnalytics = lazy(() => import('./pages/wastage/WastageAnalytics'));
const WorkflowPage = lazy(() => import('./pages/workflow/WorkflowPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Layout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="text-lg">Loading page...</div>
          </div>
        }
      >
        {children}
      </Suspense>
    </Layout>
  ) : (
    <Navigate to="/login" />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <PrivateRoute>
                <Customers />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/quotations"
            element={
              <PrivateRoute>
                <Quotations />
              </PrivateRoute>
            }
          />
          <Route
            path="/planning"
            element={
              <PrivateRoute>
                <Planning />
              </PrivateRoute>
            }
          />
          <Route
            path="/production"
            element={
              <PrivateRoute>
                <Production />
              </PrivateRoute>
            }
          />
          <Route
            path="/workflow/:jobId"
            element={
              <PrivateRoute>
                <WorkflowPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <PrivateRoute>
                <Inventory />
              </PrivateRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <Invoices />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/costing"
            element={
              <PrivateRoute>
                <Costing />
              </PrivateRoute>
            }
          />
          <Route
            path="/shop-floor"
            element={
              <PrivateRoute>
                <ShopFloor />
              </PrivateRoute>
            }
          />
          <Route
            path="/shop-floor/job/:id"
            element={
              <PrivateRoute>
                <JobDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/shop-floor/job/:id/start-stage"
            element={
              <PrivateRoute>
                <StartStage />
              </PrivateRoute>
            }
          />
          <Route
            path="/shop-floor/job/:id/complete-stage/:stageHistoryId"
            element={
              <PrivateRoute>
                <CompleteStage />
              </PrivateRoute>
            }
          />
          <Route
            path="/shop-floor/job/:id/issue-material"
            element={
              <PrivateRoute>
                <IssueMaterial />
              </PrivateRoute>
            }
          />
          <Route
            path="/quality"
            element={
              <PrivateRoute>
                <Quality />
              </PrivateRoute>
            }
          />
          <Route
            path="/dispatch"
            element={
              <PrivateRoute>
                <Dispatch />
              </PrivateRoute>
            }
          />
          <Route
            path="/wastage-analytics"
            element={
              <PrivateRoute>
                <WastageAnalytics />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
