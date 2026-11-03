'use client'

import { useState } from 'react'
import type { InboxItem } from '@/lib/api/types'

/** The e-mail's own text (quoted history stripped by the API), expandable when long, with its photos. */
export default function InboxMessageBody({ item }: { item: InboxItem }) {
  const [expanded, setExpanded] = useState(false)
  const long = item.bodyText.length > 600 || item.bodyText.split('\n').length > 8
  return (
    <div className="mt-2">
      <p className={expanded || !long ? 'whitespace-pre-wrap text-sm text-cacau/90' : 'line-clamp-6 whitespace-pre-wrap text-sm text-cacau/90'}>{item.bodyText}</p>
      {long && <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-1 text-xs text-cacau/60 underline-offset-2 hover:underline">{expanded ? 'Mostrar menos' : 'Mostrar tudo'}</button>}
      {item.attachments.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {item.attachments.map((a) => (
            <li key={a.id}>
              <a href={a.url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
