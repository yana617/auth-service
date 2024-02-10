import db from '#database';
import BaseRepository from './BaseRepository';

class AdditionalFieldTemplateRepository extends BaseRepository {}

export default new AdditionalFieldTemplateRepository(db.AdditionalFieldTemplate);
