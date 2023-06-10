const nextConfig = {
  i18n: {
    locales: ["en", "ja"],
    defaultLocale: "en",
  },
  async rewrites() {
    return [
      {
        source: "/:locale*",
        destination: "/:locale*",
        locale: true,
      },
    ];
  },
};

module.exports = nextConfig;
