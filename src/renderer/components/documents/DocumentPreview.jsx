export default function DocumentPreview({ document, onClose }) {
  if (!document) return null;

  const isPdf = document.fileName && document.fileName.toLowerCase().endsWith('.pdf');
  const isImage = document.fileName && /\.(png|jpe?g)$/i.test(document.fileName);

  return (
    <div className="preview-overlay">
      <div className="preview-window">
        <h2>{document.name}</h2>
        <hr />
        <p><strong>Category:</strong> {document.category}</p>
        <p><strong>Type:</strong> {document.type}</p>
        <p><strong>Date:</strong> {document.date || 'Not recorded'}</p>
        <p><strong>Clinician:</strong> {document.clinician || 'Unknown'}</p>
        <p><strong>Hospital:</strong> {document.hospital || 'Unknown'}</p>
        <p><strong>Notes:</strong></p>
        <p>{document.notes || 'None'}</p>

        {document.fileUrl ? (
          <div className="preview-file">
            {isPdf && (
              <iframe
                src={document.fileUrl}
                title={document.name}
                className="preview-frame"
              />
            )}
            {isImage && (
              <img src={document.fileUrl} alt={document.name} className="preview-image" />
            )}
            {!isPdf && !isImage && (
              <a href={document.fileUrl} target="_blank" rel="noreferrer">
                Open file
              </a>
            )}
          </div>
        ) : (
          <p><em>No file attached to this record.</em></p>
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}