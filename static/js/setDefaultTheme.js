// If theme is not found in localstorage, then save it
if (!localStorage.getItem("blackjack-ui-theme")) {
    localStorage.setItem("blackjack-ui-theme", "light");
};