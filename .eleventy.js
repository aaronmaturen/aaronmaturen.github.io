const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // Configure Nunjucks to handle code snippets better
  eleventyConfig.setNunjucksEnvironmentOptions({
    autoescape: false,
    throwOnUndefined: false,
    trimBlocks: true,
    lstripBlocks: true
  });
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

  // Create a collection for series
  eleventyConfig.addCollection("series", function (collectionApi) {
    return collectionApi.getFilteredByTags("series");
  });
  
  // Create a collection for each series
  eleventyConfig.addCollection("seriesContent", function (collectionApi) {
    const allSeries = {};
    // Get all items with seriesId that are not series overview pages
    const seriesItems = collectionApi.getAll().filter(item => 
      item.data.seriesId && !item.data.tags.includes("series")
    );
    
    // Group by seriesId
    seriesItems.forEach(item => {
      const seriesId = item.data.seriesId;
      if (!allSeries[seriesId]) {
        allSeries[seriesId] = [];
      }
      allSeries[seriesId].push(item);
    });
    
    // Sort each series by part number
    Object.keys(allSeries).forEach(seriesId => {
      allSeries[seriesId].sort((a, b) => {
        return (a.data.part || 0) - (b.data.part || 0);
      });
    });
    
    return allSeries;
  });
  
  // Add helper functions for series navigation
  eleventyConfig.addFilter("getSeriesOverview", function(seriesId, collections) {
    return collections.series.find(item => item.data.seriesId === seriesId);
  });
  
  eleventyConfig.addFilter("getPreviousInSeries", function(part, seriesId, collections) {
    const seriesItems = collections.seriesContent[seriesId];
    if (!seriesItems) return null;
    
    return seriesItems.find(item => item.data.part === part - 1);
  });
  
  eleventyConfig.addFilter("getNextInSeries", function(part, seriesId, collections) {
    const seriesItems = collections.seriesContent[seriesId];
    if (!seriesItems) return null;
    
    return seriesItems.find(item => item.data.part === part + 1);
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
