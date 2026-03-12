const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // Static assets
  eleventyConfig.addPassthroughCopy({ "styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "script.js": "script.js" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "_routes.json": "_routes.json" });
  // Cloudflare Pages redirects file (keeps /api/* from being rewritten by SPA fallbacks)
  eleventyConfig.addPassthroughCopy({ "_redirects": "_redirects" });

  // Custom collection: fragments
  eleventyConfig.addCollection("fragments", (collectionApi) => {
    return collectionApi.getFilteredByTag("posts").filter((item) => {
      const tags = item.data.tags || [];
      return tags.includes("Fragments");
    });
  });

  // Date formatting
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("dd LLL yyyy");
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
