import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OrdersPage } from '../pages/OrdersPage'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDolly } from '@fortawesome/free-solid-svg-icons'
import { faGauge } from '@fortawesome/free-solid-svg-icons'

export function App() {
  return (
    <div className="flex min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      
      <header className="border-r w-24 min-h-screen border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex flex-col max-w-6xl items-center justify-between px-4 pb-4 sm:px-6 lg:px-8">
          <h1 className="text-xl text-accent-900 font-semibold tracking-tight h-12 flex items-center">Logo</h1>
          <nav className="flex flex-col items-center gap-3 text-base font-medium text-accent-900 mt-6 dark:text-slate-400">
            <NavLink
              to="/"
              className={({ isActive }) =>`flex flex-col gap-y-1 items-center rounded-md px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'bg-white dark:bg-slate-800' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <FontAwesomeIcon
                    icon={faGauge}
                    className={`text-2xl text-center ${isActive ? 'text-brand-500 bg-white dark:bg-slate-800' : 'text-accent-700'}`}
                  />
                  <div className="text-xs">Dashboard</div>
                </>
              )}
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>`flex flex-col gap-y-1 items-center w-full rounded-md px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'bg-white shadow-md shadow-slate-200 border border-slate-200 dark:bg-slate-800' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <FontAwesomeIcon
                    icon={faDolly}
                    className={`text-2xl text-center ${isActive ? 'text-brand-500 bg-white dark:bg-slate-800' : 'text-accent-700'}`}
                  />
                  <div className="text-xs">Orders</div>
                </>
              )}
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 min-w-0 w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}