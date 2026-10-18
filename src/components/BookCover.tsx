import { useEffect, useState } from 'react'
import { getBookCover } from '../services/bookCoverService'
import type { BookKind } from '../types/database'

// A book's real cover (Open Library), or a coloured letter tile when there is none.
// Ember = fiction, green = non-fiction. `size` picks the big Today card or the small history row.
export default function BookCover({
  title,
  author,
  kind,
  size = 'large',
}: {
  title: string
  author: string
  kind: BookKind
  size?: 'large' | 'small'
}) {
  const cover = useBookCover(title, author)
  const [broken, setBroken] = useState(false)
  const box =
    size === 'large'
      ? 'h-32 w-[5.5rem] text-3xl shadow-[3px_3px_0_var(--color-ink)]'
      : 'h-14 w-10 text-lg shadow-[2px_2px_0_var(--color-ink)]'

  if (cover && !broken) {
    return (
      <img
        src={cover}
        alt={`Cover of ${title}`}
        loading="lazy"
        onError={() => setBroken(true)}
        className={`${box} shrink-0 border border-ink bg-paper object-cover`}
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className={`${box} grid shrink-0 place-items-center border border-ink font-display text-on-accent ${
        kind === 'fiction' ? 'bg-ember' : 'bg-green'
      }`}
    >
      {title.charAt(0)}
    </div>
  )
}

// Looks up the real cover; null while loading or if there is none (the letter shows instead).
function useBookCover(title: string, author: string): string | null {
  const [cover, setCover] = useState<{ key: string; url: string | null } | null>(null)
  const key = `${title}|${author}`
  useEffect(() => {
    let active = true
    getBookCover(title, author).then((url) => active && setCover({ key, url }))
    return () => {
      active = false
    }
  }, [title, author, key])
  return cover?.key === key ? cover.url : null
}
