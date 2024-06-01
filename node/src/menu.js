import sha256 from "crypto-js/sha256";
import {XMLParser} from "fast-xml-parser";

import {createElement, createMessage, titleCase} from "./utils";
import {createTable, loadLanguageFile, loadUserData, login, register} from "./mlplist";
import {findOne, updateOne} from "./mongo";


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

    xhr.open("GET", "_resources/data/categoryes.json", false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            this.root.categoriesData = JSON.parse(xhr.responseText);

            let itemList = [];
            let trigger = true;

            for (let item in this.root.categoriesData) {
                try {
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
                                category: item,
                                all: Object.keys(this.root.categoriesData[item]["data"]).length
                            });

                            for (let i in itemList) {
                                try {
                                    if (itemList[i] === el) {
                                        itemList[i].classList.add("menu_block_content_item_active");
                                    } else {
                                        itemList[i].classList.remove("menu_block_content_item_active");
                                    }
                                } catch {
                                }
                            }
                        }

                        el.addEventListener("click", () => {
                            if (decodeURIComponent(this.getURL.searchParams.get("page")) !== this.root.categoriesData[item]["page"]) {
                                this.loading.style.display = "flex";

                                this.getURL.searchParams.set("page", encodeURIComponent(this.root.categoriesData[item]["page"]));

                                history.pushState(null, null, this.getURL.href);

                                this.title.update({
                                    category: item,
                                    all: Object.keys(this.root.categoriesData[item]["data"]).length
                                });

                                for (let i in itemList) {
                                    try {
                                        if (itemList[i] === el) {
                                            itemList[i].classList.add("menu_block_content_item_active");
                                        } else {
                                            itemList[i].classList.remove("menu_block_content_item_active");
                                        }
                                    } catch {
                                    }
                                }

                                headerLists.value = ("Список: " + item);

                                createTable.call(this);
                            }
                        });
                    }));
                } catch {
                }
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

    xhr.open("GET", "_resources/data/languages.json", false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            this.root.languagesData = JSON.parse(xhr.responseText);

            let itemList = [];

            for (let item in this.root.languagesData) {
                try {
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
                                try {
                                    if (itemList[i] === el) {
                                        itemList[i].classList.add("menu_block_content_item_active");
                                    } else {
                                        itemList[i].classList.remove("menu_block_content_item_active");
                                    }
                                } catch {
                                }
                            }
                        }

                        el.addEventListener("click", () => {
                            if (this.root.languagesData[item] !== localStorage.getItem("mlplist_language")) {
                                this.loading.style.display = "flex";

                                localStorage.setItem("mlplist_language", this.root.languagesData[item]);

                                for (let i in itemList) {
                                    try {
                                        if (itemList[i] === el) {
                                            itemList[i].classList.add("menu_block_content_item_active");
                                        } else {
                                            itemList[i].classList.remove("menu_block_content_item_active");
                                        }
                                    } catch {
                                    }
                                }

                                headerLanguages.value = ("Язык: " + item);

                                loadLanguageFile.call(this);
                                createTable.call(this);
                                createFilterMenu.call(this);
                            }
                        });
                    }));
                } catch {
                }
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
        this.loading.style.display = "flex";

        if (filterAvailableTrue.checked) {
            filterAvailableFalse.checked = false;

            this.root.filter.available = true;
        } else {
            this.root.filter.available = null;
        }

        createTable.call(this);
    });

    filterAvailableFalse.addEventListener("change", () => {
        this.loading.style.display = "flex";

        if (filterAvailableFalse.checked) {
            filterAvailableTrue.checked = false;

            this.root.filter.available = false;
        } else {
            this.root.filter.available = null;
        }

        createTable.call(this);
    });

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "_resources/data/mapzones.json", false);

    xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
            let mapzones = JSON.parse(xhr.responseText);
            let content = document.getElementById("menu_filter_content");

            content.innerHTML = "";

            for (let item in mapzones) {
                try {
                    content.appendChild(createElement("label", {
                        class: "menu_block_content_item"
                    }, (el) => {
                        el.appendChild(createElement("input", {
                            class: "menu_filter_input",
                            type: "checkbox"
                        }, (el2) => {
                            el2.addEventListener("change", () => {
                                this.loading.style.display = "flex";

                                if (el2.checked) {
                                    this.root.filter.sity = this.root.filter.sity.concat(mapzones[item]);
                                } else {
                                    mapzones[item].forEach((element) => {
                                        try {
                                            let pos = this.root.filter.sity.indexOf(element);

                                            this.root.filter.sity.splice(pos, 1);
                                        } catch {
                                        }
                                    });
                                }

                                createTable.call(this);
                            });
                        }));

                        el.appendChild(createElement("span", {}, (el2) => {
                            el2.innerText = titleCase.call(this, this.root.langData[item]);
                        }));
                    }));
                } catch {
                }
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
                this.loading.style.display = "flex";

                this.getURL.searchParams.delete("user");

                history.pushState(null, null, this.getURL.href);

                menuUser.style.display = "none";

                loadUserData.call(this);
                createTable.call(this);
            });

            document.getElementById("menu_user_logout").addEventListener("click", () => {
                this.loading.style.display = "flex";

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
                    "password": password_old
                });

                if (user === null) {
                    createMessage.call(this, "error", "Ошибка соединения! Попробуйте еще раз...");

                    return null;
                }

                if (user) {
                    if (updateOne.call(this, {
                        "_id": localStorage.getItem("mlplist_user"),
                        "password": password_old
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
                } else {
                    createMessage.call(this, "alert", "Старый пароль неверный!");
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
                                            "item",
                                            "collection"
                                        ].includes(name);
                                    }
                                });

                                let saveData = parser.parse(reader.result.toString());

                                let parseData = {};

                                for (let cat in this.root.categoriesData) {
                                    try {
                                        let page = this.root.categoriesData[cat]["page"];

                                        let dataList = [];

                                        for (let item in this.root.categoriesData[cat]["data"]) {
                                            try {
                                                dataList.push(this.root.categoriesData[cat]["data"][item]["id"]);
                                            } catch {
                                            }
                                        }

                                        if (page === "profileavatar") {
                                            try {
                                                saveData["mlp_save"]["playerdata"]["profileavatarselection"]["profileavataritemidowned"].forEach((element) => {
                                                    try {
                                                        if (!(page in parseData)) {
                                                            parseData[page] = [];
                                                        }

                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                            parseData[page].push(element["@_id"]);
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }
                                        }

                                        if (page === "profileavatarframe") {
                                            try {
                                                saveData["mlp_save"]["playerdata"]["profileavatarselection"]["profileavatarframeitemidowned"].forEach((element) => {
                                                    try {
                                                        if (!(page in parseData)) {
                                                            parseData[page] = [];
                                                        }

                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                            parseData[page].push(element["@_id"]);
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }
                                        }

                                        if (page === "playercardbackground") {
                                            try {
                                                saveData["mlp_save"]["playerdata"]["playercard"]["playercardbackgrounditemidowned"].forEach((element) => {
                                                    try {
                                                        if (!(page in parseData)) {
                                                            parseData[page] = [];
                                                        }

                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                            parseData[page].push(element["@_id"]);
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }
                                        }

                                        if (page === "playercardbackgroundframe") {
                                            try {
                                                saveData["mlp_save"]["playerdata"]["playercard"]["playercardbackgroundframeitemidowned"].forEach((element) => {
                                                    try {
                                                        if (!(page in parseData)) {
                                                            parseData[page] = [];
                                                        }

                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                            parseData[page].push(element["@_id"]);
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }
                                        }

                                        if (page === "playercardcutiemark") {
                                            try {
                                                saveData["mlp_save"]["playerdata"]["playercard"]["playercardcutiemarkitemidowned"].forEach((element) => {
                                                    try {
                                                        if (!(page in parseData)) {
                                                            parseData[page] = [];
                                                        }

                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                            parseData[page].push(element["@_id"]);
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }
                                        }

                                        if (page === "theme") {
                                            try {
                                                saveData["mlp_save"]["playerdata"]["themes"]["ownedtheme"].forEach((element) => {
                                                    try {
                                                        if (!(page in parseData)) {
                                                            parseData[page] = [];
                                                        }

                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                            parseData[page].push(element["@_id"]);
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }
                                        }

                                        if (page === "path") {
                                            try {
                                                saveData["mlp_save"]["playerdata"]["roadbuildingpermit"]["ownedrbp"].forEach((element) => {
                                                    try {
                                                        if (!(page in parseData)) {
                                                            parseData[page] = [];
                                                        }

                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                            parseData[page].push(element["@_id"]);
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }
                                        }

                                        if (page === "pony") {
                                            try {
                                                saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((element) => {
                                                    try {
                                                        if (element["@_id"].startsWith("Pony_")) {
                                                            if (!(page in parseData)) {
                                                                parseData[page] = [];
                                                            }

                                                            if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                parseData[page].push(element["@_id"]);
                                                            }
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }

                                            try {
                                                saveData["mlp_save"]["mapzone"].forEach((zone) => {
                                                    try {
                                                        zone["gameobjects"]["pony_objects"]["object"].forEach((element) => {
                                                            try {
                                                                if (!(page in parseData)) {
                                                                    parseData[page] = [];
                                                                }

                                                                if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                    parseData[page].push(element["@_id"]);
                                                                }
                                                            } catch {
                                                            }
                                                        });
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }

                                            try {
                                                saveData["mlp_save"]["playerdata"]["ownedalterformofpony"]["altpony"].forEach((element) => {
                                                    try {
                                                        if (!(page in parseData)) {
                                                            parseData[page] = [];
                                                        }

                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                            parseData[page].push(element["@_id"]);
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }
                                        }

                                        if (page === "pony_house") {
                                            try {
                                                saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((element) => {
                                                    try {
                                                        if (element["@_id"].startsWith("House_")) {
                                                            if (!(page in parseData)) {
                                                                parseData[page] = [];
                                                            }

                                                            if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                parseData[page].push(element["@_id"]);
                                                            }
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }

                                            try {
                                                saveData["mlp_save"]["mapzone"].forEach((zone) => {
                                                    try {
                                                        zone["gameobjects"]["pony_house_objects"]["object"].forEach((element) => {
                                                            try {
                                                                if (!(page in parseData)) {
                                                                    parseData[page] = [];
                                                                }

                                                                if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                    parseData[page].push(element["@_id"]);
                                                                }
                                                            } catch {
                                                            }
                                                        });
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }
                                        }

                                        if (page === "ponypet") {
                                            try {
                                                saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((element) => {
                                                    try {
                                                        if (element["@_id"].startsWith("Pet_")) {
                                                            if (!(page in parseData)) {
                                                                parseData[page] = [];
                                                            }

                                                            if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                parseData[page].push(element["@_id"]);
                                                            }
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }

                                            try {
                                                saveData["mlp_save"]["mapzone"].forEach((zone) => {
                                                    try {
                                                        zone["gameobjects"]["pony_objects"]["object"].forEach((pony) => {
                                                            try {
                                                                pony["pet"]["ownpet"].forEach((element) => {
                                                                    try {
                                                                        if (!(page in parseData)) {
                                                                            parseData[page] = [];
                                                                        }

                                                                        if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                            parseData[page].push(element["@_id"]);
                                                                        }
                                                                    } catch {
                                                                    }
                                                                });
                                                            } catch {
                                                            }
                                                        });
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }

                                            try {
                                                saveData["mlp_save"]["playerdata"]["storage"]["storeditem"].forEach((stored) => {
                                                    try {
                                                        stored["pet"]["ownpet"].forEach((element) => {
                                                            try {
                                                                if (!(page in parseData)) {
                                                                    parseData[page] = [];
                                                                }

                                                                if (!parseData[page].includes(element["@_id"]) && dataList.includes(element["@_id"])) {
                                                                    parseData[page].push(element["@_id"]);
                                                                }
                                                            } catch {
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
                                                let ponysetData = this.root.categoriesData[cat]["data"];

                                                let boughtedList = [];

                                                saveData["mlp_save"]["ponypartsdata"]["boughtedlist"]["item"].forEach((element) => {
                                                    try {
                                                        if (!boughtedList.includes(element["@_id"])) {
                                                            boughtedList.push(element["@_id"]);
                                                        }
                                                    } catch {
                                                    }
                                                });

                                                for (let set in ponysetData) {
                                                    try {
                                                        if (ponysetData[set]["parts"].every((element) => {
                                                            return boughtedList.includes(element);
                                                        })) {
                                                            if (!(page in parseData)) {
                                                                parseData[page] = [];
                                                            }

                                                            parseData[page].push(ponysetData[set]["id"]);
                                                        }
                                                    } catch {
                                                    }
                                                }
                                            } catch {
                                            }
                                        }

                                        if (page === "collection") {
                                            try {
                                                saveData["mlp_save"]["collectiondata"]["completedcollectionlist"]["collection"].forEach((element) => {
                                                    try {
                                                        if (!(page in parseData)) {
                                                            parseData[page] = [];
                                                        }

                                                        if (!parseData[page].includes(element["@_collectionid"]) && dataList.includes(element["@_collectionid"])) {
                                                            parseData[page].push(element["@_collectionid"]);
                                                        }
                                                    } catch {
                                                    }
                                                });
                                            } catch {
                                            }
                                        }
                                    } catch {
                                    }
                                }

                                let insertData = {};

                                importData.innerHTML = "";

                                if (Object.keys(parseData).length > 0) {
                                    for (let item in this.root.categoriesData) {
                                        try {
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
                                        } catch {
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
                                                    this.loading.style.display = "flex";

                                                    importData.innerHTML = "";
                                                    savefile.value = null;

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
                } else {
                    importData.innerHTML = "";
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

export function createSortMenu() {
    let headerSort = document.getElementById("header_sort");
    let menuSort = document.getElementById("menu_sort");

    headerSort.addEventListener("click", () => {
        menuSort.style.display = "flex";
    });

    menuSort.addEventListener("click", (event) => {
        if (event.target === menuSort) {
            menuSort.style.display = "none";
        }
    });

    document.getElementById("menu_sort_close").addEventListener("click", () => {
        menuSort.style.display = "none";
    });

    let sortIndexTrue = document.getElementById("sort_index_true");
    let sortIndexFalse = document.getElementById("sort_index_false");

    let sortNameTrue = document.getElementById("sort_name_true");
    let sortNameFalse = document.getElementById("sort_name_false");

    sortIndexTrue.addEventListener("change", () => {
        this.loading.style.display = "flex";

        this.root.sorts.name = null;

        if (sortIndexTrue.checked) {
            this.root.sorts.reverse = false;
        }

        createTable.call(this);
    });

    sortIndexFalse.addEventListener("change", () => {
        this.loading.style.display = "flex";

        this.root.sorts.name = null;

        if (sortIndexFalse.checked) {
            this.root.sorts.reverse = true;
        }

        createTable.call(this);
    });

    sortNameTrue.addEventListener("change", () => {
        this.loading.style.display = "flex";

        this.root.sorts.reverse = false;

        if (sortNameTrue.checked) {
            this.root.sorts.name = true;
        }

        createTable.call(this);
    });

    sortNameFalse.addEventListener("change", () => {
        this.loading.style.display = "flex";

        this.root.sorts.reverse = false;

        if (sortNameFalse.checked) {
            this.root.sorts.name = false;
        }

        createTable.call(this);
    });
}

export function createStyleMenu() {
    let headerStyle = document.getElementById("header_style");
    let menuStyle = document.getElementById("menu_style");

    headerStyle.addEventListener("click", () => {
        menuStyle.style.display = "flex";
    });

    menuStyle.addEventListener("click", (event) => {
        if (event.target === menuStyle) {
            menuStyle.style.display = "none";
        }
    });

    document.getElementById("menu_style_close").addEventListener("click", () => {
        menuStyle.style.display = "none";
    });

    let menuStyleTrue = document.getElementById("menu_style_true");
    let menuStyleFalse = document.getElementById("menu_style_false");

    let content = document.getElementById("content");

    menuStyleTrue.addEventListener("change", () => {
        if (menuStyleTrue.checked) {
            content.setAttribute("line", "false");
        }
    });

    menuStyleFalse.addEventListener("change", () => {
        if (menuStyleFalse.checked) {
            content.setAttribute("line", "true");
        }
    });
}
