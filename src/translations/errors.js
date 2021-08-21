const { availableOrder, availableSortByNames } = require('../database/constants');

module.exports = {
  EN: {
    FORBIDDEN: 'Forbidden',
    AUTH_ERROR: 'Authorization error',
    EMAIL_PASSWORD_REQUIRED: 'Email and password fields are required',
    USER_ALREADY_EXISTS: 'User with this phone or email already exists',
    USER_EMAIL_NOT_FOUND: 'No user with such email',
    LIMIT_QUERY_ERROR: 'Limit should be from 1 to 50',
    SKIP_QUERY_ERROR: 'Skip should be from 1',
    ORDER_QUERY_ERROR: `Invalid order, allowed: ${availableOrder.join(', ')}`,
    SORT_BY_QUERY_ERROR: `Invalid sortBy, allowed: ${availableSortByNames.join(', ')}`,
    SEARCH_QUERY_ERROR: 'Search should be from 1 to 30',
    INVALID_RESET_TOKEN: 'Invalid or expired password reset token',
    USER_NOT_FOUND: 'User not found',
    AFT_NOT_FOUND: 'Additional field template not found',
  },
  RU: {
    FORBIDDEN: 'Недостаточно прав',
    AUTH_ERROR: 'Ошибка авторизации',
    EMAIL_PASSWORD_REQUIRED: 'Поля электронной почты и пароля обязательны для заполнения',
    USER_ALREADY_EXISTS: 'Пользователь с такой почтой или телефоном уже зарегистрирован',
    USER_EMAIL_NOT_FOUND: 'Нет пользователя с такой почтой',
    LIMIT_QUERY_ERROR: 'Лимит должен быть от 1 до 50',
    SKIP_QUERY_ERROR: 'Пропускать можно от 1 записи',
    ORDER_QUERY_ERROR: `Неверный порядок сортировки, доступные: ${availableOrder.join(', ')}`,
    SORT_BY_QUERY_ERROR: `Неверное поле сортировки, доступные: ${availableSortByNames.join(', ')}`,
    SEARCH_QUERY_ERROR: 'Строка поиска должна быть от 1 до 30',
    INVALID_RESET_TOKEN: 'Неверный токен для изменения пароля',
    USER_NOT_FOUND: 'Пользователь не найден',
    AFT_NOT_FOUND: 'Шаблон дополнительного поля не найден',
  },
};
