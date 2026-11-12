const THEME_KEY = "divan_theme";
const LANGUAGE_KEY = "divan_language";
const THEMES = {
  dark: {
    icon: "dark_mode",
    label: { ar: "\u0648\u0636\u0639 \u0644\u064A\u0644\u064A", en: "Dark mode" }
  },
  light: {
    icon: "light_mode",
    label: { ar: "\u0648\u0636\u0639 \u0646\u0647\u0627\u0631\u064A", en: "Light mode" }
  }
};
const I18N = {
  "index.pageTitle": {
    ar: "\u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629 - \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629",
    en: "Sufi Diwan - Home"
  },
  "index.heroTitle": {
    ar: "\u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629",
    en: "Sufi Diwan"
  },
  "index.heroSubtitle": {
    ar: "\u0644\u0644\u0642\u0631\u0627\u0621\u0629 \u0648\u0627\u0644\u0625\u0646\u0634\u0627\u062F \u0627\u0644\u062C\u0645\u0627\u0639\u064A",
    en: "For Reading and Group Recitation"
  },
  "index.searchPlaceholder": {
    ar: "\u0639\u0646 \u0645\u0627\u0630\u0627 \u062A\u0628\u062D\u062B \u0641\u064A \u0627\u0644\u062F\u064A\u0648\u0627\u0646\u061F",
    en: "What are you looking for in the Diwan?"
  },
  "index.currentPoemTitle": {
    ar: "\u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629",
    en: "Current Poem"
  },
  "index.currentPoemSubtitle": {
    ar: "\u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0629 \u062D\u0627\u0644\u064A\u0627\u064B",
    en: "Shared poem right now"
  },
  "index.currentWaslaTitle": {
    ar: "\u0627\u0644\u0648\u0635\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629",
    en: "Current Wasla"
  },
  "index.currentWaslaSubtitle": {
    ar: "\u0646\u0638\u0627\u0645 \u0627\u0644\u0625\u0646\u0634\u0627\u062F \u0627\u0644\u062C\u0645\u0627\u0639\u064A \u0627\u0644\u0645\u0646\u0638\u0645",
    en: "Organized group recitation mode"
  },
  "index.catalogButton": {
    ar: "\u0639\u0631\u0636 \u0641\u0647\u0631\u0633 \u0627\u0644\u062F\u064A\u0648\u0627\u0646 \u0628\u0627\u0644\u0643\u0627\u0645\u0644",
    en: "Browse Full Diwan Catalog"
  },
  "index.addPoem": {
    ar: "\u0625\u0636\u0627\u0641\u0629 \u0642\u0635\u064A\u062F\u0629",
    en: "Add Poem"
  },
  "index.waslat": {
    ar: "\u0627\u0644\u0648\u0635\u0644\u0627\u062A",
    en: "Waslat"
  },
  "index.featured": {
    ar: "\u0645\u062E\u062A\u0627\u0631\u0627\u062A \u0645\u0646 \u0627\u0644\u062F\u064A\u0648\u0627\u0646",
    en: "Featured Selections"
  },
  "index.footerWaslat": {
    ar: "\u0627\u0644\u0648\u0635\u0644\u0627\u062A",
    en: "Waslat"
  },
  "index.settings": {
    ar: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A",
    en: "Settings"
  },
  "index.libraryTitle": {
    ar: "\u0627\u0644\u062F\u064A\u0648\u0627\u0646",
    en: "Diwan"
  },
  "index.logoutTitle": {
    ar: "\u062E\u0631\u0648\u062C",
    en: "Logout"
  },
  "index.themeAria": {
    ar: "\u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0646\u0645\u0637",
    en: "Toggle theme"
  },
  "login.pageTitle": {
    ar: "\u062F\u062E\u0648\u0644 - \u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629",
    en: "Login - Sufi Diwan"
  },
  "login.brandTitle": {
    ar: "\u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629",
    en: "Sufi Diwan"
  },
  "login.brandSubtitle": {
    ar: "\u0644\u0644\u0642\u0631\u0627\u0621\u0629 \u0648\u0627\u0644\u0625\u0646\u0634\u0627\u062F \u0627\u0644\u062C\u0645\u0627\u0639\u064A",
    en: "For Reading and Group Recitation"
  },
  "login.heading": {
    ar: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644",
    en: "Sign In"
  },
  "login.username": {
    ar: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645",
    en: "Username"
  },
  "login.usernamePlaceholder": {
    ar: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645",
    en: "Username"
  },
  "login.password": {
    ar: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    en: "Password"
  },
  "login.passwordPlaceholder": {
    ar: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    en: "Password"
  },
  "login.passwordToggleAria": {
    ar: "\u0625\u0638\u0647\u0627\u0631/\u0625\u062E\u0641\u0627\u0621 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    en: "Show or hide password"
  },
  "login.submit": {
    ar: "\u062F\u062E\u0648\u0644",
    en: "Sign In"
  },
  "login.demoUsers": {
    ar: "\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646 \u0644\u0644\u062A\u062C\u0631\u0628\u0629:",
    en: "Demo users:"
  },
  "login.demoLeadRole": {
    ar: "\u0645\u0646\u0634\u062F \u0631\u0626\u064A\u0633\u064A",
    en: "Lead Munshid"
  },
  "login.demoMunshidRole": {
    ar: "\u0645\u0646\u0634\u062F",
    en: "Munshid"
  },
  "pages.poemsTitle": {
    ar: "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0642\u0635\u0627\u0626\u062F - \u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629",
    en: "Poems List - Sufi Diwan"
  },
  "pages.waslatTitle": {
    ar: "\u0627\u0644\u0648\u0635\u0644\u0627\u062A - \u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629",
    en: "Waslat - Sufi Diwan"
  },
  "pages.currentPoemTitle": {
    ar: "\u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 - \u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629",
    en: "Current Poem - Sufi Diwan"
  },
  "pages.currentWaslaTitle": {
    ar: "\u0627\u0644\u0648\u0635\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 - \u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629",
    en: "Current Wasla - Sufi Diwan"
  },
  "pages.viewPoemTitle": {
    ar: "\u0639\u0631\u0636 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 - \u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629",
    en: "View Poem - Sufi Diwan"
  },
  "pages.addPoemTitle": {
    ar: "\u0625\u0636\u0627\u0641\u0629 \u0642\u0635\u064A\u062F\u0629 - \u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629",
    en: "Add Poem - Sufi Diwan"
  }
};
const AUTO_UI_TEXT_AR_TO_EN = {
  \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629: "Home",
  \u0627\u0644\u062F\u064A\u0648\u0627\u0646: "Diwan",
  \u0627\u0644\u0648\u0635\u0644\u0627\u062A: "Waslat",
  \u0627\u0644\u0642\u0627\u0626\u0645\u0629: "Menu",
  \u062D\u0627\u0644\u064A\u0629: "Current",
  \u062E\u0631\u0648\u062C: "Logout",
  \u0631\u062C\u0648\u0639: "Back",
  \u0645\u0628\u0627\u0634\u0631: "Live",
  \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A: "Settings",
  "\u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629": "Sufi Diwan",
  "\u0631\u062D\u0644\u0629 \u0641\u064A \u0627\u0644\u0634\u0639\u0631 \u0627\u0644\u0639\u0631\u0641\u0627\u0646\u064A": "A Journey in Mystical Poetry",
  "\u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629": "Current Poem",
  "\u0627\u0644\u0648\u0635\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629": "Current Wasla",
  "\u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0629 \u062D\u0627\u0644\u064A\u0627\u064B": "Shared poem right now",
  "\u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0629 \u062D\u0627\u0644\u064A\u0627": "Shared poem right now",
  "\u0646\u0638\u0627\u0645 \u0627\u0644\u0625\u0646\u0634\u0627\u062F \u0627\u0644\u062C\u0645\u0627\u0639\u064A \u0627\u0644\u0645\u0646\u0638\u0645": "Organized group recitation mode",
  "\u0639\u0631\u0636 \u0641\u0647\u0631\u0633 \u0627\u0644\u062F\u064A\u0648\u0627\u0646 \u0628\u0627\u0644\u0643\u0627\u0645\u0644": "Browse Full Diwan Catalog",
  "\u0645\u062E\u062A\u0627\u0631\u0627\u062A \u0645\u0646 \u0627\u0644\u062F\u064A\u0648\u0627\u0646": "Featured Selections",
  "\u0625\u0636\u0627\u0641\u0629 \u0642\u0635\u064A\u062F\u0629": "Add Poem",
  "\u0625\u0636\u0627\u0641\u0629 \u0642\u0635\u064A\u062F\u0629 \u062C\u062F\u064A\u062F\u0629": "Add New Poem",
  "\u062A\u0635\u0641\u062D \u0627\u0644\u062F\u064A\u0648\u0627\u0646": "Browse Diwan",
  "\u0644\u0627 \u062A\u0648\u062C\u062F \u0642\u0635\u064A\u062F\u0629 \u062D\u0627\u0644\u064A\u0629": "No current poem",
  "\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0644\u0629 \u062D\u0627\u0644\u064A\u0629": "No current wasla",
  "\u064A\u0646\u062A\u0638\u0631 \u0627\u0644\u0645\u0646\u0634\u062F \u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0645\u0634\u0627\u0631\u0643\u0629 \u0642\u0635\u064A\u062F\u0629 \u0644\u064A\u0631\u0627\u0647\u0627 \u0627\u0644\u062C\u0645\u064A\u0639 \u0641\u064A \u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0641\u0639\u0644\u064A.": "Waiting for the lead munshid to share a poem in real time.",
  "\u064A\u0646\u062A\u0638\u0631 \u0627\u0644\u0645\u0646\u0634\u062F \u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0645\u0634\u0627\u0631\u0643\u0629 \u0648\u0635\u0644\u0629 \u062C\u062F\u064A\u062F\u0629.": "Waiting for the lead munshid to share a new wasla.",
  "\u0634\u0627\u0631\u0643 \u0628\u0648\u0627\u0633\u0637\u0629:": "Shared by:",
  "\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0643\u0627\u0645\u0644\u0629": "Read Full Poem",
  \u0645\u0642\u0627\u0645: "Maqam",
  "\u0645\u0642\u0627\u0645 \u0645\u0648\u0633\u064A\u0642\u064A": "Musical Maqam",
  "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0648\u0635\u0644\u0629": "Wasla Details",
  "\u0648\u0635\u0644\u0629 \u062C\u062F\u064A\u062F\u0629": "New Wasla",
  "\u0625\u0646\u0634\u0627\u0621 \u0648\u0635\u0644\u0629 \u062C\u062F\u064A\u062F\u0629": "Create New Wasla",
  "\u0627\u0633\u0645 \u0627\u0644\u0648\u0635\u0644\u0629 *": "Wasla Name *",
  "\u0627\u0633\u0645 \u0627\u0644\u0648\u0635\u0644\u0629 \u0645\u0637\u0644\u0648\u0628": "Wasla name is required",
  "\u0645\u062B\u0644: \u0648\u0635\u0644\u0629 \u0627\u0644\u0628\u0631\u062F\u0629...": "e.g. Burda wasla...",
  "\u0627\u0644\u0648\u0635\u0641 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)": "Description (optional)",
  "\u0648\u0635\u0641 \u0627\u0644\u0648\u0635\u0644\u0629...": "Wasla description...",
  "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0648\u0635\u0644\u0629": "Create Wasla",
  "\u0625\u0636\u0627\u0641\u0629 \u0642\u0635\u064A\u062F\u0629 \u0644\u0644\u0648\u0635\u0644\u0629": "Add Poem to Wasla",
  "\u0627\u0628\u062D\u062B \u0639\u0646 \u0642\u0635\u064A\u062F\u0629...": "Search for a poem...",
  "\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C": "No results",
  "\u0644\u0627 \u062A\u0648\u062C\u062F \u0642\u0635\u0627\u0626\u062F \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0648\u0635\u0644\u0629": "No poems in this wasla",
  "\u0644\u0627 \u062A\u0648\u062C\u062F \u0642\u0635\u0627\u0626\u062F \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0648\u0635\u0644\u0629 \u0628\u0639\u062F": "No poems in this wasla yet",
  "\u0647\u0644 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0646 \u0627\u0644\u0648\u0635\u0644\u0629\u061F": "Remove this poem from the wasla?",
  "\u062D\u0630\u0641 \u0645\u0646 \u0627\u0644\u0648\u0635\u0644\u0629": "Remove from wasla",
  "\u0627\u0642\u0631\u0623 \u0627\u0644\u0642\u0635\u064A\u062F\u0629": "Read Poem",
  \u0645\u0634\u0627\u0631\u0643\u0629: "Share",
  "\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0639 \u0627\u0644\u062C\u0645\u064A\u0639": "Share with everyone",
  \u062D\u0630\u0641: "Delete",
  "\u062D\u0630\u0641 \u0627\u0644\u0648\u0635\u0644\u0629": "Delete Wasla",
  "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0648\u0635\u0644\u0629": "Wasla deleted",
  "\u062A\u0645 \u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0648\u0635\u0644\u0629 \u0645\u0639 \u0627\u0644\u062C\u0645\u064A\u0639": "Wasla shared with everyone",
  "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0648\u0635\u0644\u0629 \u0628\u0646\u062C\u0627\u062D": "Wasla created successfully",
  "\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0644\u0629 \u062D\u0627\u0644\u064A\u0629 \u0627\u0644\u0622\u0646": "No current wasla at the moment",
  "\u062A\u0639\u0630\u0631 \u0641\u062A\u062D \u0627\u0644\u0648\u0635\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629": "Could not open the current wasla",
  "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0648\u0635\u0644\u0627\u062A...": "Loading waslat...",
  "\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0644\u0627\u062A \u0628\u0639\u062F. \u0623\u0646\u0634\u0626 \u0648\u0635\u0644\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649!": "No waslat yet. Create your first wasla!",
  "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0648\u0635\u0644\u0629...": "Loading wasla...",
  "\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0648\u0635\u0644\u0629": "Add to wasla",
  "\u0639\u0631\u0636 \u0644\u0644\u062C\u0645\u064A\u0639": "Share with everyone",
  "\u0625\u0634\u0627\u0631\u0629 \u0645\u0631\u062C\u0639\u064A\u0629": "Bookmark",
  "\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0625\u0634\u0627\u0631\u0629 \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629": "Remove bookmark",
  "\u0625\u0636\u0627\u0641\u0629 \u0625\u0634\u0627\u0631\u0629 \u0645\u0631\u062C\u0639\u064A\u0629": "Add bookmark",
  "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0641\u064A \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629": "Poem saved to bookmarks",
  "\u062A\u0645 \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0646 \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629": "Poem removed from bookmarks",
  "\u062A\u0645 \u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0639 \u0627\u0644\u062C\u0645\u064A\u0639": "Poem shared with everyone",
  "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0642\u0635\u064A\u062F\u0629": "Poem deleted",
  "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0628\u0646\u062C\u0627\u062D": "Poem deleted successfully",
  "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0646 \u0627\u0644\u0648\u0635\u0644\u0629": "Poem removed from wasla",
  "\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0644\u0644\u0648\u0635\u0644\u0629": "Poem added to wasla",
  "\u0627\u062E\u062A\u0631 \u0642\u0635\u064A\u062F\u0629 \u0623\u0648\u0644\u0627": "Select a poem first",
  "\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0648\u0635\u0644\u0629": "Please choose a wasla",
  "\u0627\u0644\u0642\u0635\u064A\u062F\u0629:": "Poem:",
  "\u0627\u062E\u062A\u0631 \u0627\u0644\u0648\u0635\u0644\u0629": "Select wasla",
  "\u0627\u062E\u062A\u0631 \u0627\u0644\u0648\u0635\u0644\u0629...": "Select wasla...",
  "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644...": "Loading...",
  "\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0644\u0627\u062A": "No waslat",
  "\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0644\u0627\u062A \u0628\u0639\u062F": "No waslat yet",
  "\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0648\u0635\u0644\u0627\u062A": "Could not load waslat",
  "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0642\u0635\u0627\u0626\u062F": "Poems List",
  "\u0643\u0644 \u0627\u0644\u0642\u0635\u0627\u0626\u062F": "All poems",
  \u0627\u0644\u0643\u0644: "All",
  \u0625\u0644\u0647\u064A\u0627\u062A: "Ilahiyyat",
  \u0646\u0628\u0648\u064A\u0627\u062A: "Nabawiyyat",
  \u062D\u0636\u0631\u0629: "Hadra",
  \u0645\u0641\u0631\u062F: "Mufrad",
  "\u062C\u0645\u064A\u0639 \u0627\u0644\u0634\u0639\u0631\u0627\u0621": "All poets",
  "\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0642\u0627\u0645\u0627\u062A": "All maqamat",
  "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0642\u0635\u0627\u0626\u062F...": "Loading poems...",
  "\u0644\u0627 \u062A\u0648\u062C\u062F \u0642\u0635\u0627\u0626\u062F \u062A\u0637\u0627\u0628\u0642 \u0627\u0644\u0628\u062D\u062B": "No poems match your search",
  \u062A\u0639\u062F\u064A\u0644: "Edit",
  "\u062D\u0630\u0641 \u0627\u0644\u0642\u0635\u064A\u062F\u0629": "Delete Poem",
  "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621.": "This action cannot be undone.",
  \u062A\u0623\u0643\u064A\u062F: "Confirm",
  \u0625\u0644\u063A\u0627\u0621: "Cancel",
  \u062C\u062F\u064A\u062F\u0629: "New",
  "\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0634\u0639\u0631\u0627\u0621": "Could not load poets list",
  "\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0642\u0627\u0645\u0627\u062A": "Could not load maqamat list",
  "\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0642\u0635\u064A\u062F\u0629": "Could not load poem data",
  "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0642\u0635\u064A\u062F\u0629": "Poem title",
  "\u0646\u0635 \u0627\u0644\u0642\u0635\u064A\u062F\u0629": "Poem text",
  "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0637\u0644\u0648\u0628": "Poem title is required",
  "\u0646\u0635 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0637\u0644\u0648\u0628": "Poem text is required",
  "\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0634\u0627\u0639\u0631": "Please choose a poet",
  "\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0645\u0642\u0627\u0645": "Please choose a maqam",
  "\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0642\u0635\u064A\u062F\u0629": "Please choose poem category",
  "\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0642\u0633\u0645 \u0627\u0644\u062D\u0636\u0631\u0629": "Please choose hadra section",
  "\u0627\u0633\u0645 \u0627\u0644\u0634\u0627\u0639\u0631": "Poet name",
  "\u0627\u0633\u0645 \u0627\u0644\u0634\u0627\u0639\u0631 \u0627\u0644\u062C\u062F\u064A\u062F": "New poet name",
  "\u0627\u0633\u0645 \u0627\u0644\u0634\u0627\u0639\u0631 \u0645\u0637\u0644\u0648\u0628": "Poet name is required",
  "\u0627\u062E\u062A\u0631 \u0627\u0644\u0634\u0627\u0639\u0631...": "Select poet...",
  "\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0642\u0627\u0645...": "Select maqam...",
  "\u0627\u062E\u062A\u0631 \u0627\u0644\u0642\u0633\u0645...": "Select section...",
  "\u0627\u062E\u062A\u0631 \u0627\u0644\u062A\u0635\u0646\u064A\u0641...": "Select category...",
  "+ \u0634\u0627\u0639\u0631 \u062C\u062F\u064A\u062F...": "+ New poet...",
  "\u0627\u0643\u062A\u0628 \u0627\u0633\u0645 \u0627\u0644\u0634\u0627\u0639\u0631...": "Type poet name...",
  "\u0627\u0643\u062A\u0628 \u0623\u0628\u064A\u0627\u062A \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0647\u0646\u0627\u060C \u0634\u0637\u0631 \u0648\u0627\u062D\u062F \u0641\u064A \u0643\u0644 \u0633\u0637\u0631...": "Write poem verses here, one hemistich per line...",
  "\u0643\u0644 \u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u062D\u0636\u0631\u0629": "All hadra sections",
  \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D: "Opening",
  \u0627\u0644\u0642\u064A\u0627\u0645: "Qiyam",
  \u0631\u0643\u0648\u0639: "Ruku",
  "\u0633\u0637\u0631 \u0644\u0643\u0644 \u0634\u0637\u0631": "One line per hemistich",
  "\u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0635\u062D\u0629 \u0627\u0644\u062A\u0634\u0643\u064A\u0644 \u0644\u0636\u0645\u0627\u0646 \u062F\u0642\u0629 \u0627\u0644\u0642\u0631\u0627\u0621\u0629.": "Please verify diacritics for accurate reading.",
  "\u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A": "Save changes",
  "\u062D\u0641\u0638 \u0643\u0645\u0633\u0648\u062F\u0629": "Save as draft",
  "\u062D\u0641\u0638 \u0648\u0646\u0634\u0631": "Save and publish",
  "\u062A\u0639\u062F\u064A\u0644 \u0642\u0635\u064A\u062F\u0629": "Edit poem",
  "\u062A\u0639\u0630\u0631 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0634\u0627\u0639\u0631 \u0627\u0644\u062C\u062F\u064A\u062F": "Could not add new poet",
  "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0628\u0646\u062C\u0627\u062D": "Poem updated successfully",
  "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0645\u0633\u0648\u062F\u0629 \u0628\u0646\u062C\u0627\u062D": "Draft saved successfully",
  "\u062A\u0645 \u0646\u0634\u0631 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0628\u0646\u062C\u0627\u062D": "Poem published successfully",
  "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062D\u0641\u0638": "An error occurred while saving",
  "\u062D\u062F\u062B \u062E\u0637\u0623. \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u0627\u064B.": "Something went wrong. Please try again.",
  "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629": "All rights reserved"
};
const AUTO_UI_TEXT_EN_TO_AR = Object.entries(AUTO_UI_TEXT_AR_TO_EN).reduce(
  (result, [ar, en]) => {
    result[en] = ar;
    return result;
  },
  {}
);
const AUTO_UI_AR_ENTRIES = Object.entries(AUTO_UI_TEXT_AR_TO_EN).sort(
  (a, b) => b[0].length - a[0].length
);
const AUTO_UI_EN_ENTRIES = Object.entries(AUTO_UI_TEXT_EN_TO_AR).sort(
  (a, b) => b[0].length - a[0].length
);
let autoTranslationObserver = null;
let isApplyingAutoTranslation = false;
let pendingTranslationNodes = [];
let translationFrame = 0;
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildReplacer(entries) {
  const usable = entries.filter(([from]) => from);
  const map = new Map(usable);
  if (!usable.length) return (value) => value;
  const pattern = usable.map(([from]) => escapeRegExp(from)).join("|");
  const re = new RegExp(pattern, "g");
  return (value) => value.replace(re, (match) => map.get(match) || match);
}
const replaceArabic = buildReplacer(AUTO_UI_AR_ENTRIES);
const replaceEnglish = buildReplacer(AUTO_UI_EN_ENTRIES);
const HAS_ARABIC = /[\u0600-\u06FF]/;
const HAS_LATIN = /[A-Za-z]/;
function autoTranslateValue(value, lang) {
  if (typeof value !== "string" || value.trim().length < 2) return value;
  if (lang === "en") {
    if (!HAS_ARABIC.test(value)) return value;
    let next2 = value;
    next2 = next2.replace(/(\d+)\s+قصائد?/g, "$1 poems");
    next2 = next2.replace(/حضرة\s*-\s*/g, "Hadra - ");
    next2 = next2.replace(/القصيدة الحالية:\s*/g, "Current Poem: ");
    next2 = next2.replace(/الوصلة الحالية:\s*/g, "Current Wasla: ");
    next2 = next2.replace(/القصيدة:\s*/g, "Poem: ");
    next2 = next2.replace(
      /تم مشاركة\s+"([^"]+)"\s+مع الجميع/g,
      'Shared "$1" with everyone'
    );
    next2 = next2.replace(
      /تم إضافة\s+"([^"]+)"\s+لل?وصلة/g,
      'Added "$1" to wasla'
    );
    next2 = next2.replace(
      /هل أنت متأكد من حذف\s+"([^"]+)"[؟?]/g,
      'Are you sure you want to delete "$1"?'
    );
    return replaceArabic(next2);
  }
  if (!HAS_LATIN.test(value)) return value;
  let next = value;
  next = next.replace(/(\d+)\s+poems?/gi, "$1 \u0642\u0635\u064A\u062F\u0629");
  next = next.replace(/Hadra\s*-\s*/g, "\u062D\u0636\u0631\u0629 - ");
  next = next.replace(/Current Poem:\s*/g, "\u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629: ");
  next = next.replace(/Current Wasla:\s*/g, "\u0627\u0644\u0648\u0635\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629: ");
  next = next.replace(/Poem:\s*/g, "\u0627\u0644\u0642\u0635\u064A\u062F\u0629: ");
  next = next.replace(
    /Shared\s+"([^"]+)"\s+with everyone/g,
    '\u062A\u0645 \u0645\u0634\u0627\u0631\u0643\u0629 "$1" \u0645\u0639 \u0627\u0644\u062C\u0645\u064A\u0639'
  );
  next = next.replace(/Added\s+"([^"]+)"\s+to wasla/g, '\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 "$1" \u0644\u0644\u0648\u0635\u0644\u0629');
  next = next.replace(
    /Are you sure you want to delete\s+"([^"]+)"\?/g,
    '\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 "$1"\u061F'
  );
  return replaceEnglish(next);
}
function shouldSkipTranslation(el) {
  var _a;
  if (!el) return true;
  if (el.closest("[data-no-auto-translate]")) return true;
  if (el.closest("#poemBody")) return true;
  if ((_a = el.classList) == null ? void 0 : _a.contains("material-symbols-outlined")) return true;
  const tag = el.tagName;
  return tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "CODE" || tag === "PRE";
}
function translateElementAttributes(el, lang) {
  if (!el || shouldSkipTranslation(el)) return;
  ["title", "placeholder", "aria-label"].forEach((attr) => {
    if (!el.hasAttribute(attr)) return;
    const current = el.getAttribute(attr);
    const next = autoTranslateValue(current, lang);
    if (next !== current) el.setAttribute(attr, next);
  });
}
function translateTextNode(node, lang) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const parent = node.parentElement;
  if (!parent || shouldSkipTranslation(parent)) return;
  const current = node.textContent;
  const next = autoTranslateValue(current, lang);
  if (next !== current) node.textContent = next;
}
function translateTree(node, lang) {
  if (!node) return;
  if (node.nodeType === Node.TEXT_NODE) {
    translateTextNode(node, lang);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node;
  if (shouldSkipTranslation(el)) return;
  translateElementAttributes(el, lang);
  el.childNodes.forEach((child) => translateTree(child, lang));
}
function translateDocumentTitle(lang) {
  if (!document.title) return;
  const next = autoTranslateValue(document.title, lang);
  if (next !== document.title) document.title = next;
}
function applyAutomaticUiTranslation(lang) {
  if (!document.body) return;
  isApplyingAutoTranslation = true;
  try {
    translateTree(document.body, lang);
    translateDocumentTitle(lang);
  } finally {
    isApplyingAutoTranslation = false;
  }
}
function flushPendingTranslations() {
  translationFrame = 0;
  if (!pendingTranslationNodes.length || !autoTranslationObserver) return;
  const lang = getCurrentLanguage();
  const nodes = pendingTranslationNodes;
  pendingTranslationNodes = [];
  autoTranslationObserver.disconnect();
  isApplyingAutoTranslation = true;
  try {
    nodes.forEach((node) => translateTree(node, lang));
  } finally {
    isApplyingAutoTranslation = false;
    if (document.body) {
      autoTranslationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
}
function ensureAutoTranslationObserver() {
  if (autoTranslationObserver || !document.body) return;
  autoTranslationObserver = new MutationObserver((mutations) => {
    if (isApplyingAutoTranslation) return;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        pendingTranslationNodes.push(node);
      });
    });
    if (!pendingTranslationNodes.length || translationFrame) return;
    translationFrame = requestAnimationFrame(flushPendingTranslations);
  });
  autoTranslationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}
function getStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    if (saved === "deep" || saved === "classic") return "dark";
    return "dark";
  } catch {
    return "dark";
  }
}
function getStoredLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch {
  }
  const htmlLang = document.documentElement.getAttribute("lang") || "ar";
  return htmlLang.toLowerCase().startsWith("en") ? "en" : "ar";
}
function getCurrentLanguage() {
  const htmlLang = document.documentElement.getAttribute("lang") || "ar";
  return htmlLang.toLowerCase().startsWith("en") ? "en" : "ar";
}
function translate(key, lang) {
  const value = I18N[key];
  if (!value) return "";
  return value[lang] || value.ar || "";
}
function applyI18nText(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const next = translate(key, lang);
    if (next) el.textContent = next;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const next = translate(key, lang);
    if (next) el.setAttribute("placeholder", next);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    const next = translate(key, lang);
    if (next) el.setAttribute("title", next);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    const next = translate(key, lang);
    if (next) el.setAttribute("aria-label", next);
  });
}
function ensureLanguageToggle() {
  return document.getElementById("langToggle");
}
function updateLanguageToggle(lang) {
  const btn = document.getElementById("langToggle");
  if (!btn) return;
  const target = lang === "ar" ? "en" : "ar";
  const code = target.toUpperCase();
  const label = target === "en" ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064A\u0629";
  const aria = target === "en" ? "Switch to English" : "\u0627\u0644\u062A\u0628\u062F\u064A\u0644 \u0625\u0644\u0649 \u0627\u0644\u0639\u0631\u0628\u064A\u0629";
  const codeEl = btn.querySelector("[data-lang-code]");
  const labelEl = btn.querySelector("[data-lang-label]");
  if (codeEl) codeEl.textContent = code;
  if (labelEl) labelEl.textContent = label;
  btn.setAttribute("aria-label", aria);
}
function updateThemeToggle(theme) {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.setAttribute("aria-pressed", theme === "light");
  const text = document.getElementById("themeToggleText");
  const icon = document.getElementById("themeToggleIcon");
  const lang = getCurrentLanguage();
  const meta = THEMES[theme] || THEMES.dark;
  if (text) text.textContent = meta.label[lang] || meta.label.ar;
  if (icon) icon.textContent = meta.icon;
}
function applyTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  document.documentElement.classList.toggle("dark", next === "dark");
  updateThemeToggle(next);
}
function applyLanguage(language) {
  const next = language === "en" ? "en" : "ar";
  const direction = next === "en" ? "ltr" : "rtl";
  const root = document.documentElement;
  root.setAttribute("lang", next);
  root.setAttribute("dir", direction);
  root.setAttribute("data-language", next);
  applyI18nText(next);
  applyAutomaticUiTranslation(next);
  updateLanguageToggle(next);
  updateThemeToggle(root.getAttribute("data-theme") || getStoredTheme());
}
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
  }
  applyTheme(next);
}
function toggleLanguage() {
  const current = getCurrentLanguage();
  const next = current === "ar" ? "en" : "ar";
  try {
    localStorage.setItem(LANGUAGE_KEY, next);
  } catch {
  }
  applyLanguage(next);
}
function initializePreferenceButtons() {
  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn && themeBtn.dataset.bound !== "1") {
    themeBtn.addEventListener("click", toggleTheme);
    themeBtn.dataset.bound = "1";
  }
  const langBtn = ensureLanguageToggle();
  if (langBtn && langBtn.dataset.bound !== "1") {
    langBtn.addEventListener("click", toggleLanguage);
    langBtn.dataset.bound = "1";
  }
  applyI18nText(getCurrentLanguage());
  applyAutomaticUiTranslation(getCurrentLanguage());
  updateLanguageToggle(getCurrentLanguage());
  updateThemeToggle(
    document.documentElement.getAttribute("data-theme") || getStoredTheme()
  );
  ensureAutoTranslationObserver();
}
applyLanguage(getStoredLanguage());
applyTheme(getStoredTheme());
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePreferenceButtons);
} else {
  initializePreferenceButtons();
}
export {
  applyLanguage,
  applyTheme,
  getCurrentLanguage
};
