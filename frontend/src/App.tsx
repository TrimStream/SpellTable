import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './layouts/Layout/Layout';
import { Home } from './pages/Home/Home';
import { Scenarios } from './pages/Scenarios/Scenarios';
import { BoardPage } from './pages/BoardPage/BoardPage';
import { About } from './pages/About/About';
import { Rules } from './pages/Rules/Rules';
import { Tutorial } from './pages/Tutorial/Tutorial';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotFound } from './pages/NotFound/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Settings } from './pages/Settings/Settings';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Layout />,
		children: [
			{ index: true, element: <Home /> },
			{ path: 'scenarios', element: <Scenarios /> },
			{ path: 'about', element: <About /> },
			{ path: 'rules', element: <Rules /> },
			{ path: 'tutorial', element: <Tutorial /> },
			{ path: 'dashboard', element: <Dashboard /> },
			{ path: 'settings', element: <Settings /> },
			{ path: 'board/:id', element: <BoardPage /> },
			{ path: '*', element: <NotFound /> },
			// TODO V?: Add deck route when deck evaluation is built
			// { path: 'deck', element: <Deck /> },
		],
	},
	{
		path: '/board/:id',
		element: <BoardPage />,
	},
]);

export default function App() {
	return (
		<ErrorBoundary>
			<ThemeProvider>
				<AuthProvider>
					<RouterProvider router={router} />
				</AuthProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}
