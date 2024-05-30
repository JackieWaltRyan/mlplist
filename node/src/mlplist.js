import sha256 from "crypto-js/sha256";

import {findOne, insertOne, updateOne} from "./mongo";
import {createElement, createMessage, updateTitle, zoomIn, zoomOut} from "./utils";
import {
    createCategoriesMenu,
    createFilterMenu,
    createLanguagesMenu,
    createLoginMenu,
    createSortMenu,
    createUserMenu
} from "./menu";

export function init() {
    this.getURL = new URL(location.href);
    this.title = new updateTitle();
    this.searchTimeout = null;
    this.loading = document.getElementById("loading");

    this.root = {
        filter: {
            available: null,
            sity: []
        },
        sorts: {
            reverse: false,
            name: null
        }
    };

    createCategoriesMenu.call(this);
    createLanguagesMenu.call(this);
    createFilterMenu.call(this);
    createSortMenu.call(this);

    document.getElementById("header_search").addEventListener("keyup", (event) => {
        clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(() => {
            this.loading.style.display = "flex";

            createTable.call(this, event.target.value);
        }, 2000);
    });

    loadUserData.call(this);
    createTable.call(this);
}

export function loadLanguageFile() {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", ("_resources/data/languages/" + localStorage.getItem("mlplist_language")), false);

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

        if (this.root.userData === null) {
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

            if (this.root.userData["_id"] === localStorage.getItem("mlplist_user")) {
                let admin = findOne.call(this, {
                    "password": localStorage.getItem("mlplist_password")
                });

                if (admin) {
                    if (this.root.userData["_id"] === admin["_id"]) {
                        this.root.userData["password"] = localStorage.getItem("mlplist_password");
                    }
                }
            }

            createTable.call(this);
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

        createUserMenu.call(this);
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

    if (!this.root.langData) {
        loadLanguageFile.call(this);

        setTimeout(() => {
            createTable.call(this, search);
        }, 1000);
    }

    for (let cat in this.root.categoriesData) {
        try {
            let page = decodeURIComponent(this.getURL.searchParams.get("page"));

            if (this.root.categoriesData[cat]["page"] === page) {
                let catData = this.root.categoriesData[cat]["data"];

                let itemList = Object.keys(catData).sort((a, b) => {
                    return (parseInt(a) - parseInt(b));
                });

                if (this.root.sorts.reverse) {
                    itemList = itemList.reverse();
                }

                if (this.root.sorts.name !== null) {
                    itemList = Object.keys(catData).sort((a, b) => {
                        if (this.root.langData[catData[a]["name"]] > this.root.langData[catData[b]["name"]]) {
                            return 1;
                        }

                        if (this.root.langData[catData[a]["name"]] < this.root.langData[catData[b]["name"]]) {
                            return -1;
                        }

                        return 0;
                    });

                    if (this.root.sorts.name === false) {
                        itemList = itemList.reverse();
                    }
                }

                for (let item of itemList) {
                    try {
                        if (search) {
                            let search_input = document.getElementById("header_search");

                            if (search_input.value !== search) {
                                search_input.value = search;
                            }

                            if (decodeURIComponent(this.getURL.searchParams.get("search")) !== search) {
                                this.getURL.searchParams.set("search", encodeURIComponent(search));

                                history.pushState(null, null, this.getURL.href);
                            }

                            let text = (item + this.root.langData[catData[item]["name"]]);

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

                        if ((this.root.filter.available !== null) && this.root.userData && (page in this.root.userData)) {
                            if (this.root.filter.available !== this.root.userData[page].includes(catData[item]["id"])) {
                                continue;
                            }
                        } else {
                            if (this.root.filter.available && !(page in this.root.userData)) {
                                continue;
                            }
                        }

                        if (this.root.filter.sity.length > 0) {
                            let trigger = true;

                            if (!catData[item]["sity"]) {
                                continue;
                            }

                            catData[item]["sity"].forEach((element) => {
                                try {
                                    if (trigger && this.root.filter.sity.includes(element)) {
                                        trigger = false;
                                    }
                                } catch {
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
                                src: ("_resources/images/" + catData[item]["image"])
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
                                el2.innerText = this.root.langData[catData[item]["name"]];

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
                                                    "_id": this.root.userData["_id"],
                                                    "password": localStorage.getItem("mlplist_password")
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
                                                    "_id": this.root.userData["_id"],
                                                    "password": localStorage.getItem("mlplist_password")
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
                    } catch {
                    }
                }

                let filterTitle = document.getElementById("menu_filter_title");

                if ((this.root.filter.available !== null) || (this.root.filter.sity.length > 0)) {
                    filterTitle.innerText = "Фильтр (найдено: " + content.children.length + "):";
                } else {
                    filterTitle.innerText = "Фильтр:";
                }

                setTimeout(() => {
                    this.loading.style.display = "none";
                }, 250);
            }
        } catch {
        }
    }
}

export function login() {
    let login = document.getElementById("menu_login_value_login").value;
    let password = sha256(document.getElementById("menu_login_value_password").value).toString();

    let user = findOne.call(this, {
        "_id": login,
        "password": password
    });

    if (user === null) {
        createMessage.call(this, "error", "Ошибка соединения! Попробуйте еще раз...");

        return null;
    }

    if (user) {
        this.loading.style.display = "flex";

        localStorage.setItem("mlplist_user", login);
        localStorage.setItem("mlplist_password", password);

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

        return null;
    }

    if (!(/^[a-zA-Z0-9]+$/.test(login))) {
        createMessage.call(this, "alert", "Логин содержит недопустимые символы!");

        return null;
    }

    let user = findOne.call(this, {
        "_id": login
    });

    if (user === null) {
        createMessage.call(this, "error", "Ошибка соединения! Попробуйте еще раз...");

        return null;
    }

    if (user) {
        createMessage.call(this, "alert", "Это имя пользователя уже занято!");
    } else {
        if (insertOne.call(this, {
            "_id": login,
            "password": password
        })) {
            this.loading.style.display = "flex";

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
