import { LegalLayout } from '@/components/LegalLayout';

const sections = [
    {
        title: '1. Acceptance of Terms',
        content: (
            <p>
                By accessing or using the G4 Car Service driver registration platform ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform. These Terms apply to all visitors, registered users, and applicants who interact with the Platform.
            </p>
        ),
    },
    {
        title: '2. Eligibility',
        content: (
            <>
                <p>To register as a driver on the Platform, you must:</p>
                <ul className="list-none space-y-2 mt-3">
                    {[
                        'Be at least 21 years of age.',
                        'Hold a valid driver\'s license issued by the applicable authority.',
                        'Possess a valid TLC (Taxi and Limousine Commission) license.',
                        'Own or have lawful access to a vehicle that meets G4 Car Service standards.',
                        'Maintain current vehicle registration, inspection, and insurance documents.',
                        'Have the legal right to work and provide transportation services in your jurisdiction.',
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
        title: '3. Account Registration',
        content: (
            <p>
                You must register using a valid Google account via our Google OAuth authentication system. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate, current, and complete information during registration and to update your information as needed to keep it accurate. G4 Car Service reserves the right to suspend or terminate accounts that contain false or misleading information.
            </p>
        ),
    },
    {
        title: '4. Application and Approval Process',
        content: (
            <p>
                Completing the registration form does not guarantee approval as a G4 Car Service driver. All applications are reviewed by our administrative team. We reserve the right to approve or reject any application at our sole discretion. Your profile photograph will be reviewed by automated image analysis to verify formal attire compliance, and your submitted documents will be reviewed for authenticity and regulatory compliance. We will notify you of our decision by email.
            </p>
        ),
    },
    {
        title: '5. Acceptable Use',
        content: (
            <>
                <p>You agree that you will not:</p>
                <ul className="list-none space-y-2 mt-3">
                    {[
                        'Submit fraudulent, altered, or counterfeit documents.',
                        'Create multiple accounts or share account credentials with others.',
                        'Use the Platform for any unlawful purpose or in violation of applicable law.',
                        'Attempt to reverse-engineer, scrape, or interfere with the Platform\'s systems.',
                        'Engage in harassment, abuse, or misconduct toward G4 staff or other users.',
                        'Manipulate the referral program through fraudulent referrals or self-referrals.',
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
        title: '6. Referral Program',
        content: (
            <p>
                The Platform includes a referral program that allows registered drivers to share a unique referral link. Referral rewards, if any, are determined by G4 Car Service at its sole discretion and are subject to change. Abuse of the referral program, including the creation of fake accounts or self-referrals, will result in immediate account suspension and forfeiture of any referral credits. G4 Car Service reserves the right to modify or discontinue the referral program at any time without notice.
            </p>
        ),
    },
    {
        title: '7. Intellectual Property',
        content: (
            <p>
                All content, branding, logos, and materials on the Platform are the property of G4 Car Service LLC or its licensors and are protected by applicable intellectual property laws. You may not use, reproduce, or distribute any content from the Platform without our prior written consent. By submitting photographs and documents to the Platform, you grant G4 Car Service a non-exclusive, royalty-free license to use those materials solely for the purpose of operating the Platform and reviewing your application.
            </p>
        ),
    },
    {
        title: '8. Termination',
        content: (
            <p>
                G4 Car Service reserves the right to suspend or terminate your access to the Platform at any time, with or without notice, for any reason, including but not limited to: violation of these Terms, submission of fraudulent documents, failure to maintain required licenses or insurance, or conduct that is harmful to G4 Car Service or its clients. Upon termination, your right to access the Platform ceases immediately.
            </p>
        ),
    },
    {
        title: '9. Limitation of Liability',
        content: (
            <p>
                To the fullest extent permitted by law, G4 Car Service LLC, its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loss of income, data, or business opportunities. The Platform is provided "as is" and "as available" without warranties of any kind, express or implied.
            </p>
        ),
    },
    {
        title: '10. Governing Law',
        content: (
            <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in New York County, New York.
            </p>
        ),
    },
    {
        title: '11. Changes to These Terms',
        content: (
            <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated effective date. Your continued use of the Platform after any modifications constitutes acceptance of the new Terms. If you do not agree to the revised Terms, you must discontinue use of the Platform.
            </p>
        ),
    },
];

const TermsOfService = () => (
    <LegalLayout
        title="Terms of Service"
        subtitle="The rules and conditions that govern your use of the G4 Car Service platform."
        effectiveDate="June 1, 2026"
        sections={sections}
    />
);

export default TermsOfService;
