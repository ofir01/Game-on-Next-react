/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  output: 'standalone', // שורה זו חיונית כדי שדוקר ייקח רק את מה שצריך ויריץ את השרת ביעילות
};

export default nextConfig;
