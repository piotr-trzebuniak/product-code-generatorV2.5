import * as cheerio from 'cheerio';

export const splitHtml = (html) => {
  const $ = cheerio.load(html);

  const htmlSections = {
    logoAndMenu: "",
    productName: "",
    gallery: "",
    shortDescription: "",
    variants: "",
    bulletpoints: "",
    icons: "",
    longDescription: "",
    productComparison: "",
    research: "",
    boughtTogether: "",
    productSeries: "",
  };

  const header = $('header').first();
  htmlSections.logoAndMenu = header.length ? $.html(header) : "";

  const gallery = $('div.gallery').first();
  htmlSections.gallery = gallery.length ? $.html(gallery) : "";

  const shortDesc = $('div.short-description').first();
  const h2 = shortDesc.find('h2').first();
  if (shortDesc.length && h2.length) {
    h2.remove();
    htmlSections.shortDescription = shortDesc.html().trim();
    htmlSections.productName = h2.text().trim();
  }

  const bulletpoints = $('div.bulletpoints').first();
  htmlSections.bulletpoints = bulletpoints.length ? $.html(bulletpoints) : "";
  
  const roles = $('div.roles').first();
  htmlSections.roles = roles.length ? $.html(roles) : "";

  const properties = $('div.properties').first();
  htmlSections.icons = properties.length ? $.html(properties) : "";

  const longDesc = $('div.description__content').first();
  htmlSections.longDescription = longDesc.length ? $.html(longDesc) : "";

  const comparison = $('div.similar-products').first();
  htmlSections.productComparison = comparison.length ? $.html(comparison) : "";

  const research = $('div.researches').first();
  htmlSections.research = research.length ? $.html(research) : "";

  const boughtTogether = $('div.propositions__content').first();
  htmlSections.boughtTogether = boughtTogether.length ? $.html(boughtTogether) : "";

  const productSeries = $('div.product-series').first();
  htmlSections.productSeries = productSeries.length ? $.html(productSeries) : "";

  return htmlSections;
};
