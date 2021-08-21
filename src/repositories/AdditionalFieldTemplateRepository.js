const { AdditionalFieldTemplate } = require('../database');
const BaseRepository = require('./BaseRepository');

class AdditionalFieldTemplateRepository extends BaseRepository {}

module.exports = new AdditionalFieldTemplateRepository(AdditionalFieldTemplate);
