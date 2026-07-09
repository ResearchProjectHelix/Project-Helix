export default function DocumentCard({ document, onPreview, onDelete }) {
  return (
    <div className="document-card">
      <div className="document-header">
        <h3>{document.name}</h3>

        <span className="document-category">
          {document.category}
        </span>
      </div>

      <div className="document-details">
        <p><strong>Type:</strong> {document.type}</p>
        <p><strong>Date:</strong> {document.date}</p>
        <p><strong>Clinician:</strong> {document.clinician || "Unknown"}</p>
        <p><strong>Hospital:</strong> {document.hospital || "Unknown"}</p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={() => onPreview(document)} style={{ flex: 1 }}>
          Preview
        </button>
        {onDelete && (
          <button onClick={() => onDelete(document)} className="secondary" style={{ flex: 1 }}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}