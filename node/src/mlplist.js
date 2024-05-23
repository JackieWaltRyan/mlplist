import sha256 from "crypto-js/sha256";

import {findOne, insertOne, updateOne, updateToken} from "./mongo";
import {createElement, createMessage, titleCase, updateTitle, zoomIn, zoomOut} from "./utils";

export function init() {
    this.getURL = new URL(location.href);
    this.title = new updateTitle();
    this.root = {
        filter: {
            available: null,
            sity: []
        }
    };

    updateToken.call(this);

    if (!this.token) {
        setTimeout(() => {
            init.call(this);
        }, 1000);
    }

    createListsMenu.call(this);
    createLanguagesMenu.call(this);
    createFilterMenu.call(this);

    document.getElementById("header_search").addEventListener("keyup", (event) => {
        createTable.call(this, event.target.value);
    });

    loadUserData.call(this);
    createTable.call(this);
}

export function createListsMenu() {
    let headerLists = document.getElementById("header_lists");
    let menuLists = document.getElementById("menu_lists");

    headerLists.addEventListener("click", () => {
        menuLists.style.display = "flex";
    });

    menuLists.addEventListener("click", (event) => {
        if (event.target === menuLists) {
            menuLists.style.display = "none";
        }
    });

    document.getElementById("menu_lists_close").addEventListener("click", () => {
        menuLists.style.display = "none";
    });

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "../categoryes.json", false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            let categories = JSON.parse(xhr.responseText);
            let itemList = [];
            let trigger = true;

            for (let item in categories) {
                if (trigger && !this.getURL.searchParams.get("page")) {
                    this.getURL.searchParams.set("page", encodeURIComponent(categories[item]["page"]));

                    history.pushState(null, null, this.getURL.href);

                    trigger = false;
                }

                document.getElementById("menu_lists_content").appendChild(createElement("div", {
                    class: "menu_block_content_item"
                }, (el) => {
                    el.innerText = item;

                    itemList.push(el);

                    if (categories[item]["page"] === decodeURIComponent(this.getURL.searchParams.get("page"))) {
                        el.classList.add("menu_block_content_item_active");

                        headerLists.value = ("Список: " + item);

                        this.title.update({
                            category: item
                        });

                        for (let i in itemList) {
                            if (itemList[i] === el) {
                                itemList[i].classList.add("menu_block_content_item_active");
                            } else {
                                itemList[i].classList.remove("menu_block_content_item_active");
                            }
                        }
                    }

                    el.addEventListener("click", () => {
                        if (decodeURIComponent(this.getURL.searchParams.get("page")) !== categories[item]["page"]) {
                            this.getURL.searchParams.set("page", encodeURIComponent(categories[item]["page"]));

                            history.pushState(null, null, this.getURL.href);

                            this.title.update({
                                category: item
                            });

                            for (let i in itemList) {
                                if (itemList[i] === el) {
                                    itemList[i].classList.add("menu_block_content_item_active");
                                } else {
                                    itemList[i].classList.remove("menu_block_content_item_active");
                                }
                            }

                            headerLists.value = ("Список: " + item);

                            createTable.call(this);
                        }
                    });
                }));
            }
        } else {
            setTimeout(() => {
                createListsMenu.call(this);
            }, 1000);
        }
    });

    xhr.addEventListener("error", () => {
        setTimeout(() => {
            createListsMenu.call(this);
        }, 1000);
    });

    xhr.send();
}

