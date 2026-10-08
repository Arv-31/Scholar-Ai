import type { ReactNode } from 'react'

type Props = {
  eyebrow: string
  title: string
  action?: ReactNode // optional button on the right
}

// The small label + big heading at the top of each page.
export default function PageHeader({ eyebrow, title, action }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      </div>
      {action}
    </header>
  )
}
