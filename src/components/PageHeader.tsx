import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { useContext } from 'react'
import { ThemeContext } from '../contexts'

type PageHeaderProps = {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  const { theme, toggleTheme } = useContext(ThemeContext)

    return (
      <div className="w-full dark:bg-neutral-900">
      <div className="mx-auto flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-0 xl:max-w-11/12 2xl:max-w-10/12">
        <div>
          <h2 className="text-xl text-neutral-800 font-medium tracking-tight dark:text-neutral-100">{title}</h2>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-accent-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400"
              aria-label="Toggle dark mode"
            >
              {theme === 'light'
                ? <FontAwesomeIcon icon={faMoon} className="text-lg" />
                : <FontAwesomeIcon icon={faSun} className="text-lg" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-x-2 text-right text-base leading-4 dark:text-neutral-100">
              <div className="text-neutral-800 font-medium">Person Name</div>
              <div className="text-accent-700 text-sm dark:text-neutral-400">Company Name</div>
            </div>
            <div className="flex items-center rounded-full bg-accent-200 px-2 py-1 text-lg font-semibold text-accent-800 dark:bg-neutral-700 dark:text-neutral-100">PN</div>
          </div>
        </div>
      </div>
    </div>
  )
}

