import { useState } from "react";
import { createDocument } from "../../models/document";

export default function UploadDocumentModal({
    onSave,
    onClose
}) {

    const [form, setForm] = useState({

        name: "",

        category: "Imaging",

        type: "CT",

        bodyPart: "",

        clinician: "",

        hospital: "",

        date: "",

        notes: ""

    });

    function handleChange(e) {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    }

    function submit() {

        onSave(createDocument(form));

        onClose();

    }

    return (

        <div className="modal">

            <h2>Upload Clinical Document</h2>

            <input
                name="name"
                placeholder="Document Name"
                onChange={handleChange}
            />

            <input
                name="bodyPart"
                placeholder="Body Part"
                onChange={handleChange}
            />

            <input
                name="clinician"
                placeholder="Clinician"
                onChange={handleChange}
            />

            <input
                name="hospital"
                placeholder="Hospital"
                onChange={handleChange}
            />

            <input
                type="date"
                name="date"
                onChange={handleChange}
            />

            <textarea
                name="notes"
                placeholder="Notes"
                onChange={handleChange}
            />

            <button onClick={submit}>
                Save
            </button>

            <button onClick={onClose}>
                Cancel
            </button>

        </div>

    );

}