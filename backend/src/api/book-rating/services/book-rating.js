'use strict';

/**
 * book-rating service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::book-rating.book-rating');
