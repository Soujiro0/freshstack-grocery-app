export default function EmptyState({ icon, title, description, action }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {icon && (
        <div
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-warm-gray"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h2 className="text-base font-bold text-warm-dark">{title}</h2>
      {description && (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-warm-gray">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
