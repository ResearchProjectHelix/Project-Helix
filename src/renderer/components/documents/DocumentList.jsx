import DocumentCard from "./DocumentCard";

export default function DocumentList({
    documents,
    onPreview
}) {

    if (!documents.length) {
        return (
            <p>No clinical documents uploaded.</p>
        );
    }

    return (
        <div className="document-list">

            {documents.map(doc => (

                <DocumentCard
                    key={doc.id}
                    document={doc}
                    onPreview={onPreview}
                />

            ))}

        </div>
    );

}