export function createLanguagesMenu() {
    if (!localStorage.getItem("mlplist_language")) {
        localStorage.setItem("mlplist_language", "russian.json");
    }

    let headerLanguages = document.getElementById("header_languages");
    let menuLanguages = document.getElementById("menu_languages");

    headerLanguages.addEventListener("click", () => {
        menuLanguages.style.display = "flex";
    });

    menuLanguages.addEventListener("click", (event) => {
        if (event.target === menuLanguages) {
            menuLanguages.style.display = "none";
        }
    });

    document.getElementById("menu_languages_close").addEventListener("click", () => {
        menuLanguages.style.display = "none";
    });

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "../languages.json", false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            let languages = JSON.parse(xhr.responseText);
            let itemList = [];

            for (let item in languages) {
                document.getElementById("menu_languages_content").appendChild(createElement("div", {
                    class: "menu_block_content_item"
                }, (el) => {
                    el.innerText = item;

                    itemList.push(el);

                    if (languages[item] === localStorage.getItem("mlplist_language")) {
                        el.classList.add("menu_block_content_item_active");

                        headerLanguages.value = ("Язык: " + item);

                        loadLanguageFile.call(this);

                        for (let i in itemList) {
                            if (itemList[i] === el) {
                                itemList[i].classList.add("menu_block_content_item_active");
                            } else {
                                itemList[i].classList.remove("menu_block_content_item_active");
                            }
                        }
                    }

                    el.addEventListener("click", () => {
                        if (languages[item] !== localStorage.getItem("mlplist_language")) {
                            localStorage.setItem("mlplist_language", languages[item]);

                            for (let i in itemList) {
                                if (itemList[i] === el) {
                                    itemList[i].classList.add("menu_block_content_item_active");
                                } else {
                                    itemList[i].classList.remove("menu_block_content_item_active");
                                }
                            }

                            headerLanguages.value = ("Язык: " + item);

                            loadLanguageFile.call(this);
                            createTable.call(this);
                            createFilterMenu.call(this);
                        }
                    });
                }));
            }
        } else {
            setTimeout(() => {
                createLanguagesMenu.call(this);
            }, 1000);
        }
    });

    xhr.addEventListener("error", () => {
        setTimeout(() => {
            createLanguagesMenu.call(this);
        }, 1000);
    });

    xhr.send();
}

export function loadLanguageFile() {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", ("../languages/" + localStorage.getItem("mlplist_language")), false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            this.root.langData = JSON.parse(xhr.responseText);
        } else {
            setTimeout(() => {
                loadLanguageFile.call(this);
            }, 1000);
        }
    });

    xhr.addEventListener("error", () => {
        setTimeout(() => {
            loadLanguageFile.call(this);
        }, 1000);
    });

    xhr.send();
}

export function createFilterMenu() {
    let headerFilter = document.getElementById("header_filter");
    let menuFilter = document.getElementById("menu_filter");

    headerFilter.addEventListener("click", () => {
        menuFilter.style.display = "flex";
    });

    menuFilter.addEventListener("click", (event) => {
        if (event.target === menuFilter) {
            menuFilter.style.display = "none";
        }
    });

    document.getElementById("menu_filter_close").addEventListener("click", () => {
        menuFilter.style.display = "none";
    });

    let filterAvailableTrue = document.getElementById("filter_available_true");
    let filterAvailableFalse = document.getElementById("filter_available_false");

    filterAvailableTrue.addEventListener("change", () => {
        if (filterAvailableTrue.checked) {
            filterAvailableFalse.checked = false;

            this.root.filter.available = true;
        } else {
            this.root.filter.available = null;
        }

        createTable.call(this);
    });

    filterAvailableFalse.addEventListener("change", () => {
        if (filterAvailableFalse.checked) {
            filterAvailableTrue.checked = false;

            this.root.filter.available = false;
        } else {
            this.root.filter.available = null;
        }

        createTable.call(this);
    });

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "../mapzones.json", false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            let mapzones = JSON.parse(xhr.responseText);
            let content = document.getElementById("menu_filter_content");

            content.innerHTML = "";

            for (let item in mapzones) {
                content.appendChild(createElement("label", {
                    class: "menu_block_content_item"
                }, (el) => {
                    el.appendChild(createElement("input", {
                        class: "menu_filter_input",
                        type: "checkbox"
                    }, (el2) => {
                        el2.addEventListener("change", () => {
                            if (el2.checked) {
                                this.root.filter.sity = this.root.filter.sity.concat(mapzones[item]);
                            } else {
                                mapzones[item].forEach((element) => {
                                    let pos = this.root.filter.sity.indexOf(element);
                                    this.root.filter.sity.splice(pos, 1);
                                });
                            }

                            createTable.call(this);
                        });
                    }));

                    el.appendChild(createElement("span", {}, (el2) => {
                        el2.innerText = titleCase.call(this, this.root.langData[item]);
                    }));
                }));
            }
        } else {
            setTimeout(() => {
                createFilterMenu.call(this);
            }, 1000);
        }
    });

    xhr.addEventListener("error", () => {
        setTimeout(() => {
            createFilterMenu.call(this);
        }, 1000);
    });

    xhr.send();
}

