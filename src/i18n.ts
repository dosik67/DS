import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English
const en = {
  translation: {
    sidebar: {
      dashboard: "Dashboard",
      progress: "Progress",
      history: "History",
      admin: "Admin Panel",
      logout: "Logout",
    },
    dashboard: {
      welcome: "Ready for the day, {{name}}?",
      startDay: "Start New Day",
      planTitle: "Today's Plan",
      plannedHours: "Planned Hours",
      savePlan: "Start Day",
      activeDay: "Active Day: {{date}}",
      endDay: "End Day",
      progress: "Progress",
      tasks: "Tasks",
      save: "Save Progress",
      hours: "Hours tracking",
      actualHours: "Actual Hours",
      passesLeft: "Passes left: {{left}}",
      noTasksFound: "No tasks set",
      summary: "Day Summary",
      taskTime: "Time spent:",
      msgShit: "Very poor! Come on, you can do more!",
      msgOkay: "Not bad, but let's push harder!",
      msgGood: "Good job! Keep the pace up!",
      msgGreat: "Great day! Almost perfect!",
      msgLegend: "Legendary! You went 100%!",
      close: "Close",
      startNextDay: "Start new day",
      rest: "Rest",
      date: "Date",
      dateMismatchConfirm: "You selected {{selected}}, but today is {{today}}. Start day anyway?",
      dayExistsConfirm: "A day already exists for {{date}}. Overwrite it?",
      pickDate: "Pick date",
      today: "Today",
      studyTimer: "Study timer",
      required: "Required",
      start: "Start",
      pause: "Pause",
      timeProgress: "Time progress",
      cannotEndYet: "You can finish the day after you reach the required time.",
      needMoreTime: "Not enough time. Required: {{need}}, you have: {{have}}."
    },
    admin: {
      title: "Admin Dashboard",
      clients: "Clients",
      warningSent: "Warning Sent",
      sendWarning: "Send Warning",
      message: "Message",
    },
    common: {
      language: "Language",
      theme: "Theme",
      selectAccount: "Select an account to continue",
      adminWarning: "Administrative Warning",
      saveToDb: "Save (DB sync placeholder)"
    },
    history: {
      manageDay: "Manage day",
      openDay: "Open this day",
      changeDate: "Change date",
      saveChanges: "Save changes",
      deleteDay: "Delete day",
      deleteConfirm: "Delete {{date}} and all its tasks?",
      changeDateConfirm: "Move {{from}} to {{to}}?"
    },
    ent: {
      title: "ENT Countdown",
      today: "Today",
      entDateLabel: "ENT date",
      daysLeft: "days left",
      passed: "passed",
      entMark: "ENT",
      historySubtitle: "ENT calendar. Click a day to manage it."
    },
    progress: {
      goalLabel: "Goal: {{hours}}h",
      currentWeek: "Current Week",
      hours: "hours",
      goalCrushed: "Goal crushed!",
      leftToGoal: "{{hours}}h left to goal",
      dailyBreakdown: "Daily Breakdown",
      consistency: "Consistency",
      daysLogged: "Days logged",
      mostProductive: "Most Productive",
      pace: "Pace",
      perDayAvg: "/ day avg",
      notAvailable: "N/A",
      weekDaysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      achievementsTitle: "Achievements",
      currentStreak: "Current streak: {{days}} days",
      streakBadge: "{{days}} days in a row",
      daysLabel: "days",
      unlocked: "Unlocked",
      locked: "Locked",
      recentDays: "Recent days",
      noDays: "No days yet",
      totalDays: "Total: {{count}}",
      dayDone: "Done",
      dayInProgress: "In progress",
      planned: "plan"
    }
  }
};

