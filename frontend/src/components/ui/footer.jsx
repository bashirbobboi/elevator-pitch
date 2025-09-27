import React from 'react';
import { SocialLinks } from './social-links';

const socials = [
    {
        name: "LinkedIn",
        image: "https://img.icons8.com/?size=100&id=MR3dZdlA53te&format=png&color=000000",
        href: "https://linkedin.com/in/mohammed-bobboi"
    },
    {
        name: "GitHub",
        image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=64&h=64&fit=crop&crop=center",
        href: "https://github.com/mohammed-bobboi"
    },
    {
        name: "Portfolio",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=64&h=64&fit=crop&crop=center",
        href: "#"
    },
    {
        name: "Email",
        image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=64&h=64&fit=crop&crop=center",
        href: "mailto:mohammed.bobboi@example.com"
    }
];

export default function FooterSection() {
    return (
        <footer className="bg-gray-100 py-16">
            <div className="mx-auto max-w-5xl px-6">
                <a
                    href="/"
                    aria-label="go home"
                    className="mx-auto block w-fit">
                    <div className="text-2xl font-bold text-gray-800">
                        Elevator Pitch by Mohammed Bobboi
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                        This platform was built to share my 90-second elevator pitch.
                    </p>
                </a>

                <div className="my-12">
                    <SocialLinks socials={socials} className="gap-2" />
                </div>
                
                <span className="text-gray-600 block text-center text-sm">
                    © {new Date().getFullYear()} Mohammed Bobboi, All rights reserved
                </span>
            </div>
        </footer>
    );
}
