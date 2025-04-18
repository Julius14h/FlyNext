import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'upload.wikimedia.org',      // Wikipedia
      'images.unsplash.com',       // Unsplash
      'cdn.pixabay.com',          // Pixabay
      'www.google.com',           // Google
      'i.imgur.com',              // Imgur
      'media.giphy.com',          // Giphy
      'pbs.twimg.com',            // Twitter
      'instagram.com',            // Instagram
      'fbcdn.net',               // Facebook CDN
      'flickr.com',              // Flickr
      'live.staticflickr.com',   // Flickr static
      'pinimg.com',             // Pinterest
      'redditmedia.com',        // Reddit
      'i.redd.it',              // Reddit images
      'cdn.discordapp.com',     // Discord
      'media.tumblr.com',       // Tumblr
      'imageshack.com',         // ImageShack
      'photobucket.com',        // Photobucket
      'cloudinary.com',         // Cloudinary
      'res.cloudinary.com',     // Cloudinary resources
      'images.pexels.com',      // Pexels
      'cdn.stocksnap.io',       // StockSnap
      'gravatar.com',           // Gravatar
      'secure.gravatar.com',    // Gravatar secure
      'ytimg.com',             // YouTube
      'i.ytimg.com',           // YouTube images
      'vimeocdn.com',          // Vimeo CDN
      'cdn.shopify.com',       // Shopify
      'etsystatic.com',        // Etsy
      'ebayimg.com',           // eBay
      'amazonaws.com',         // AWS S3
      's3.amazonaws.com',      // AWS S3 specific
      'digitaloceanspaces.com', // DigitalOcean Spaces
      'cdn.jsdelivr.net',        // jsDelivr CDN
      'raw.githubusercontent.com', // GitHub raw
      'media.licdn.com',       // LinkedIn
      'cdn.dribbble.com',      // Dribbble
      'behance.net',           // Behance
      'images.ctfassets.net',  // Contentful
      'prnt.sc',              // Lightshot
      'screenshot.net',       // Screenshot
      'picsum.photos',        // Lorem Picsum
      'placekitten.com',      // Placekitten
      'placehold.it',         // Placeholder
      'dummyimage.com',       // Dummy Image
      'via.placeholder.com',  // Placeholder.com
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;