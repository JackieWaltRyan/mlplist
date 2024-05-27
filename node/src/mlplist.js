import sha256 from "crypto-js/sha256";
import {XMLParser} from "fast-xml-parser";

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

    createCategoriesMenu.call(this);
    createLanguagesMenu.call(this);
    createFilterMenu.call(this);

    document.getElementById("header_search").addEventListener("keyup", (event) => {
        createTable.call(this, event.target.value);
    });

    loadUserData.call(this);
    createTable.call(this);
}

export function createCategoriesMenu() {
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
            this.root.categoriesData = JSON.parse(xhr.responseText);

            let itemList = [];
            let trigger = true;

            for (let item in this.root.categoriesData) {
                if (trigger && !this.getURL.searchParams.get("page")) {
                    this.getURL.searchParams.set("page", encodeURIComponent(this.root.categoriesData[item]["page"]));

                    history.pushState(null, null, this.getURL.href);

                    trigger = false;
                }

                document.getElementById("menu_lists_content").appendChild(createElement("div", {
                    class: "menu_block_content_item"
                }, (el) => {
                    el.innerText = item;

                    itemList.push(el);

                    if (this.root.categoriesData[item]["page"] === decodeURIComponent(this.getURL.searchParams.get("page"))) {
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
                        if (decodeURIComponent(this.getURL.searchParams.get("page")) !== this.root.categoriesData[item]["page"]) {
                            this.getURL.searchParams.set("page", encodeURIComponent(this.root.categoriesData[item]["page"]));

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
                createCategoriesMenu.call(this);
            }, 1000);
        }
    });

    xhr.addEventListener("error", () => {
        setTimeout(() => {
            createCategoriesMenu.call(this);
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
            this.root.languagesData = JSON.parse(xhr.responseText);

            let itemList = [];

            for (let item in this.root.languagesData) {
                document.getElementById("menu_languages_content").appendChild(createElement("div", {
                    class: "menu_block_content_item"
                }, (el) => {
                    el.innerText = item;

                    itemList.push(el);

                    if (this.root.languagesData[item] === localStorage.getItem("mlplist_language")) {
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
                        if (this.root.languagesData[item] !== localStorage.getItem("mlplist_language")) {
                            localStorage.setItem("mlplist_language", this.root.languagesData[item]);

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

export function createUserMenu() {
    if (localStorage.getItem("mlplist_user") && localStorage.getItem("mlplist_password")) {
        let headerLogin = document.getElementById("header_login").cloneNode(true);
        let menuUser = document.getElementById("menu_user");

        document.getElementById("header_login").parentNode.replaceChild(headerLogin, document.getElementById("header_login"));

        headerLogin.value = localStorage.getItem("mlplist_user");
        document.getElementById("menu_user_name").innerText = localStorage.getItem("mlplist_user");

        headerLogin.addEventListener("click", () => {
            menuUser.style.display = "flex";
        });

        if (!this.createUserMenu) {
            menuUser.addEventListener("click", (event) => {
                if (event.target === menuUser) {
                    menuUser.style.display = "none";
                }
            });

            document.getElementById("menu_user_close").addEventListener("click", () => {
                menuUser.style.display = "none";
            });

            document.getElementById("menu_user_list").addEventListener("click", () => {
                this.getURL.searchParams.delete("user");

                history.pushState(null, null, this.getURL.href);

                menuUser.style.display = "none";

                loadUserData.call(this);
                createTable.call(this);
            });

            document.getElementById("menu_user_logout").addEventListener("click", () => {
                localStorage.removeItem("mlplist_user");
                localStorage.removeItem("mlplist_password");

                menuUser.style.display = "none";

                createMessage.call(this, "info", "Вы вышли из аккаунта");

                createLoginMenu.call(this);
                createTable.call(this);
            });

            document.getElementById("menu_user_password_change").addEventListener("submit", () => {
                let password_old = sha256(document.getElementById("menu_user_password_old").value).toString();
                let password_new = sha256(document.getElementById("menu_user_password_new").value).toString();
                let password_new_2 = sha256(document.getElementById("menu_user_password_new_2").value).toString();

                if (password_new !== password_new_2) {
                    createMessage.call(this, "alert", "Новые пароли не совпадают!");

                    return null;
                }

                let user = findOne.call(this, {
                    "_id": localStorage.getItem("mlplist_user"),
                    "password": localStorage.getItem("mlplist_password")
                });

                if (user === "Ошибка загрузки") {
                    createMessage.call(this, "error", "Ошибка соединения! Попробуйте еще раз...");

                    return null;
                }

                if (password_old !== user["password"]) {
                    createMessage.call(this, "alert", "Старый пароль неверный!");

                    return null;
                }

                if (updateOne.call(this, {
                    "_id": localStorage.getItem("mlplist_user"),
                    "password": localStorage.getItem("mlplist_password")
                }, {
                    "$set": {
                        "password": password_new
                    }
                })) {
                    document.getElementById("menu_user_password_old").value = "";
                    document.getElementById("menu_user_password_new").value = "";
                    document.getElementById("menu_user_password_new_2").value = "";

                    createMessage.call(this, "info", "Пароль успешно изменен! Требуется повторный вход!");

                    document.getElementById("menu_user_logout").click();
                } else {
                    createMessage.call(this, "error", "Ошибка соединения! Попробуйте еще раз...");
                }
            });

            let savefile = document.getElementById("menu_user_savefile");
            let importData = document.getElementById("menu_user_import_data");

            savefile.addEventListener("input", () => {
                if (savefile.files.length !== 0) {
                    try {
                        importData.innerText = "Чтение...";

                        let reader = new FileReader();

                        reader.addEventListener("load", () => {
                            try {
                                importData.innerText = "Обработка...";

                                let parser = new XMLParser({
                                    ignoreAttributes: false,
                                    allowBooleanAttributes: true,

                                    transformTagName: (tagName) => {
                                        return tagName.toLowerCase();
                                    },
                                    transformAttributeName: (attributeName) => {
                                        return attributeName.toLowerCase();
                                    },

                                    isArray: (name) => {
                                        return [
                                            "profileavataritemidowned",
                                            "profileavatarframeitemidowned",
                                            "playercardbackgrounditemidowned",
                                            "playercardbackgroundframeitemidowned",
                                            "playercardcutiemarkitemidowned",
                                            "ownedtheme",
                                            "ownedrbp",
                                            "storeditem",
                                            "mapzone",
                                            "object",
                                            "altpony",
                                            "ownpet",
                                            "item"
                                        ].includes(name);
                                    }
                                });

                                let saveData = parser.parse(reader.result.toString());

                                let parseData = {};

                                for (let item in this.root.categoriesData) {
                                    let page = this.root.categoriesData[item]["page"];

                                    if (page === "profileavatar") {
                                        try {
                                            saveData["mlp_save"]["playerdata"]["profileavatarselection"]["profileavataritemidowned"].forEach((element) => {
                                                if (!(page in parseData)) {
                                                    parseData[page] = [];
                                                }

                                                if (!parseData[page].includes(element["@_id"])) {
                                                    parseData[page].push(element["@_id"]);
                                                }
                                            });
                                        } catch {
                                        }
                                    }

                                    if (page === "profileavatarframe") {
                                        try {
                                            saveData["mlp_save"]["playerdata"]["profileavatarselection"]["profileavatarframeitemidowned"].forEach((element) => {
                                                if (!(page in parseData)) {
                                                    parseData[page] = [];
                                                }

                                                if (!parseData[page].includes(element["@_id"])) {
                                                    parseData[page].push(element["@_id"]);
                                                }
                                            });
                                        } catch {
                                        }
                                    }

                                    if (page === "playercardbackground") {
                                        try {
                                            saveData["mlp_save"]["playerdata"]["playercard"]["playercardbackgrounditemidowned"].forEach((element) => {
                                                if (!(page in parseData)) {
                                                    parseData[page] = [];
                                                }

                                                if (!parseData[page].includes(element["@_id"])) {
                                                    parseData[page].push(element["@_id"]);
                                                }
                                            });
                                        } catch {
                                        }
                                    }

                                    if (page === "playercardbackgroundframe") {
                                        try {
                                            saveData["mlp_save"]["playerdata"]["playercard"]["playercardbackgroundframeitemidowned"].forEach((element) => {
                                                if (!(page in parseData)) {
                                                    parseData[page] = [];
                                                }

                                                if (!parseData[page].includes(element["@_id"])) {
                                                    parseData[page].push(element["@_id"]);
                                                }
                                            });
                                        } catch {
                                        }
                                    }

                                    if (page === "playercardcutiemark") {
                                        try {
                                            saveData["mlp_save"]["playerdata"]["playercard"]["playercardcutiemarkitemidowned"].forEach((element) => {
                                                if (!(page in parseData)) {
                                                    parseData[page] = [];
                                                }

                                                if (!parseData[page].includes(element["@_id"])) {
                                                    parseData[page].push(element["@_id"]);
                                                }
                                            });
                                        } catch {
                                        }
                                    }

                                    if (page === "theme") {
                                        try {
                                            saveData["mlp_save"]["playerdata"]["themes"]["ownedtheme"].forEach((element) => {
                                                if (!(page in parseData)) {
                                                    parseData[page] = [];
                                                }

                                                if (!parseData[page].includes(element["@_id"])) {
                                                    parseData[page].push(element["@_id"]);
                                                }
                                            });
                                        } catch {
                                        }
                                    }

                                    if (page === "path") {
                                        try {
                                            saveData["mlp_save"]["playerdata"]["roadbuildingpermit"]["ownedrbp"].forEach((element) => {
                                                if (!(page in parseData)) {
                                                    parseData[page] = [];
                                                }

                                                if (!parseData[page].includes(element["@_id"])) {
                                                    parseData[page].push(element["@_id"]);
                                                }
                                            });
                                        } catch {
                                        }
                                    }

                                    if (page === "pony") {
                                        try {
                                            saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((element) => {
                                                if (element["@_id"].startsWith("Pony_")) {
                                                    if (!(page in parseData)) {
                                                        parseData[page] = [];
                                                    }

                                                    if (!parseData[page].includes(element["@_id"])) {
                                                        parseData[page].push(element["@_id"]);
                                                    }
                                                }
                                            });
                                        } catch {
                                        }

                                        try {
                                            saveData["mlp_save"]["mapzone"].forEach((zone) => {
                                                zone["gameobjects"]["pony_objects"]["object"].forEach((element) => {
                                                    if (!(page in parseData)) {
                                                        parseData[page] = [];
                                                    }

                                                    if (!parseData[page].includes(element["@_id"])) {
                                                        parseData[page].push(element["@_id"]);
                                                    }
                                                });
                                            });
                                        } catch {
                                        }

                                        try {
                                            saveData["mlp_save"]["playerdata"]["ownedalterformofpony"]["altpony"].forEach((element) => {
                                                if (!(page in parseData)) {
                                                    parseData[page] = [];
                                                }

                                                if (!parseData[page].includes(element["@_id"])) {
                                                    parseData[page].push(element["@_id"]);
                                                }
                                            });
                                        } catch {
                                        }
                                    }

                                    if (page === "pony_house") {
                                        try {
                                            saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((element) => {
                                                if (element["@_id"].startsWith("House_")) {
                                                    if (!(page in parseData)) {
                                                        parseData[page] = [];
                                                    }

                                                    if (!parseData[page].includes(element["@_id"])) {
                                                        parseData[page].push(element["@_id"]);
                                                    }
                                                }
                                            });
                                        } catch {
                                        }

                                        try {
                                            saveData["mlp_save"]["mapzone"].forEach((zone) => {
                                                zone["gameobjects"]["pony_house_objects"]["object"].forEach((element) => {
                                                    if (!(page in parseData)) {
                                                        parseData[page] = [];
                                                    }

                                                    if (!parseData[page].includes(element["@_id"])) {
                                                        parseData[page].push(element["@_id"]);
                                                    }
                                                });
                                            });
                                        } catch {
                                        }
                                    }

                                    if (page === "ponypet") {
                                        try {
                                            saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((element) => {
                                                if (element["@_id"].startsWith("Pet_")) {
                                                    if (!(page in parseData)) {
                                                        parseData[page] = [];
                                                    }

                                                    if (!parseData[page].includes(element["@_id"])) {
                                                        parseData[page].push(element["@_id"]);
                                                    }
                                                }
                                            });
                                        } catch {
                                        }

                                        try {
                                            saveData["mlp_save"]["mapzone"].forEach((zone) => {
                                                zone["gameobjects"]["pony_objects"]["object"].forEach((pony) => {
                                                    try {
                                                        pony["pet"]["ownpet"].forEach((element) => {
                                                            if (!(page in parseData)) {
                                                                parseData[page] = [];
                                                            }

                                                            if (!parseData[page].includes(element["@_id"])) {
                                                                parseData[page].push(element["@_id"]);
                                                            }
                                                        });
                                                    } catch {
                                                    }
                                                });
                                            });
                                        } catch {
                                        }

                                        try {
                                            saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((stored) => {
                                                try {
                                                    stored["pet"]["ownpet"].forEach((element) => {
                                                        if (!(page in parseData)) {
                                                            parseData[page] = [];
                                                        }

                                                        if (!parseData[page].includes(element["@_id"])) {
                                                            parseData[page].push(element["@_id"]);
                                                        }
                                                    });
                                                } catch {
                                                }
                                            });
                                        } catch {
                                        }
                                    }

                                    if (page === "ponyset") {
                                        try {
                                            let xhr = new XMLHttpRequest();

                                            xhr.open("GET", "../categoryes/ponyset.json", false);

                                            xhr.addEventListener("load", () => {
                                                if (xhr.status === 200) {
                                                    let ponysetData = JSON.parse(xhr.responseText);

                                                    let boughtedList = [];

                                                    saveData["mlp_save"]["ponypartsdata"]["boughtedlist"]["item"].forEach((element) => {
                                                        if (!boughtedList.includes(element["@_id"])) {
                                                            boughtedList.push(element["@_id"]);
                                                        }
                                                    });

                                                    for (let set in ponysetData) {
                                                        if (ponysetData[set]["Части"].every((element) => {
                                                            return boughtedList.includes(element);
                                                        })) {
                                                            if (!(page in parseData)) {
                                                                parseData[page] = [];
                                                            }

                                                            parseData[page].push(ponysetData[set]["id"]);
                                                        }
                                                    }
                                                }
                                            });

                                            xhr.send();
                                        } catch {
                                        }
                                    }
                                }

                                let insertData = {};

                                importData.innerHTML = "";

                                if (Object.keys(parseData).length > 0) {
                                    for (let item in this.root.categoriesData) {
                                        let page = this.root.categoriesData[item]["page"];

                                        if ((page in parseData) && (parseData[page].length > 0)) {
                                            importData.appendChild(createElement("label", {
                                                class: "menu_user_import_data_label"
                                            }, (el) => {
                                                el.appendChild(createElement("input", {
                                                    type: "checkbox",
                                                    checked: "true"
                                                }, (el2) => {
                                                    insertData[page] = parseData[page];

                                                    el2.addEventListener("change", () => {
                                                        if (el2.checked) {
                                                            insertData[page] = parseData[page];
                                                        } else {
                                                            delete insertData[page];
                                                        }
                                                    });
                                                }));

                                                el.appendChild(createElement("span", {}, (el2) => {
                                                    el2.innerText = (item + " (найдено: " + parseData[page].length + ")");
                                                }));
                                            }));
                                        }
                                    }

                                    importData.appendChild(createElement("span", {
                                        class: "menu_block_content_login_span"
                                    }, (el) => {
                                        el.innerText = "Внимание: импорт заменит все старые данные в выбранных категориях!";
                                    }));

                                    importData.appendChild(createElement("input", {
                                        class: "menu_block_content_login_button",
                                        type: "button",
                                        value: "Импортировать"
                                    }, (el) => {
                                        el.style.width = "auto";

                                        el.addEventListener("click", () => {
                                            if (Object.keys(insertData).length > 0) {
                                                if (updateOne.call(this, {
                                                    "_id": localStorage.getItem("mlplist_user"),
                                                    "password": localStorage.getItem("mlplist_password")
                                                }, {
                                                    "$set": insertData
                                                })) {
                                                    importData.innerHTML = "";

                                                    createMessage.call(this, "info", "Данные успешно импортированы.");

                                                    loadUserData.call(this);
                                                    createTable.call(this);
                                                } else {
                                                    createMessage.call(this, "error", "Ошибка соединения! Попробуйте еще раз...");
                                                }
                                            } else {
                                                createMessage.call(this, "alert", "Должна быть выбрана хотябы одна категория!");
                                            }
                                        });
                                    }));
                                } else {
                                    importData.innerText = "Обработка завершена. Ничего не найдено.";
                                }
                            } catch {
                                importData.innerText = "Во время обработки файла возникла ошибка. Возможно неверный файл, или данные в нем повреждены...";
                            }
                        });

                        reader.readAsText(savefile.files[0]);
                    } catch {
                        importData.innerText = "Во время чтения файла возникла ошибка. Возможно неверный файл, или данные в нем повреждены...";
                    }
                }
            });

            this.createUserMenu = true;
        }
    } else {
        createLoginMenu.call(this);
    }
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

        return null;
    }

    if (!(/^[a-zA-Z0-9]+$/.test(login))) {
        createMessage.call(this, "alert", "Логин содержит недопустимые символы!");

        return null;
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
