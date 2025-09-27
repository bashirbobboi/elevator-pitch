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
        <footer className="bg-gray-100 py-8 sm:py-12 lg:py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                <a
                    aria-label="go home"
                    className="mx-auto block w-fit">
                    <div className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
                        Elevator Pitch by Mohammed Bobboi
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center max-w-md mx-auto">
                        This platform was built to share my 90-second elevator pitch.
                    </p>
                </a>

                <div className="my-8 sm:my-10 lg:my-12">
                    <SocialLinks socials={socials} className="gap-1 sm:gap-2" />
                </div>
                
                <span className="text-gray-600 block text-center text-xs sm:text-sm">
                    © {new Date().getFullYear()} Mohammed Bobboi, All rights reserved
                </span>
            </div>
        </footer>
    );
}