export function loadUserData() {
    if (!this.getURL.searchParams.get("user")) {
        if (localStorage.getItem("mlplist_user")) {
            this.getURL.searchParams.set("user", localStorage.getItem("mlplist_user"));

            history.pushState(null, null, this.getURL.href);
        }
    }

    if (this.getURL.searchParams.get("user")) {
        this.root.userData = findOne.call(this, {
            "_id": decodeURIComponent(this.getURL.searchParams.get("user"))
        });

        if (this.root.userData === "Ошибка загрузки") {
            createMessage.call(this, "error", "Ошибка соединения! Повторная попытка...");

            setTimeout(() => {
                loadUserData.call(this);
            }, 1000);

            return null;
        }

        if (this.root.userData) {
            let headerTitle = document.getElementById("header_title");

            headerTitle.style.display = "block";
            headerTitle.innerText = ("Список пользователя " + this.root.userData["_id"]);

            this.title.update({
                user: this.root.userData["_id"]
            });

            if (localStorage.getItem("mlplist_user") && localStorage.getItem("mlplist_password")) {
                let headerLogin = document.getElementById("header_login").cloneNode(true);

                document.getElementById("header_login").parentNode.replaceChild(headerLogin, document.getElementById("header_login"));

                if ((this.root.userData["_id"] === localStorage.getItem("mlplist_user")) && (this.root.userData["password"] === localStorage.getItem("mlplist_password"))) {
                    headerLogin.value = "Выйти из аккаунта";

                    headerLogin.addEventListener("click", () => {
                        localStorage.removeItem("mlplist_user");
                        localStorage.removeItem("mlplist_password");

                        createMessage.call(this, "info", "Вы вышли из аккаунта");

                        createLoginMenu.call(this);
                        createTable.call(this);
                    });
                } else {
                    headerLogin.value = "Открыть мой список";

                    headerLogin.addEventListener("click", () => {
                        this.getURL.searchParams.delete("user");

                        history.pushState(null, null, this.getURL.href);

                        loadUserData.call(this);
                        createTable.call(this);
                    });
                }
            } else {
                createLoginMenu.call(this);
            }
        } else {
            if (this.getURL.searchParams.has("user")) {
                this.getURL.searchParams.delete("user");

                history.pushState(null, null, this.getURL.href);

                this.title.update({
                    user: null
                });

                loadUserData.call(this);
            }
        }
    } else {
        this.title.update({
            user: null
        });

        createLoginMenu.call(this);
    }
}

