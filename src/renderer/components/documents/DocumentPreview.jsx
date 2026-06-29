export default function DocumentPreview({
    document,
    onClose
}) {

    if (!document) return null;

    return (

        <div className="preview-overlay">

            <div className="preview-window">

                <h2>{document.name}</h2>

                <hr />

                <p><strong>Category:</strong> {document.category}</p>

                <p><strong>Type:</strong> {document.type}</p>

                <p><strong>Date:</strong> {document.date}</p>

                <p><strong>Clinician:</strong> {document.clinician}</p>

                <p><strong>Hospital:</strong> {document.hospital}</p>

                <p><strong>Notes:</strong></p>

                <p>{document.notes || "None"}</p>

                <button onClick={onClose}>
                    Close
                </button>

            </div>

        </div>

    );

}