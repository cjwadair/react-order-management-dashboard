import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-semibold tracking-tight">Page not found</h2>
      <p className="mt-2 text-base text-slate-600">The page you requested does not exist.</p>
      <Link
        className="mt-5 inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-base font-medium text-white hover:bg-slate-800"
        to="/orders"
      >
        Go to orders
      </Link>
    </section>
  )
}