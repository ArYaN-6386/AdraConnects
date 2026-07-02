import { supabase } from '../../lib/supabase.js'
import { useResources } from '../../hooks/useResources.js'
import { formatFileSize, formatChatTime } from '../../lib/format.js'

export default function ResourcesTab({ clubId }) {
  const { resources, loading } = useResources(clubId)

  if (loading) return <div className="side-note">Loading resources…</div>
  if (resources.length === 0) {
    return (
      <div className="side-note center">
        No resources yet — attach 📎 files or images in the club chat and they'll show up here.
      </div>
    )
  }

  return (
    <div className="resources-list">
      {resources.map((r) => {
        const url = supabase.storage.from('attachments').getPublicUrl(r.attachment_path).data.publicUrl
        const isImage = r.attachment_type?.startsWith('image/')
        return (
          <a key={r.id} className="resource-item" href={url} target="_blank" rel="noreferrer">
            {isImage ? (
              <img className="resource-thumb" src={url} alt={r.attachment_name} loading="lazy" />
            ) : (
              <span className="resource-icon">📄</span>
            )}
            <span className="picker-grow">
              <span className="picker-name">{r.attachment_name}</span>
              <span className="picker-sub">
                {formatFileSize(r.attachment_size)} · {r.sender?.full_name} ·{' '}
                {formatChatTime(r.created_at)}
              </span>
            </span>
            <span className="file-download">⬇</span>
          </a>
        )
      })}
    </div>
  )
}
