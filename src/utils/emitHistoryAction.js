import axios from 'axios';

import { ERRORS } from '#translations';

const { EVENTS_SERVICE_URL, EVENT_KEY } = process.env;
const eventsUrl = `${EVENTS_SERVICE_URL}/history-actions`;

export const emitHistoryAction = async (eventData) => {
  axios
    .post(eventsUrl, eventData, { headers: { 'event-key': EVENT_KEY } })
    .catch((e) => {
      throw Error(ERRORS.HISTORY_ACTION_CREATING_ERROR);
    });
};
