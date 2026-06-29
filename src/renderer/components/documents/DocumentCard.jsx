export default function DocumentCard({ document, onPreview }) {
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

      <button onClick={() => onPreview(document)}>
        Preview
      </button>
    </div>
  );
}