/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "cdn.discordapp.com" },
            { protocol: "https", hostname: "teyvatcollective.network" },
            { protocol: "https", hostname: "genshinwizard.com" },
            { protocol: "https", hostname: "i.imgur.com" },
            { protocol: "https", hostname: "daedalusbot.xyz" },
        ],
    },
};

export default nextConfig;
