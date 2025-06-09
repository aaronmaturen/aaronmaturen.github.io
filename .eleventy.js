const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // Add a filter to split strings
  eleventyConfig.addFilter("splitPath", function (str) {
    return str.split("/").filter(Boolean);
  });
  // Add syntax highlighting
  eleventyConfig.addPlugin(syntaxHighlight);

  // Copy CSS files but exclude the et-book directory to avoid conflicts
  eleventyConfig.addPassthroughCopy({ "src/assets/css/*.css": "assets/css" });

  // Copy other asset directories
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/ico": "assets/ico" });

  // Copy et-book fonts to match the relative path in tufte.min.css
  eleventyConfig.addPassthroughCopy({
    "src/assets/et-book": "assets/css/et-book",
  });

  // Copy these files to the root of _site
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("humans.txt");

  // Add date filter
  eleventyConfig.addFilter("date", function (date, format) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Create a collection for blog musings
  eleventyConfig.addCollection("musings", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/musings/*.md");
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
    templateFormats: ["html", "md", "njk"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
