const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);

    remotePatterns.push({
      protocol: supabaseUrl.protocol.replace(':', ''),
      hostname: supabaseUrl.hostname,
      pathname: '/storage/v1/object/public/**',
    });
  } catch {
    // Ignore invalid env so build doesn't fail just from a malformed URL.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
