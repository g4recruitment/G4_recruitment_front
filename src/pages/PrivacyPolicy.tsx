import { LegalLayout } from '@/components/LegalLayout';

const sections = [
    {
        title: '1. Information We Collect',
        content: (
            <>
                <p>When you apply to become a G4 Car Service driver, we collect the following categories of information:</p>
                <ul className="list-none space-y-2 mt-3">
                    {[
                        { label: 'Personal identifiers', value: 'Full name, email address, home address, phone number, and emergency contact number.' },
                        { label: 'Vehicle information', value: 'Vehicle type, passenger capacity, device type (smartphone model), and driver category (Luxury or Standard).' },
                        { label: 'Regulatory documents', value: "Driver's license, TLC (Taxi and Limousine Commission) license, car registration, vehicle inspection report, TLC Diamond certificate, and insurance files — uploaded as images." },
                        { label: 'Profile and vehicle photos', value: 'A professional profile photograph and multiple vehicle photos provided during registration.' },
                        { label: 'Account data', value: 'Email address used for Google OAuth authentication via Supabase, session tokens, and a unique referral code generated upon registration.' },
                        { label: 'Referral activity', value: 'Information about drivers referred by you, including their registration status.' },
                    ].map(({ label, value }) => (
                        <li key={label} className="flex gap-2">
                            <span className="text-[#D4AF37] shrink-0 mt-0.5">-</span>
                            <span><span className="text-white font-medium">{label}:</span> {value}</span>
                        </li>
                    ))}
                </ul>
            </>
        ),
    },
    {
        title: '2. How We Use Your Information',
        content: (
            <>
                <p>We use the information collected solely for the following purposes:</p>
                <ul className="list-none space-y-2 mt-3">
                    {[
                        'Processing and evaluating your driver application.',
                        'Verifying your identity, vehicle, and regulatory compliance.',
                        'Validating your professional profile photo using Google Cloud Vision API to confirm formal attire compliance.',
                        'Communicating with you via transactional email (application status updates, confirmations) through our SMTP service.',
                        'Operating the referral program and attributing referrals correctly.',
                        'Administering your driver account and profile on the platform.',
                        'Complying with applicable legal obligations.',
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
        title: '3. Photo Validation by AI',
        content: (
            <p>
                Your profile photograph is processed by <span className="text-white font-medium">Google Cloud Vision API</span> to automatically verify that you are dressed in formal business attire, as required by our service standards. This analysis is performed at the time of submission. The image is transmitted securely to Google's API and is not stored by Google beyond the duration of the analysis. By submitting your profile photo, you consent to this automated processing.
            </p>
        ),
    },
    {
        title: '4. Document Storage',
        content: (
            <p>
                All uploaded documents and photographs are stored in <span className="text-white font-medium">Supabase Storage</span>, an S3-compatible cloud storage service. Files are stored in private buckets accessible only to authorized G4 Car Service administrators and are transmitted over encrypted HTTPS connections. We retain your documents for as long as your driver account is active or as required by applicable law. You may request deletion of your data by contacting us at <a href="mailto:info@g4car.services" className="text-[#D4AF37]/80 hover:text-[#D4AF37]">info@g4car.services</a>.
            </p>
        ),
    },
    {
        title: '5. Third-Party Services',
        content: (
            <>
                <p>We rely on the following third-party providers to operate our platform:</p>
                <ul className="list-none space-y-2 mt-3">
                    {[
                        { name: 'Supabase', desc: 'Authentication, database, and file storage.' },
                        { name: 'Google Cloud Vision API', desc: 'Automated profile photo analysis.' },
                        { name: 'Gmail SMTP', desc: 'Transactional email delivery.' },
                        { name: 'Render.com', desc: 'Backend application hosting.' },
                    ].map(({ name, desc }) => (
                        <li key={name} className="flex gap-2">
                            <span className="text-[#D4AF37] shrink-0 mt-0.5">-</span>
                            <span><span className="text-white font-medium">{name}:</span> {desc}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-3">Each provider operates under its own privacy policy and data processing agreements.</p>
            </>
        ),
    },
    {
        title: '6. Data Sharing',
        content: (
            <p>
                We do not sell, rent, or share your personal information with third parties for marketing purposes. Your data may be shared with authorized G4 Car Service administrators for application review, and with the third-party service providers listed above strictly to operate the platform. We may disclose information if required by law or in response to a valid legal request from government authorities.
            </p>
        ),
    },
    {
        title: '7. Your Rights',
        content: (
            <>
                <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
                <ul className="list-none space-y-2 mt-3">
                    {[
                        'Access: request a copy of the personal information we hold about you.',
                        'Correction: request correction of inaccurate or incomplete data.',
                        'Deletion: request deletion of your data, subject to legal retention obligations.',
                        'Withdrawal of consent: withdraw your consent for photo processing at any time (note this may affect your application).',
                    ].map((item) => (
                        <li key={item} className="flex gap-2">
                            <span className="text-[#D4AF37] shrink-0 mt-0.5">-</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:info@g4car.services" className="text-[#D4AF37]/80 hover:text-[#D4AF37]">info@g4car.services</a>.</p>
            </>
        ),
    },
    {
        title: '8. Security',
        content: (
            <p>
                We implement industry-standard technical and organizational measures to protect your data, including HTTPS encryption for all data in transit, private storage buckets for documents, JWT-based authentication with JWKS validation, and rate limiting on all API endpoints. However, no system is completely secure, and we cannot guarantee absolute security.
            </p>
        ),
    },
    {
        title: '9. Changes to This Policy',
        content: (
            <p>
                We may update this Privacy Policy from time to time. When we do, we will revise the effective date at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy. We encourage you to review this page periodically.
            </p>
        ),
    },
];

const PrivacyPolicy = () => (
    <LegalLayout
        title="Privacy Policy"
        subtitle="How G4 Car Services collects, uses, and protects your information."
        effectiveDate="June 1, 2026"
        sections={sections}
    />
);

export default PrivacyPolicy;
