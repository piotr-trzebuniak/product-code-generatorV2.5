// import * as cheerio from 'cheerio';

// export const splitHtml = (html) => {
//   const $ = cheerio.load(html);

//   const htmlSections = {
//     logoAndMenu: "",
//     productName: "",
//     gallery: "",
//     shortDescription: "",
//     variants: "",
//     bulletpoints: "",
//     icons: "",
//     longDescription: "",
//     productComparison: "",
//     research: "",
//     boughtTogether: "",
//     productSeries: "",
//   };

//   // HEADER
//   const header = $('header').first();
//   htmlSections.logoAndMenu = header.length ? $.html(header) : "";

//   // GALLERY
//   const gallery = $('div.gallery').first();
//   htmlSections.gallery = gallery.length ? $.html(gallery) : "";

//   // SHORT DESCRIPTION (wszystko po <h2> w short-description)
//   const shortDesc = $('div.short-description').first();
//   const h2 = shortDesc.find('h2').first();
//   if (shortDesc.length && h2.length) {
//     h2.remove(); // usuń <h2>, zostaw resztę
//     htmlSections.shortDescription = shortDesc.html().trim();
//     htmlSections.productName = h2.text().trim();
//   }

//   // BULLETPOINTS
//   const bulletpoints = $('div.bulletpoints').first();
//   htmlSections.bulletpoints = bulletpoints.length ? $.html(bulletpoints) : "";

//   // ICONS (czyli .properties)
//   const properties = $('div.properties').first();
//   htmlSections.icons = properties.length ? $.html(properties) : "";

//   // LONG DESCRIPTION (czyli .description__content)
//   const longDesc = $('div.description__content').first();
//   htmlSections.longDescription = longDesc.length ? $.html(longDesc) : "";

//   // PRODUCT COMPARISON (czyli .similar-products)
//   const comparison = $('div.similar-products').first();
//   htmlSections.productComparison = comparison.length ? $.html(comparison) : "";

//   // RESEARCH (czyli .researches)
//   const research = $('div.researches').first();
//   htmlSections.research = research.length ? $.html(research) : "";

//   // BOUGHT TOGETHER (czyli .propositions__content)
//   const boughtTogether = $('div.propositions__content').first();
//   htmlSections.boughtTogether = boughtTogether.length ? $.html(boughtTogether) : "";

//   // PRODUCT SERIES (czyli .product-series)
//   const productSeries = $('div.product-series').first();
//   htmlSections.productSeries = productSeries.length ? $.html(productSeries) : "";

//   return htmlSections;
// };
