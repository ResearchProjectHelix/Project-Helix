import DocumentCard from "./DocumentCard";

export default function DocumentList({
    documents,
    onPreview,
    onDelete
}) {

    if (!documents.length) {
        return (
            <div className="empty-state">
                No clinical documents uploaded for this category.
            </div>
        );
    }

    return (
        <div className="document-list">

            {documents.map(doc => (

                <DocumentCard
                    key={doc.id}
                    document={doc}
                    onPreview={onPreview}
                    onDelete={onDelete}
                />

            ))}

        </div>
    );

}