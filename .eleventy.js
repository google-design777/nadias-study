const { DateTime } = require("luxon");
const { toHTML } = require("@portabletext/to-html");

module.exports = function (eleventyConfig) {
  // Static assets
  eleventyConfig.addPassthroughCopy({ "styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "script.js": "script.js" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });

  // Cloudflare Pages routing helpers
  eleventyConfig.addPassthroughCopy({ "_routes.json": "_routes.json" });
  eleventyConfig.addPassthroughCopy({ "_redirects": "_redirects" });

  // Custom collection: fragments
  eleventyConfig.addCollection("fragments", (collectionApi) => {
    return collectionApi.getFilteredByTag("posts").filter((item) => {
      const tags = item.data.tags || [];
      return tags.includes("Fragments");
    });
  });

  // Portable Text (Sanity) -> HTML
  eleventyConfig.addFilter("portableTextToHtml", (value) => {
    if (!value) return "";
    try {
      return toHTML(value);
    } catch (e) {
      return "";
    }
  });

  // Date formatting
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    const dt = typeof dateObj === "string" ? DateTime.fromISO(dateObj) : DateTime.fromJSDate(dateObj);
    return dt.setZone("utc").toFormat("dd LLL yyyy");
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
