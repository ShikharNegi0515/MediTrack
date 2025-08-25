import { useState } from "react";

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        { q: "How do I add a medication?", a: "Go to 'Add Medication' and fill in details like name, dosage, and schedule." },
        { q: "How do reminders work offline?", a: "Reminders are cached locally with service workers and continue working offline." },
        { q: "Can I edit or delete a medication?", a: "Yes, navigate to your dashboard and select the edit/delete option." }
    ];

    return (
        <div className="max-w-xl mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Help & FAQ</h2>
            {faqs.map((faq, i) => (
                <div key={i} className="border-b py-2">
                    <button
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="flex justify-between w-full text-left font-medium"
                    >
                        {faq.q}
                        <span>{openIndex === i ? "-" : "+"}</span>
                    </button>
                    {openIndex === i && (
                        <p className="mt-2 text-gray-600">{faq.a}</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FAQ;