export function createTable(search = (this.getURL.searchParams.has("search") ? decodeURIComponent(this.getURL.searchParams.get("search")) : "")) {
    let content = document.getElementById("content");

    content.innerHTML = "";

    content.appendChild(createElement("div", {
        class: "loading"
    }, (el) => {
        el.innerText = "Загрузка...";
    }));

    if (!this.root.langData) {
        setTimeout(() => {
            createTable.call(this, search);
        }, 1000);
    }

    let xhr = new XMLHttpRequest();

    xhr.open("GET", ("../categoryes/" + decodeURIComponent(this.getURL.searchParams.get("page")) + ".json"), false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            let catData = JSON.parse(xhr.responseText);

            content.innerHTML = "";

            for (let item in catData) {
                if (search) {
                    let search_input = document.getElementById("header_search");

                    if (search_input.value !== search) {
                        search_input.value = search;
                    }

                    if (decodeURIComponent(this.getURL.searchParams.get("search")) !== search) {
                        this.getURL.searchParams.set("search", encodeURIComponent(search));

                        history.pushState(null, null, this.getURL.href);
                    }

                    let text = (item + this.root.langData[catData[item]["Имя"]]);

                    let result = search.split(",").find((item) => {
                        return text.toLowerCase().includes(item.trim().toLowerCase());
                    })

                    if (!result) {
                        continue;
                    }
                } else {
                    if (this.getURL.searchParams.has("search")) {
                        this.getURL.searchParams.delete("search");

                        history.pushState(null, null, this.getURL.href);
                    }
                }

                let page = decodeURIComponent(this.getURL.searchParams.get("page"));

                if ((this.root.filter.available !== null) && this.root.userData) {
                    if (this.root.filter.available && !(page in this.root.userData)) {
                        continue;
                    }

                    if (this.root.filter.available !== this.root.userData[page].includes(catData[item]["id"])) {
                        continue;
                    }
                }

                if (this.root.filter.sity.length > 0) {
                    let trigger = true;

                    if (!catData[item]["Город"]) {
                        continue;
                    }

                    catData[item]["Город"].forEach((element) => {
                        if (trigger && this.root.filter.sity.includes(element)) {
                            trigger = false;
                        }
                    });

                    if (trigger) {
                        continue;
                    }
                }

                content.appendChild(createElement("div", {
                    class: "content_item"
                }, (el) => {
                    el.appendChild(createElement("img", {
                        class: "content_item_image",
                        src: ("../resources/" + catData[item]["Изображение"])
                    }, (el2) => {
                        el2.addEventListener("mousemove", (event) => {
                            zoomIn.call(this, event);
                        });

                        el2.addEventListener("mouseout", () => {
                            zoomOut.call(this);
                        });
                    }));

                    el.appendChild(createElement("span", {
                        class: "content_item_index copy",
                        title: "Скопировать"
                    }, (el2) => {
                        el2.innerText = item;

                        el2.addEventListener("click", () => {
                            navigator.clipboard.writeText(el2.innerText).then(r => r);
                        });
                    }));

                    el.appendChild(createElement("span", {
                        class: "content_item_name copy",
                        title: "Скопировать"
                    }, (el2) => {
                        el2.innerText = this.root.langData[catData[item]["Имя"]];

                        el2.addEventListener("click", () => {
                            navigator.clipboard.writeText(el2.innerText).then(r => r);
                        });
                    }));

                    if (this.root.userData) {
                        if ((page in this.root.userData) && this.root.userData[page].includes(catData[item]["id"])) {
                            el.classList.add("content_item_green");
                        }

                        if ((this.root.userData["_id"] === localStorage.getItem("mlplist_user")) && (this.root.userData["password"] === localStorage.getItem("mlplist_password"))) {
                            el.appendChild(createElement("input", {
                                class: "content_item_button",
                                type: "button"
                            }, (el2) => {
                                if ((page in this.root.userData) && this.root.userData[page].includes(catData[item]["id"])) {
                                    el2.classList.add("content_item_button_red");
                                    el2.value = "Удалить";
                                } else {
                                    el2.classList.add("content_item_button_green");
                                    el2.value = "Добавить";
                                }

                                el2.addEventListener("click", () => {
                                    let data = {};
                                    data[page] = catData[item]["id"];

                                    if ((page in this.root.userData) && this.root.userData[page].includes(catData[item]["id"])) {
                                        if (updateOne.call(this, {
                                            "_id": this.root.userData["_id"]
                                        }, {
                                            "$pull": data
                                        })) {
                                            let pos = this.root.userData[page].indexOf(catData[item]["id"]);
                                            this.root.userData[page].splice(pos, 1);

                                            el.classList.remove("content_item_green");

                                            el2.classList.remove("content_item_button_red");
                                            el2.classList.add("content_item_button_green");
                                            el2.value = "Добавить";
                                        } else {
                                            createMessage.call(this, "error", "Во время удаления элемента произошла ошибка!");
                                        }
                                    } else {
                                        if (updateOne.call(this, {
                                            "_id": this.root.userData["_id"]
                                        }, {
                                            "$push": data
                                        })) {
                                            if (!(page in this.root.userData)) {
                                                this.root.userData[page] = [];
                                            }

                                            this.root.userData[page].push(catData[item]["id"]);

                                            el.classList.add("content_item_green");

                                            el2.classList.remove("content_item_button_green");
                                            el2.classList.add("content_item_button_red");
                                            el2.value = "Удалить";
                                        } else {
                                            createMessage.call(this, "error", "Во время добавления элемента произошла ошибка!");
                                        }
                                    }
                                });
                            }));
                        }
                    }
                }));
            }

            let filterTitle = document.getElementById("menu_filter_title");

            if ((this.root.filter.available !== null) || (this.root.filter.sity.length > 0)) {
                filterTitle.innerText = "Фильтр (найдено: " + content.children.length + "):";
            } else {
                filterTitle.innerText = "Фильтр:";
            }
        } else {
            setTimeout(() => {
                createTable.call(this, search);
            }, 1000);
        }
    });

    xhr.addEventListener("error", () => {
        setTimeout(() => {
            createTable.call(this, search);
        }, 1000);
    });

    xhr.send();
}

