import './App.scss';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Dashboard from './components/dashboard';
import ErrorPage from './components/common/error-page';
import Contact from './components/contact';
import About from './components/about';
import LandingPage from './components/landing-page';
import Login from './components/login';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  { 
    path: "dashboard", 
    element: <Dashboard /> 
  },
  {
    path: "contact",
    element: <Contact />,
  },
  {
    path: "about",
    element: <About />,
  },
  {
    path: "login",
    element: <Login />,
  },
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
