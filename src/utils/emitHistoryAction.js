import got from 'got';

import { ERRORS } from '#translations';

const { EVENTS_SERVICE_URL, EVENT_KEY } = process.env;
const eventsUrl = `${EVENTS_SERVICE_URL}/history-actions`;

const getOptions = (body = {}) => ({
  headers: { 'event-key': EVENT_KEY },
  json: true,
  body,
});

export const emitHistoryAction = async (eventData) => {
  try {
    got.post(eventsUrl, getOptions(eventData));
  } catch (e) {
    throw Error(ERRORS.HISTORY_ACTION_CREATING_ERROR);
  }
};
