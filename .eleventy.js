const markdownIt = require('markdown-it');
const yaml = require('js-yaml');

module.exports = (eleventyConfig) => {
    const config = {
        dir: {
            includes: '_includes',
            layouts: '_includes/_layouts',
            input: 'src',
            output: '_site',
            data: '_data',
        },
        dataTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
    };
    const markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
    });
    eleventyConfig.setLibrary('md', markdownIt(markdownLibrary));
    eleventyConfig.addDataExtension('yaml', (contents) => yaml.safeLoad(contents));
    eleventyConfig.addDataExtension('yml', (contents) => yaml.safeLoad(contents));

    // filters
    eleventyConfig.addFilter('split', (value, arg, ...last) => {
        return value instanceof String ? value.split(arg) : value;
    });
    eleventyConfig.addFilter('uniq', (value) =>
        value instanceof Array ? [...new Set(value)] : value
    );

    eleventyConfig.addCollection('projects', (collection) => {
        const coll = collection.getFilteredByGlob('src/_projects/*.md');
        // console.log(coll);
        return coll;
    });
    // copy files and build
    eleventyConfig.addPassthroughCopy('src/assets/img');
    eleventyConfig.addPassthroughCopy('src/assets/font');
    eleventyConfig.addPassthroughCopy('src/assets/js');
    eleventyConfig.addPassthroughCopy('src/assets/css');
    return config;
};