export function createLoginMenu() {
    let menuLogin = document.getElementById("menu_login");
    let headerLogin = document.getElementById("header_login").cloneNode(true);

    document.getElementById("header_login").parentNode.replaceChild(headerLogin, document.getElementById("header_login"));

    headerLogin.value = "Вход";

    headerLogin.addEventListener("click", () => {
        menuLogin.style.display = "flex";
    });

    if (!this.createLoginMenu) {
        menuLogin.addEventListener("click", (event) => {
            if (event.target === menuLogin) {
                menuLogin.style.display = "none";
            }
        });

        document.getElementById("menu_login_close").addEventListener("click", () => {
            menuLogin.style.display = "none";
        });

        let menuHeaderLogin = document.getElementById("menu_login_header_login");
        let menuHeaderRegister = document.getElementById("menu_login_header_register");

        let menuContentLogin = document.getElementById("menu_login_content_login");
        let menuContentRegister = document.getElementById("menu_login_content_register");

        menuHeaderLogin.addEventListener("click", () => {
            menuHeaderLogin.classList.add("menu_block_header_login_tab_avtive");
            menuHeaderRegister.classList.remove("menu_block_header_login_tab_avtive");

            menuContentLogin.style.display = "block";
            menuContentRegister.style.display = "none";
        });

        menuHeaderRegister.addEventListener("click", () => {
            menuHeaderRegister.classList.add("menu_block_header_login_tab_avtive");
            menuHeaderLogin.classList.remove("menu_block_header_login_tab_avtive");

            menuContentRegister.style.display = "block";
            menuContentLogin.style.display = "none";
        });

        menuContentLogin.addEventListener("submit", () => {
            login.call(this);
        });

        menuContentRegister.addEventListener("submit", () => {
            register.call(this);
        });

        this.createLoginMenu = true;
    }
}

export function login() {
    let user = findOne.call(this, {
        "_id": document.getElementById("menu_login_value_login").value,
        "password": sha256(document.getElementById("menu_login_value_password").value).toString()
    });

    if (user === "Ошибка загрузки") {
        createMessage.call(this, "error", "Ошибка соединения! Повторная попытка...");

        setTimeout(() => {
            login.call(this);
        }, 1000);

        return null;
    }

    if (user) {
        localStorage.setItem("mlplist_user", user["_id"]);
        localStorage.setItem("mlplist_password", user["password"]);

        document.getElementById("menu_login").style.display = "none";

        createMessage.call(this, "info", "Добро пожаловать, " + user["_id"]);

        loadUserData.call(this);
        createTable.call(this);
    } else {
        createMessage.call(this, "alert", "Логин/Пароль неверные!");
    }
}

export function register() {
    let login = document.getElementById("menu_register_value_login").value;
    let password = sha256(document.getElementById("menu_register_value_password").value).toString();
    let password_2 = sha256(document.getElementById("menu_register_value_password_2").value).toString();

    if (password !== password_2) {
        createMessage.call(this, "alert", "Пароли не совпадают!");

        return false;
    }

    if (!(/^[a-zA-Z0-9]+$/.test(login))) {
        createMessage.call(this, "alert", "Логин содержит недопустимые символы!");

        return false;
    }

    let user = findOne.call(this, {
        "_id": login
    });

    if (user === "Ошибка загрузки") {
        createMessage.call(this, "error", "Ошибка соединения! Повторная попытка...");

        setTimeout(() => {
            register.call(this);
        }, 1000);

        return null;
    }

    if (user) {
        createMessage.call(this, "alert", "Это имя пользователя уже занято!");
    } else {
        if (insertOne.call(this, {
            "_id": login,
            "password": password
        })) {
            localStorage.setItem("mlplist_user", login);
            localStorage.setItem("mlplist_password", password);

            document.getElementById("menu_login").style.display = "none";

            createMessage.call(this, "info", "Регистрация успешна!");
            createMessage.call(this, "info", "Добро пожаловать, " + login);

            loadUserData.call(this);
            createTable.call(this);
        } else {
            createMessage.call(this, "error", "Во время регистрации произошла ошибка!");
        }
    }
}