// Russian
const ru = {
  translation: {
    sidebar: {
      dashboard: "Главная",
      progress: "Прогресс",
      history: "История",
      admin: "Панель администратора",
      logout: "Выйти",
    },
    dashboard: {
      welcome: "Готов к работе, {{name}}?",
      startDay: "Начать новый день",
      planTitle: "План на сегодня",
      plannedHours: "План (часов)",
      savePlan: "Начать день",
      activeDay: "Активный день: {{date}}",
      endDay: "Завершить день",
      progress: "Прогресс",
      tasks: "Задачи",
      save: "Сохранить",
      hours: "Учет времени",
      actualHours: "Отработано часов",
      passesLeft: "Осталось пропусков: {{left}}",
      noTasksFound: "Нет задач",
      summary: "Итоги дня",
      taskTime: "Затрачено времени:",
      msgShit: "Плохо поработал сегодня. Надо поднажать!",
      msgOkay: "Уже что-то, но можно и лучше!",
      msgGood: "Хорошо идешь, продолжай в том же духе!",
      msgGreat: "Отличный день, почти идеал!",
      msgLegend: "Легендарно! Ты выложился на все 100%!",
      close: "Закрыть",
      startNextDay: "Начать новый день",
      rest: "Отдых",
      date: "Дата",
      dateMismatchConfirm: "Вы выбираете {{selected}}, но сегодня {{today}}. Все равно начать день?",
      dayExistsConfirm: "День {{date}} уже существует. Перезаписать его?",
      pickDate: "Выбор даты",
      today: "Сегодня",
      studyTimer: "Таймер обучения",
      required: "Нужно",
      start: "Старт",
      pause: "Пауза",
      timeProgress: "Прогресс по времени",
      cannotEndYet: "Завершить день можно после того, как пройдет нужное время.",
      needMoreTime: "Недостаточно времени. Нужно: {{need}}, у тебя: {{have}}."
    },
    admin: {
      title: "Панель управления",
      clients: "Клиенты",
      warningSent: "Предупреждение отправлено",
      sendWarning: "Отправить предупреждение",
      message: "Сообщение",
    },
    common: {
      language: "Язык",
      theme: "Тема",
      selectAccount: "Выберите аккаунт для входа",
      adminWarning: "Предупреждение от администратора",
      saveToDb: "Сохранить (имитация БД)"
    },
    history: {
      manageDay: "Управление днем",
      openDay: "Открыть этот день",
      changeDate: "Изменить дату",
      saveChanges: "Сохранить изменения",
      deleteDay: "Удалить день",
      deleteConfirm: "Удалить {{date}} и все задачи этого дня?",
      changeDateConfirm: "Перенести {{from}} на {{to}}?"
    },
    ent: {
      title: "ЕНТ: обратный отсчет",
      today: "Сегодня",
      entDateLabel: "Дата ЕНТ",
      daysLeft: "дней осталось",
      passed: "прошло",
      entMark: "ЕНТ",
      historySubtitle: "Календарь подготовки к ЕНТ. Нажми на день, чтобы управлять."
    },
    progress: {
      goalLabel: "Цель: {{hours}}ч",
      currentWeek: "Текущая неделя",
      hours: "часов",
      goalCrushed: "Цель выполнена!",
      leftToGoal: "Осталось {{hours}}ч до цели",
      dailyBreakdown: "По дням",
      consistency: "Стабильность",
      daysLogged: "дней записано",
      mostProductive: "Самый продуктивный",
      pace: "Темп",
      perDayAvg: "/ день в среднем",
      notAvailable: "—",
      weekDaysShort: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      achievementsTitle: "Достижения",
      currentStreak: "Серия: {{days}} дн. подряд",
      streakBadge: "{{days}} дн. подряд",
      daysLabel: "дней",
      unlocked: "Получено",
      locked: "Закрыто",
      recentDays: "Последние дни",
      noDays: "Пока нет дней",
      totalDays: "Всего: {{count}}",
      dayDone: "Завершен",
      dayInProgress: "В процессе",
      planned: "план"
    }
  }
};

