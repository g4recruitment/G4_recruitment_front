import { LegalLayout } from '@/components/LegalLayout';

const sections = [
    {
        title: '1. Purpose of This Agreement',
        content: (
            <p>
                This Driver Agreement ("Agreement") sets out the specific obligations, standards, and conduct requirements that apply to all drivers registered on the G4 Car Service platform, in addition to the general Terms of Service. By submitting your application, you agree to abide by all terms contained in this Agreement. This Agreement supplements, and does not replace, the Terms of Service and Privacy Policy.
            </p>
        ),
    },
    {
        title: '2. Required Documentation',
        content: (
            <>
                <p>To be considered for approval, you must submit clear, legible, and current copies of all of the following documents:</p>
                <ul className="list-none space-y-2 mt-3">
                    {[
                        { label: "Driver's License", desc: "Valid government-issued driver's license, not expired." },
                        { label: 'TLC License', desc: 'Valid Taxi and Limousine Commission license for the applicable service area.' },
                        { label: 'Car Registration', desc: 'Current vehicle registration matching the vehicle you intend to use.' },
                        { label: 'Vehicle Inspection Report', desc: 'Up-to-date inspection certificate demonstrating roadworthiness.' },
                        { label: 'TLC Diamond Certificate', desc: 'TLC Diamond program certificate, where applicable.' },
                        { label: 'Insurance Files', desc: 'Proof of valid commercial auto insurance with adequate coverage limits.' },
                    ].map(({ label, desc }) => (
                        <li key={label} className="flex gap-2">
                            <span className="text-[#D4AF37] shrink-0 mt-0.5">-</span>
                            <span><span className="text-white font-medium">{label}:</span> {desc}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-3">All documents must be authentic, unaltered, and currently valid at the time of submission. Submission of fraudulent or expired documents will result in immediate disqualification and may be reported to the appropriate authorities.</p>
            </>
        ),
    },
    {
        title: '3. Profile Photo Standards',
        content: (
            <>
                <p>Your professional profile photo must meet the following requirements:</p>
                <ul className="list-none space-y-2 mt-3">
                    {[
                        'You must be clearly visible, facing the camera, with adequate lighting.',
                        'You must be wearing formal business attire (suit, dress shirt, or equivalent professional clothing).',
                        'No casual clothing, sportswear, hats, or sunglasses are permitted.',
                        'The photo must be taken recently and must accurately represent your current appearance.',
                        'No third parties, logos, or distracting backgrounds that undermine professionalism.',
                    ].map((item) => (
                        <li key={item} className="flex gap-2">
                            <span className="text-[#D4AF37] shrink-0 mt-0.5">-</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-3">
                    Your photo will be analyzed automatically by Google Cloud Vision API. Photos that do not pass the formal attire check will be rejected, and you will be asked to resubmit. G4 Car Service reserves the right to reject any photo at its discretion.
                </p>
            </>
        ),
    },
    {
        title: '4. Vehicle Standards',
        content: (
            <>
                <p>Vehicles used for G4 Car Service must comply with the following minimum standards:</p>
                <ul className="list-none space-y-2 mt-3">
                    {[
                        'Vehicle must be in excellent mechanical condition with no visible damage affecting passenger safety or comfort.',
                        'Interior must be clean, odor-free, and well-maintained.',
                        'Vehicle must meet the passenger capacity and type indicated in your application.',
                        'Luxury category vehicles must meet G4\'s premium vehicle criteria (typically late-model SUVs or sedans of an approved brand).',
                        'Vehicle photos submitted must accurately represent the current condition of your vehicle.',
                    ].map((item) => (
                        <li key={item} className="flex gap-2">
                            <span className="text-[#D4AF37] shrink-0 mt-0.5">-</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </>
        ),
    },
    {
        title: '5. Driver Conduct and Standards',
        content: (
            <>
                <p>As a G4 Car Service driver, you agree at all times to:</p>
                <ul className="list-none space-y-2 mt-3">
                    {[
                        'Maintain a professional, courteous, and respectful demeanor toward all passengers and G4 staff.',
                        'Dress in formal business attire during all service engagements, consistent with your approved profile photo.',
                        'Comply with all applicable traffic laws and transportation regulations.',
                        'Keep your vehicle clean, fueled, and in roadworthy condition for every assignment.',
                        'Respond promptly to communications from G4 Car Service.',
                        'Notify G4 immediately of any changes to your license status, insurance, vehicle, or legal standing.',
                        'Not accept cash payments or negotiate service terms independently with clients.',
                    ].map((item) => (
                        <li key={item} className="flex gap-2">
                            <span className="text-[#D4AF37] shrink-0 mt-0.5">-</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </>
        ),
    },
    {
        title: '6. Photo Usage Permission',
        content: (
            <p>
                During registration, you will be asked whether you grant G4 Car Service permission to use your profile photograph in promotional materials, the G4 website, social media, or marketing communications. This permission is entirely optional. If granted, you may withdraw consent at any time by contacting <a href="mailto:info@g4car.services" className="text-[#D4AF37]/80 hover:text-[#D4AF37]">info@g4car.services</a>. Refusal to grant photo usage permission will not affect your application outcome.
            </p>
        ),
    },
    {
        title: '7. Referral Program Obligations',
        content: (
            <p>
                You may refer other drivers to the Platform using your unique referral link. Referrals must be genuine - referring individuals you know to be qualified drivers. Any attempt to generate fraudulent referrals, including self-referrals using alternate accounts, referral ring arrangements, or automated referral submissions, constitutes a material breach of this Agreement and will result in immediate account suspension, forfeiture of all referral credits, and potential legal action. G4 Car Service reserves the right to audit referral activity at any time.
            </p>
        ),
    },
    {
        title: '8. Document Maintenance and Updates',
        content: (
            <p>
                You are responsible for keeping all submitted documents current. If any document (license, insurance, registration, inspection) expires or is revoked, you must notify G4 Car Service immediately and cease providing service until updated documentation is submitted and approved. Failure to maintain current documentation may result in suspension from the platform. G4 Car Service may request updated documentation at any time during your active driver status.
            </p>
        ),
    },
    {
        title: '9. Independent Contractor Status',
        content: (
            <p>
                Nothing in this Agreement creates an employer-employee, partnership, or joint venture relationship between you and G4 Car Service LLC. You are an independent contractor and are solely responsible for your own taxes, insurance, vehicle expenses, and compliance with all laws applicable to self-employed service providers. G4 Car Service does not withhold taxes on your behalf and does not provide workers' compensation, unemployment insurance, or employee benefits of any kind.
            </p>
        ),
    },
    {
        title: '10. Breach and Termination',
        content: (
            <p>
                Any violation of this Agreement, the Terms of Service, or applicable law may result in suspension or permanent termination of your driver account, at G4 Car Service's sole discretion. Grounds for termination include but are not limited to: document fraud, failure to maintain required credentials, misconduct toward passengers, violation of referral program rules, or reputational harm to G4 Car Service. Termination does not limit G4 Car Service's ability to pursue legal remedies for material breaches.
            </p>
        ),
    },
    {
        title: '11. Contact',
        content: (
            <p>
                For questions about this Agreement, your application status, or to report concerns, please contact our driver relations team at <a href="mailto:drivers@g4car.services" className="text-[#D4AF37]/80 hover:text-[#D4AF37]">drivers@g4car.services</a>.
            </p>
        ),
    },
];

const DriverAgreement = () => (
    <LegalLayout
        title="Driver Agreement"
        subtitle="Standards, obligations, and conduct requirements for all G4 Car Service drivers."
        effectiveDate="June 1, 2026"
        sections={sections}
    />
);

export default DriverAgreement;
