import React from 'react';
import { SocialLinks } from './social-links';
import linkedInLogo from '../../assets/linkedIN.png';
import githubLogo from '../../assets/github.png';
import portfolioLogo from '../../assets/portfolio.png';
import emailLogo from '../../assets/email.png';
import twitterLogo from '../../assets/twitter.png';

const socials = [
    {
        name: "LinkedIn",
        image: linkedInLogo,
        href: "https://linkedin.com/in/mohammed-bobboi"
    },
    {
        name: "GitHub",
        image: githubLogo,
        href: "https://github.com/bashirbobboi"
    },
    {
        name: "Twitter",
        image: twitterLogo,
        href: "https://x.com/bashirbobboi?s=21"
    },
    {
        name: "Portfolio",
        image: portfolioLogo,
        href: "http://bashirbobboi.github.io/netflix_portfolio/#/browse"
    },
    {
        name: "Email",
        image: emailLogo,
        href: "mailto:bashirbobboi@gmail.com"
    }
];

export default function FooterSection() {
    return (
        <footer className="bg-gray-100 py-16">
            <div className="mx-auto max-w-5xl px-6">
                <a
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
