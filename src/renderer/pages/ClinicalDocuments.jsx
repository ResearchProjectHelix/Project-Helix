import { useState } from "react";

import DocumentList from "../components/documents/DocumentList";

import UploadDocumentModal from "../components/documents/UploadDocumentModal";

import DocumentPreview from "../components/documents/DocumentPreview";

export default function ClinicalDocuments() {

    const [documents, setDocuments] = useState([]);

    const [preview, setPreview] = useState(null);

    const [showUpload, setShowUpload] = useState(false);

    function addDocument(doc) {

        setDocuments(prev => [...prev, doc]);

    }

    return (

        <div>

            <h1>Clinical Documents</h1>

            <button
                onClick={() => setShowUpload(true)}
            >
                Upload Document
            </button>

            <DocumentList

                documents={documents}

                onPreview={setPreview}

            />

            {showUpload && (

                <UploadDocumentModal

                    onSave={addDocument}

                    onClose={() => setShowUpload(false)}

                />

            )}

            <DocumentPreview

                document={preview}

                onClose={() => setPreview(null)}

            />

        </div>

    );

}