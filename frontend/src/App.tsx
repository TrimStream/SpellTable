import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './layouts/Layout/Layout';
import { Home } from './pages/Home/Home';
import { Scenarios } from './pages/Scenarios/Scenarios';
import { BoardPage } from './pages/BoardPage/BoardPage';
import { About } from './pages/About/About';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'scenarios', element: <Scenarios /> },
      { path: 'about', element: <About /> },
      // TODO V2: Add rules route when Rules page is built
      // { path: 'rules', element: <Rules /> },
      // TODO V2: Add tutorial route when Tutorial page is built
      // { path: 'tutorial', element: <Tutorial /> },
      // TODO V?: Add deck route when deck evaluation is built
      // { path: 'deck', element: <Deck /> },
    ],
  },
  {
    // Board page lives outside Layout — no nav bar
    path: '/board/:id',
    element: <BoardPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}