// Kazakh
const kk = {
  translation: {
    sidebar: {
      dashboard: "Басты бет",
      progress: "Прогресс",
      history: "Тарих",
      admin: "Әкімші тақтасы",
      logout: "Шығу",
    },
    dashboard: {
      welcome: "Жұмысқа дайынсыз ба, {{name}}?",
      startDay: "Жаңа күнді бастау",
      planTitle: "Бүгінге жоспар",
      plannedHours: "Жоспар (сағат)",
      savePlan: "Күнді бастау",
      activeDay: "Белсенді күн: {{date}}",
      endDay: "Күнді аяқтау",
      progress: "Прогресс",
      tasks: "Тапсырмалар",
      save: "Сақтау",
      hours: "Уақытты бақылау",
      actualHours: "Жұмыс істелген уақыт",
      passesLeft: "Қалған үзілістер: {{left}}",
      noTasksFound: "Тапсырмалар жоқ",
      summary: "Күн қорытындысы",
      taskTime: "Жұмсалған уақыт:",
      msgShit: "Бүгін нашар жұмыс істедің. Көбірек тырыс!",
      msgOkay: "Жаман емес, бірақ бұдан да жақсырақ жасауға болады!",
      msgGood: "Жақсы келе жатырсың, осы қарқынмен жалғастыр!",
      msgGreat: "Керемет күн, мінсіз дерлік!",
      msgLegend: "Аңыз! Сен 100% берілдің!",
      close: "Жабу",
      startNextDay: "Жаңа күнді бастау",
      rest: "Демалу",
      date: "Күні",
      dateMismatchConfirm: "Сіз {{selected}} күнін таңдадыңыз, бірақ бүгін {{today}}. Қалайсыз, бәрібір бастаймыз ба?",
      dayExistsConfirm: "{{date}} күні бұрыннан бар. Қайта жазамыз ба?",
      pickDate: "Күнді таңдау",
      today: "Бүгін",
      studyTimer: "Оқу таймері",
      required: "Қажет",
      start: "Бастау",
      pause: "Кідірту",
      timeProgress: "Уақыт прогресі",
      cannotEndYet: "Күнді аяқтау үшін қажетті уақытқа жету керек.",
      needMoreTime: "Уақыт жеткіліксіз. Қажет: {{need}}, сізде: {{have}}."
    },
    admin: {
      title: "Басқару тақтасы",
      clients: "Клиенттер",
      warningSent: "Ескерту жіберілді",
      sendWarning: "Ескерту жіберу",
      message: "Хабарлама",
    },
    common: {
      language: "Тіл",
      theme: "Тақырып",
      selectAccount: "Кіру үшін аккаунтты таңдаңыз",
      adminWarning: "Әкімшілендіру ескертуі",
      saveToDb: "Сақтау (ДҚ имитациясы)"
    },
    history: {
      manageDay: "Күнді басқару",
      openDay: "Осы күнді ашу",
      changeDate: "Күнін өзгерту",
      saveChanges: "Өзгерістерді сақтау",
      deleteDay: "Күнді жою",
      deleteConfirm: "{{date}} күнін және барлық тапсырмаларын жоямыз ба?",
      changeDateConfirm: "{{from}} күнін {{to}} күніне ауыстырамыз ба?"
    },
    ent: {
      title: "ЕНТ: кері санау",
      today: "Бүгін",
      entDateLabel: "ЕНТ күні",
      daysLeft: "күн қалды",
      passed: "өтіп кетті",
      entMark: "ЕНТ",
      historySubtitle: "ЕНТ-ке дайындық күнтізбесі. Күнді басқару үшін басыңыз."
    },
    progress: {
      goalLabel: "Мақсат: {{hours}}сағ",
      currentWeek: "Осы апта",
      hours: "сағат",
      goalCrushed: "Мақсат орындалды!",
      leftToGoal: "Мақсатқа дейін {{hours}}сағ қалды",
      dailyBreakdown: "Күндер бойынша",
      consistency: "Тұрақтылық",
      daysLogged: "күн тіркелді",
      mostProductive: "Ең өнімді күн",
      pace: "Қарқын",
      perDayAvg: "/ күн орташа",
      notAvailable: "—",
      weekDaysShort: ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"],
      achievementsTitle: "Жетістіктер",
      currentStreak: "Серия: {{days}} күн қатарынан",
      streakBadge: "{{days}} күн қатарынан",
      daysLabel: "күн",
      unlocked: "Ашылды",
      locked: "Құлыптаулы",
      recentDays: "Соңғы күндер",
      noDays: "Әзірге күн жоқ",
      totalDays: "Барлығы: {{count}}",
      dayDone: "Аяқталды",
      dayInProgress: "Процесте",
      planned: "жоспар"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      ru,
      kk
    },
    lng: "ru", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
