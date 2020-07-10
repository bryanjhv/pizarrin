const { load } = require("cheerio");
const { transform } = require("buble");
const { minify } = require("html-minifier");
const { dirname, extname, join } = require("path");
const { copySync, removeSync } = require("fs-extra");
const { readFileSync, writeFileSync } = require("fs");

const config = {
  buble: {
    dangerousForOf: true,
  },
  uglifyJs: {},
  cleanCss: {
    level: 2,
  },
  htmlMinifier: {
    caseSensitive: true,
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
  },
};
config.htmlMinifier.minifyJS = config.uglifyJs;
config.htmlMinifier.minifyCSS = config.cleanCss;

function isURL(url) {
  return /^http?s:\/\//.test(url);
}
function read(path) {
  return readFileSync(path, "utf8");
}
function rel(src, url) {
  return join(dirname(src), url);
}

process.chdir(dirname(__dirname));
removeSync("public");
copySync("client", "public", {
  filter(src, out) {
    const ext = extname(src);
    if (!ext) return true; // directories
    if (ext != ".html") return;

    const $ = load(read(src));
    $("link[rel='stylesheet']").each((i, link) => {
      const $el = $(link);
      const url = $el.attr("href");
      if (isURL(url)) return;
      $el.replaceWith($("<style>").text(read(rel(src, url))));
    });
    $("script[src]").each((i, script) => {
      const $el = $(script);
      const url = $el.attr("src");
      if (isURL(url)) return;
      $el.removeAttr("src");
      $el.text(transform(read(rel(src, url)), config.buble).code);
    });
    writeFileSync(out, minify($.html(), config.htmlMinifier), "utf8");
  },
});
