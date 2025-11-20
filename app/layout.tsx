import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Comic Book Generator',
    description: 'A web comic book adaptation of the story "72 Hours of AI Downtime".',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-gray-900 text-gray-200">{children}</body>
        </html>
    );
}
