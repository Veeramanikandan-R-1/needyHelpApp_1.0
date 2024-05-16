import './App.css';
import Navbar from './components/common/navbar';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Dashboard from './components/dashboard';
import ErrorPage from './components/common/error-page';
import Contact from './components/contact';
import About from './components/about';
import LandingPage from './components/landing-page';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "about",
        element: <About />,
      },
    ],

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
